'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MagicWandIcon, CheckIcon, CheckCircledIcon, LockClosedIcon } from '@radix-ui/react-icons';
import { Bold, Italic, List, Code2, Eye, Pen, Briefcase, Settings2, MapPin, CircleDollarSign } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { api } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function JobAssessmentReview() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  
  const [job, setJob] = useState<any>(null);
  const [assessment, setAssessment] = useState<{scenario_prompt: string, hidden_prompt: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [promptValue, setPromptValue] = useState('');
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [activeTab, setActiveTab] = useState<'assessment' | 'details'>('assessment');

  // Job Details Form State
  const [jobForm, setJobForm] = useState({
    title: '',
    location: '',
    salary_range: '',
    description: '',
    expected_outcomes: '',
    specific_skills: ''
  });

  const insertFormat = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('scenario-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = promptValue;
    const selectedText = text.substring(start, end);
    
    const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
    setPromptValue(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    let isMounted = true;

    const fetchInitialJob = async () => {
      try {
        const jobRes = await api.get(`/jobs/${jobId}`);
        if (isMounted) {
          setJob(jobRes);
          setJobForm({
            title: jobRes.title || '',
            location: jobRes.location || '',
            salary_range: jobRes.salary_range || '',
            description: jobRes.description || '',
            expected_outcomes: jobRes.expected_outcomes || '',
            specific_skills: jobRes.specific_skills || ''
          });
        }
      } catch (err: any) {
        if (err.message && err.message.includes('403')) {
          router.push('/login');
        }
        console.error(err);
      }
    };
    
    fetchInitialJob();
    return () => {
      isMounted = false;
    };
  }, [jobId, router]);

  useEffect(() => {
    let isMounted = true;
    let interval: any;

    const fetchAssessment = async () => {
      try {
        const assessmentRes = await api.get(`/assessment/job/${jobId}`);
        if (isMounted) {
          setAssessment(assessmentRes);
          // Set prompt value only on first load so user edits aren't wiped
          setPromptValue((prev) => prev || assessmentRes.scenario_prompt);
          setLoading(false);
          if (interval) clearInterval(interval);
        }
      } catch (err) {
        // Assessment not ready yet
        if (isMounted && !interval) {
          interval = setInterval(fetchAssessment, 3000);
        }
      }
    };

    fetchAssessment();

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [jobId]);

  const handleSaveAssessment = async () => {
    setSaving(true);
    try {
      await api.put(`/assessment/job/${jobId}`, { scenario_prompt: promptValue });
      toast.success("Assessment saved successfully!");
    } catch (err) {
      toast.error("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveJobDetails = async () => {
    setSaving(true);
    try {
      await api.put(`/jobs/${jobId}`, jobForm);
      setJob({ ...job, ...jobForm });
      toast.success("Job details updated successfully!");
    } catch (err) {
      toast.error("Failed to update job details.");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = () => {
    if (!job?.magic_link_token) return;
    const link = `${window.location.origin}/candidate/apply/${job.magic_link_token}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Magic link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <Toaster position="top-right" />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-brand-secondary mb-2 flex items-center gap-3">
            {job?.title || 'Job Overview'}
            <span className="px-3 py-1 rounded-md bg-green-50 border border-green-200 text-green-700 text-xs font-bold uppercase tracking-widest leading-none">Active</span>
          </h1>
          <p className="text-brand-gray-dark text-base md:text-lg">
            Manage job metadata and the AI assessment scenario.
          </p>
        </div>
        
        {job?.magic_link_token && (
          <button 
            onClick={handleCopyLink}
            className="w-full md:w-auto flex items-center justify-center gap-2 text-sm font-bold bg-brand-white border border-brand-gray-light px-5 py-2.5 rounded-xl hover:border-brand-primary hover:text-brand-primary transition-colors shadow-sm text-brand-secondary"
          >
            {copied ? <CheckCircledIcon className="w-5 h-5 text-green-500" /> : <LockClosedIcon className="w-5 h-5" />}
            {copied ? 'Copied Magic Link!' : 'Copy Magic Link'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-brand-gray-light/30 pb-px">
        <button
          onClick={() => setActiveTab('assessment')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'assessment' 
              ? 'border-brand-primary text-brand-primary' 
              : 'border-transparent text-brand-gray-dark hover:text-brand-secondary hover:border-brand-gray-light'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          Assessment Setup
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'details' 
              ? 'border-brand-primary text-brand-primary' 
              : 'border-transparent text-brand-gray-dark hover:text-brand-secondary hover:border-brand-gray-light'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Job Details
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'assessment' && (
          <motion.div
            key="assessment"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {!assessment ? (
              <div className="bg-brand-white rounded-2xl p-16 text-center flex flex-col items-center justify-center border-dashed border-2 border-brand-gray-light/40">
                <div className="w-16 h-16 rounded-full bg-brand-gray-light/10 border border-brand-gray-light/20 flex items-center justify-center mb-5">
                  <div className="w-6 h-6 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-xl font-display font-bold text-brand-secondary mb-2">Generating Micro-Simulation...</h3>
                <p className="text-brand-gray-dark text-sm max-w-sm leading-relaxed">
                  The AI is analyzing your expected outcomes and specific skills to craft a highly contextual real-world scenario. This may take a few seconds.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-brand-white p-6 rounded-2xl border border-brand-gray-light/30 shadow-sm">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                        <h3 className="font-display font-bold text-brand-secondary flex items-center gap-2">
                          <div className="p-1.5 bg-brand-accent/20 text-brand-secondary rounded-lg">
                            <MagicWandIcon className="w-4 h-4" />
                          </div>
                          AI-Generated Scenario Prompt
                        </h3>
                        
                        <div className="flex bg-brand-gray-light/10 p-1 rounded-lg border border-brand-gray-light/20">
                          <button
                            onClick={() => setViewMode('edit')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'edit' ? 'bg-brand-white text-brand-secondary shadow-sm' : 'text-brand-gray-dark hover:text-brand-secondary'}`}
                          >
                            <Pen className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => setViewMode('preview')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'preview' ? 'bg-brand-white text-brand-secondary shadow-sm' : 'text-brand-gray-dark hover:text-brand-secondary'}`}
                          >
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </button>
                        </div>
                      </div>

                      {viewMode === 'edit' ? (
                        <div className="border border-brand-gray-light rounded-xl overflow-hidden focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-all">
                          <div className="bg-brand-gray-light/10 border-b border-brand-gray-light px-3 py-2 flex items-center gap-2">
                            <button onClick={() => insertFormat('**', '**')} className="p-1.5 text-brand-gray-dark hover:text-brand-secondary hover:bg-brand-gray-light/20 rounded transition-colors" title="Bold">
                              <Bold className="w-4 h-4" />
                            </button>
                            <button onClick={() => insertFormat('*', '*')} className="p-1.5 text-brand-gray-dark hover:text-brand-secondary hover:bg-brand-gray-light/20 rounded transition-colors" title="Italic">
                              <Italic className="w-4 h-4" />
                            </button>
                            <div className="w-px h-5 bg-brand-gray-light/50 mx-1" />
                            <button onClick={() => insertFormat('- ')} className="p-1.5 text-brand-gray-dark hover:text-brand-secondary hover:bg-brand-gray-light/20 rounded transition-colors" title="Bullet List">
                              <List className="w-4 h-4" />
                            </button>
                            <button onClick={() => insertFormat('```\n', '\n```')} className="p-1.5 text-brand-gray-dark hover:text-brand-secondary hover:bg-brand-gray-light/20 rounded transition-colors" title="Code Block">
                              <Code2 className="w-4 h-4" />
                            </button>
                          </div>
                          <textarea
                            id="scenario-editor"
                            value={promptValue}
                            onChange={(e) => setPromptValue(e.target.value)}
                            className="w-full h-[300px] md:h-[450px] p-4 md:p-5 bg-brand-white text-sm text-brand-secondary font-mono leading-relaxed focus:outline-none resize-y"
                            placeholder="Write your scenario in Markdown format..."
                          />
                        </div>
                      ) : (
                        <div className="w-full h-[355px] md:h-[505px] p-4 md:p-6 bg-brand-white border border-brand-gray-light rounded-xl overflow-y-auto">
                          <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-a:text-brand-primary prose-headings:font-display prose-headings:font-bold prose-headings:text-brand-secondary">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {promptValue || '*No content to preview.*'}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                      
                      <p className="text-xs text-brand-gray-dark mt-4">
                        This text will be presented to candidates exactly as formatted here. You can tweak the questions or use Markdown to format it.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-brand-white p-6 rounded-2xl border border-brand-gray-light/30 shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl opacity-50 -mr-10 -mt-10 transition-transform group-hover:scale-150" />
                      <h3 className="font-display font-bold text-brand-secondary mb-3 flex items-center gap-2 relative z-10">
                        <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
                          <LockClosedIcon className="w-4 h-4" />
                        </div>
                        Anti-Cheat Protection
                      </h3>
                      <p className="text-sm text-brand-gray-dark leading-relaxed mb-5 relative z-10">
                        The Scooby-Doo method (prompt injection trap) has been armed. If a candidate copies the scenario into ChatGPT, the AI will secretly trigger a flagged word.
                      </p>
                      <div className="bg-brand-white border border-red-200 rounded-xl p-4 shadow-sm relative z-10">
                        <span className="text-[10px] uppercase font-bold text-red-500 tracking-wider block mb-1">Trigger Word</span>
                        <span className="font-mono text-base font-bold text-red-700">{assessment.hidden_prompt}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <Link href="/recruiter/jobs">
                    <button className="px-6 py-3 rounded-xl font-bold text-brand-gray-dark hover:text-brand-secondary hover:bg-brand-gray-light/20 transition-colors text-sm">
                      Back to Roles
                    </button>
                  </Link>
                  <button 
                    onClick={handleSaveAssessment}
                    disabled={saving}
                    className="px-6 py-3 rounded-xl font-bold bg-brand-primary hover:bg-brand-dark-teal text-brand-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-70 text-sm"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-brand-white/30 border-t-brand-white rounded-full animate-spin" />
                    ) : (
                      <CheckIcon className="w-4 h-4" />
                    )}
                    <span>Save Assessment</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-brand-white p-8 rounded-2xl border border-brand-gray-light/30 shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-brand-secondary mb-2">Job Title</label>
                  <input
                    type="text"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
                    className="w-full px-4 py-3 border border-brand-gray-light rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-brand-secondary mb-2">Location</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-brand-gray-dark" />
                    </div>
                    <input
                      type="text"
                      value={jobForm.location}
                      onChange={(e) => setJobForm({...jobForm, location: e.target.value})}
                      className="w-full pl-11 pr-4 py-3 border border-brand-gray-light rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-brand-secondary mb-2">Salary Range</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <CircleDollarSign className="h-5 w-5 text-brand-gray-dark" />
                    </div>
                    <input
                      type="text"
                      value={jobForm.salary_range}
                      onChange={(e) => setJobForm({...jobForm, salary_range: e.target.value})}
                      className="w-full pl-11 pr-4 py-3 border border-brand-gray-light rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-brand-secondary mb-2">Job Description</label>
                <textarea
                  value={jobForm.description}
                  onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                  className="w-full h-32 px-4 py-3 border border-brand-gray-light rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all resize-y"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-brand-secondary mb-2">Expected Outcomes (KPIs)</label>
                <textarea
                  value={jobForm.expected_outcomes}
                  onChange={(e) => setJobForm({...jobForm, expected_outcomes: e.target.value})}
                  className="w-full h-32 px-4 py-3 border border-brand-gray-light rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all resize-y"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-brand-secondary mb-2">Specific Skills</label>
                <textarea
                  value={jobForm.specific_skills}
                  onChange={(e) => setJobForm({...jobForm, specific_skills: e.target.value})}
                  className="w-full h-24 px-4 py-3 border border-brand-gray-light rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all resize-y"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-8 mt-8 border-t border-brand-gray-light/30">
              <Link href="/recruiter/jobs">
                <button className="px-6 py-3 rounded-xl font-bold text-brand-gray-dark hover:text-brand-secondary hover:bg-brand-gray-light/20 transition-colors text-sm">
                  Cancel
                </button>
              </Link>
              <button 
                onClick={handleSaveJobDetails}
                disabled={saving}
                className="px-6 py-3 rounded-xl font-bold bg-brand-secondary hover:bg-brand-dark-teal text-brand-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-70 text-sm"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-brand-white/30 border-t-brand-white rounded-full animate-spin" />
                ) : (
                  <CheckIcon className="w-4 h-4" />
                )}
                <span>Save Job Details</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
