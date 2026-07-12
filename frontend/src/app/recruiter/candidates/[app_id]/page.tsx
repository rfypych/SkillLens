'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ShieldAlert, CheckCircle, Play, Pause,
  SkipBack, SkipForward, MessageSquare, AlertTriangle, Clock, Sparkles,
  BarChart2, FileText, Video, Gauge, Archive
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '@/lib/api';
import clsx from 'clsx';

type Tab = 'analysis' | 'replay' | 'transcript';
const SPEED_OPTIONS = [0.5, 1, 2, 5];

export default function CandidateForensicReport() {
  const params = useParams();
  const router = useRouter();
  const appId = params.app_id as string;

  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>('analysis');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await api.put(`/applications/${appId}`, { status: newStatus });
      setApp((prev: any) => ({ ...prev, status: newStatus }));
      toast.success(`Candidate status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm('Are you sure you want to archive this candidate? They will be removed from your active database.')) return;
    setUpdatingStatus(true);
    try {
      await api.delete(`/applications/${appId}`);
      toast.success('Candidate archived successfully');
      router.push('/recruiter/candidates');
    } catch {
      toast.error('Failed to archive candidate');
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {


    const fetchApp = async () => {
      try {
        const data = await api.get(`/applications/${appId}`);
        setApp(data);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };

    fetchApp();
    const interval = setInterval(() => {
      setApp((prev: any) => {
        if (prev?.assessment_results?.length > 0) {
          const latest = prev.assessment_results[prev.assessment_results.length - 1];
          if (latest.claim_vs_evidence_label === 'Pending AI Evaluation') fetchApp();
        }
        return prev;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [appId, router]);

  // Replay logic
  let replayHistory: { time: number; chat: any[]; input: string }[] = [];
  const result = app?.assessment_results?.[app.assessment_results.length - 1] ?? null;
  if (result?.replay_history) {
    try { replayHistory = JSON.parse(result.replay_history); } catch { }
  }

  // Auto-scroll chat to bottom as replay progresses
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [replayIndex]);

  useEffect(() => {
    if (isPlaying && replayHistory.length > 0) {
      if (replayIndex >= replayHistory.length - 1) {
        setIsPlaying(false);
        return;
      }
      const rawDelta = replayHistory[replayIndex + 1].time - replayHistory[replayIndex].time;
      // Apply speed multiplier; no hard 2-second cap to preserve true thinking pauses
      const delay = Math.min(Math.max(rawDelta / playbackSpeed, 10), 60000);
      const timer = setTimeout(() => {
        setReplayIndex(r => r + 1);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, replayIndex, replayHistory.length, playbackSpeed]);

  let chatTranscript: any[] = [];
  if (result?.candidate_answer) {
    try { chatTranscript = JSON.parse(result.candidate_answer); }
    catch { chatTranscript = [{ role: 'user', content: result.candidate_answer }]; }
  }

  let keystrokeMetrics = { total_chars: 0, backspace_count: 0, backspace_ratio: 0.05 };
  if (result?.keystroke_metrics) {
    try { keystrokeMetrics = JSON.parse(result.keystroke_metrics); } catch { }
  }
  const isTranscribing = keystrokeMetrics.total_chars > 300 && keystrokeMetrics.backspace_ratio < 0.02;

  const getLabelStyle = (label: string | null, isCheat: boolean) => {
    if (isCheat || label?.includes('Fabricated')) return 'bg-red-50 text-red-700 border-red-200';
    if (label?.includes('Hidden Gem')) return 'bg-brand-accent/20 text-brand-secondary border-brand-accent/50';
    if (label?.includes('Highly Validated')) return 'bg-green-50 text-green-700 border-green-200';
    return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  };

  const focusScore = Math.max(0, 100 - (result?.tab_switches ?? 0) * 10);
  const authenticityScore = result?.copy_paste_attempts > 0 ? 10 : 100;
  const paceScore = isTranscribing ? 40 : 80;

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'analysis', label: 'AI Analysis', icon: BarChart2 },
    { key: 'replay', label: 'Forensic Replay', icon: Video },
    { key: 'transcript', label: 'Raw Transcript', icon: FileText },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!app) return (
    <div className="p-10 text-center text-red-600 font-bold">Application not found.</div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <Toaster position="top-right" />
      <Link href="/recruiter/candidates" className="inline-flex items-center gap-2 text-sm font-medium text-brand-gray-dark hover:text-brand-secondary transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Candidates
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-display font-bold text-brand-secondary">{app.user?.full_name}</h1>
            {result && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-bold border ${getLabelStyle(result.claim_vs_evidence_label, result.ai_cheating_detected)}`}>
                {result.ai_cheating_detected ? <ShieldAlert className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                {result.ai_cheating_detected ? 'Fabricated' : result.claim_vs_evidence_label ?? 'Pending'}
              </span>
            )}
          </div>
          <p className="text-brand-gray-dark font-medium">{app.user?.email} • APP-{appId}</p>
        </div>

        {result && (
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 bg-brand-white p-4 rounded-xl border border-brand-gray-light/30 shadow-sm">
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <label className="text-xs font-bold text-brand-gray-dark uppercase tracking-wider">Candidate Pipeline</label>
              <select
                value={app?.status || 'applied'}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
                className="bg-brand-gray-light/10 border border-brand-gray-light/30 text-brand-secondary text-sm rounded-lg focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5 font-semibold appearance-none cursor-pointer hover:bg-brand-gray-light/20 transition-colors disabled:opacity-50"
              >
                <option value="applied">Applied</option>
                <option value="testing">Testing</option>
                <option value="evaluated">In Review</option>
                <option value="interview">Shortlisted (Interview)</option>
                <option value="hired">Hired</option>
                <option value="rejected">Not Selected</option>
              </select>
            </div>
            
            <button
              onClick={handleArchive}
              disabled={updatingStatus}
              className="mt-5 sm:mt-0 px-3 py-2.5 bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-50 w-full sm:w-auto"
              title="Archive Candidate"
            >
              <Archive className="w-4 h-4" />
              <span className="sm:hidden">Archive</span>
            </button>

            <div className="hidden sm:block w-px h-10 bg-brand-gray-light/30 mx-2" />

            <div className="text-right w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-0 border-brand-gray-light/20 pt-3 sm:pt-0">
              <p className="text-xs font-bold text-brand-gray-dark uppercase tracking-wider mb-1">Evidence Score</p>
              <p className={`text-3xl font-display font-bold ${result.overall_score < 60 ? 'text-red-600' : 'text-brand-secondary'}`}>
                {result.overall_score?.toFixed(0) ?? '-'}<span className="text-lg text-brand-gray-light">/100</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {!result ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-brand-gray-light/40 rounded-2xl bg-brand-white">
          <p className="text-brand-gray-dark font-medium">The candidate has not completed the assessment yet.</p>
        </div>
      ) : (
        /* Main Layout: Content + Right Sidebar Nav */
        <div className="flex flex-col-reverse md:flex-row gap-6 items-start">
          
          {/* Main Content Area */}
          <div className="flex-1 min-w-0 w-full">
            <AnimatePresence mode="wait">
              {activeTab === 'analysis' && (
                <motion.div
                  key="analysis"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {/* Claim vs Evidence */}
                  <div className="bg-brand-white p-6 rounded-2xl border border-brand-gray-light/30 shadow-sm h-full">
                    <h2 className="text-lg font-display font-bold text-brand-secondary mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-brand-primary" />
                      Claim vs Evidence Matrix
                    </h2>
                    <div className="space-y-4">
                      <div className="p-4 bg-brand-gray-light/10 rounded-xl">
                        <p className="text-xs font-bold text-brand-gray-dark uppercase tracking-wider mb-2">AI Evaluation</p>
                        <p className="text-sm font-medium text-brand-secondary">{result.claim_vs_evidence_label ?? 'Pending AI Evaluation'}</p>
                      </div>
                      {result.evaluation_feedback && (
                        <div className={`p-4 rounded-xl border ${result.ai_cheating_detected ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                          <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${result.ai_cheating_detected ? 'text-red-800' : 'text-green-800'}`}>AI Evidence Analysis</p>
                          <p className={`text-sm ${result.ai_cheating_detected ? 'text-red-900' : 'text-green-900'}`}>{result.evaluation_feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Telemetry Gauges */}
                  <div className="bg-brand-white p-6 rounded-2xl border border-brand-gray-light/30 shadow-sm h-full">
                    <h2 className="text-lg font-display font-bold text-brand-secondary mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      Safety Telemetry
                    </h2>
                    <div className="space-y-5">
                      {[
                        { label: 'Focus Preservation', score: focusScore, note: `${result.tab_switches ?? 0} tab switches detected.` },
                        { label: 'Input Authenticity', score: authenticityScore, note: result.copy_paste_attempts > 0 ? `${result.copy_paste_attempts} paste event(s) detected.` : 'No paste events.' },
                        { label: 'Pace Consistency', score: paceScore, note: isTranscribing ? 'Highly erratic: possible transcription.' : 'Normal human rhythm.' },
                      ].map(({ label, score, note }) => (
                        <div key={label}>
                          <div className="flex justify-between text-sm mb-1 font-medium">
                            <span className="text-brand-secondary">{label}</span>
                            <span className={score < 50 ? 'text-red-600' : score < 70 ? 'text-yellow-600' : 'text-green-600'}>{score}%</span>
                          </div>
                          <div className="w-full bg-brand-gray-light/30 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${score < 50 ? 'bg-red-500' : score < 70 ? 'bg-yellow-500' : 'bg-brand-primary'}`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <p className="text-xs text-brand-gray-dark mt-1">{note}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Interview Copilot */}
                  {result.interview_questions && (
                    <div className="md:col-span-2 bg-brand-white p-6 rounded-2xl border border-brand-gray-light/30 shadow-sm">
                      <h2 className="text-lg font-display font-bold text-brand-secondary mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-brand-accent" />
                        AI Interview Copilot
                      </h2>
                      <p className="text-sm text-brand-gray-dark mb-4">Suggested follow-up questions for the face-to-face interview based on forensic analysis:</p>
                      <ul className="space-y-3">
                        {result.interview_questions.split('\n').filter((q: string) => q.trim()).map((q: string, idx: number) => {
                          const clean = q.replace(/^\d+[.)\s]+/, '').replace(/^-\s*/, '').trim();
                          if (!clean) return null;
                          return (
                            <li key={idx} className="p-3 bg-brand-gray-light/10 rounded-lg text-sm font-medium text-brand-secondary flex gap-3">
                              <span className="text-brand-primary font-bold">{idx + 1}.</span>
                              {clean}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'replay' && (
                <motion.div
                  key="replay"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {replayHistory.length > 0 ? (
                    <div className="bg-brand-secondary rounded-2xl border border-brand-dark-teal shadow-xl overflow-hidden flex flex-col h-[60vh] md:h-[70vh]">
                      {/* Replay Header */}
                      <div className="p-3 md:p-4 border-b border-brand-dark-teal flex flex-col sm:flex-row items-start sm:items-center justify-between bg-brand-secondary/90 flex-shrink-0 gap-3 sm:gap-0">
                        <h2 className="text-sm sm:text-base font-display font-bold text-brand-white flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-brand-accent flex-shrink-0" />
                          <span className="whitespace-nowrap">Forensic Replay</span>
                          {isPlaying && (
                            <span className="ml-2 inline-flex items-center gap-1 text-xs font-mono bg-brand-accent/20 text-brand-accent px-2 py-0.5 rounded-full animate-pulse">
                              ● LIVE
                            </span>
                          )}
                        </h2>
                        <div className="flex items-center gap-3">
                          {/* Speed Control */}
                          <div className="flex items-center gap-1 bg-brand-dark-teal/60 rounded-lg p-1">
                            <Gauge className="w-3.5 h-3.5 text-brand-white/50 ml-1" />
                            {SPEED_OPTIONS.map(s => (
                              <button
                                key={s}
                                onClick={() => setPlaybackSpeed(s)}
                                className={clsx(
                                  'px-2 py-1 text-xs font-bold rounded-md transition-colors',
                                  playbackSpeed === s ? 'bg-brand-accent text-brand-secondary' : 'text-brand-white/60 hover:text-brand-white'
                                )}
                              >
                                {s}x
                              </button>
                            ))}
                          </div>
                          <div className="text-brand-white/50 text-xs font-mono">
                            {replayIndex} / {replayHistory.length - 1}
                          </div>
                        </div>
                      </div>

                      {/* Chat Area */}
                      <div className="flex-1 p-6 bg-[#0D151C] overflow-y-auto space-y-5 font-sans">
                        {replayHistory[replayIndex]?.chat?.map((msg: any, idx: number) => (
                          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role !== 'user' && (
                              <div className="w-7 h-7 rounded-lg bg-brand-secondary border border-brand-dark-teal flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                                <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
                              </div>
                            )}
                            <div className={clsx(
                              'max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed',
                              msg.role === 'user'
                                ? 'bg-brand-primary text-brand-white rounded-tr-sm'
                                : 'bg-brand-secondary border border-brand-dark-teal text-brand-white rounded-tl-sm shadow-md'
                            )}>
                              {msg.role !== 'user' ? (
                                <div className="prose prose-invert prose-sm max-w-none">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                </div>
                              ) : msg.content}
                            </div>
                          </div>
                        ))}

                        {/* Live typing bubble */}
                        {replayHistory[replayIndex]?.input && (
                          <div className="flex justify-end">
                            <div className="max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed bg-brand-primary/20 text-brand-white/80 rounded-tr-sm border border-brand-primary/40 border-dashed">
                              {replayHistory[replayIndex]?.input}
                              <span className="w-1.5 h-3.5 bg-brand-accent inline-block align-middle ml-1 animate-pulse" />
                            </div>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Controls */}
                      <div className="p-5 bg-brand-secondary border-t border-brand-dark-teal flex-shrink-0">
                        {/* Scrubber */}
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-xs text-brand-white/40 font-mono w-6 text-right">{replayIndex}</span>
                          <input
                            type="range"
                            min="0"
                            max={replayHistory.length - 1}
                            value={replayIndex}
                            onChange={e => { setReplayIndex(Number(e.target.value)); setIsPlaying(false); }}
                            className="w-full h-1.5 bg-brand-dark-teal rounded-lg appearance-none cursor-pointer accent-brand-accent"
                          />
                          <span className="text-xs text-brand-white/40 font-mono w-6">{replayHistory.length - 1}</span>
                        </div>
                        {/* Play controls */}
                        <div className="flex justify-center items-center gap-5">
                          <button onClick={() => setReplayIndex(0)} className="p-2 text-brand-white/60 hover:text-brand-white hover:bg-brand-dark-teal rounded-full transition-colors">
                            <SkipBack className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-12 h-12 flex items-center justify-center bg-brand-accent text-brand-secondary rounded-full hover:bg-white transition-colors shadow-lg hover:scale-105 transform duration-200"
                          >
                            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                          </button>
                          <button onClick={() => setReplayIndex(replayHistory.length - 1)} className="p-2 text-brand-white/60 hover:text-brand-white hover:bg-brand-dark-teal rounded-full transition-colors">
                            <SkipForward className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-24 text-center border border-brand-gray-light/30 rounded-2xl bg-brand-white shadow-sm">
                      <Video className="w-12 h-12 text-brand-gray-light mx-auto mb-4" />
                      <p className="text-brand-gray-dark font-medium">Replay data is not available for this session.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'transcript' && (
                <motion.div
                  key="transcript"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-brand-white rounded-2xl border border-brand-gray-light/30 shadow-sm overflow-hidden flex flex-col h-[60vh] md:h-[70vh]">
                    {/* Sticky transcript header */}
                    <div className="px-6 py-4 border-b border-brand-gray-light/30 bg-brand-white flex-shrink-0 sticky top-0 z-10">
                      <h2 className="text-base font-display font-bold text-brand-secondary flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand-primary" />
                        Full Interview Transcript
                      </h2>
                      <p className="text-xs text-brand-gray-dark mt-0.5">{chatTranscript.length} messages · {app.user?.full_name}</p>
                    </div>

                    {/* Scrollable transcript body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F7F9F9]">
                      {chatTranscript.length === 0 && (
                        <p className="text-center text-brand-gray-dark text-sm">No transcript available.</p>
                      )}
                      {chatTranscript.map((msg: any, idx: number) => (
                        <div key={idx} className={`flex gap-4 ${msg.role !== 'user' ? '' : 'flex-row-reverse'}`}>
                          <div className={clsx(
                            'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1',
                            msg.role !== 'user' ? 'bg-brand-secondary' : 'bg-brand-primary/10 rounded-full'
                          )}>
                            {msg.role !== 'user'
                              ? <Sparkles className="w-4 h-4 text-brand-accent" />
                              : <span className="text-brand-primary font-bold text-xs">{app.user?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</span>
                            }
                          </div>
                          <div className={`flex-1 ${msg.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                            <div className={clsx(
                              'p-4 rounded-2xl shadow-sm text-sm leading-relaxed max-w-[85%]',
                              msg.role !== 'user'
                                ? 'bg-brand-white rounded-tl-sm border border-brand-gray-light/20 text-brand-secondary'
                                : 'bg-brand-primary text-brand-white rounded-tr-sm'
                            )}>
                              {msg.role !== 'user' ? (
                                <div className="prose prose-sm max-w-none text-brand-secondary">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                </div>
                              ) : msg.content}
                            </div>
                            <span className="text-xs text-brand-gray-dark mt-1.5 mx-2 font-medium">
                              {msg.role === 'user' ? app.user?.full_name : 'AI Proctor'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Sidebar Navigation */}
          <div className="w-full md:w-48 flex-shrink-0 md:sticky md:top-24 mb-6 md:mb-0">
            <p className="text-xs font-bold text-brand-gray-dark uppercase tracking-widest mb-3 px-2 hidden md:block">Sections</p>
            <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={clsx(
                      'flex-shrink-0 flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl text-sm font-semibold transition-all text-left',
                      isActive
                        ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
                        : 'text-brand-gray-dark hover:bg-brand-gray-light/10 hover:text-brand-secondary border border-transparent bg-brand-white md:bg-transparent shadow-sm md:shadow-none'
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Quick stats */}
            {result && (
              <div className="hidden md:block mt-6 p-4 bg-brand-white rounded-xl border border-brand-gray-light/30 shadow-sm space-y-3">
                <p className="text-xs font-bold text-brand-gray-dark uppercase tracking-widest">Quick Stats</p>
                <div>
                  <p className="text-xs text-brand-gray-dark">Tab Switches</p>
                  <p className={clsx('text-lg font-bold', result.tab_switches > 0 ? 'text-red-600' : 'text-brand-primary')}>
                    {result.tab_switches ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-brand-gray-dark">Paste Events</p>
                  <p className={clsx('text-lg font-bold', result.copy_paste_attempts > 0 ? 'text-red-600' : 'text-brand-primary')}>
                    {result.copy_paste_attempts ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-brand-gray-dark">Time Taken</p>
                  <p className="text-lg font-bold text-brand-secondary">
                    {result.time_taken_seconds ? `${Math.round(result.time_taken_seconds / 60)}m` : '-'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
