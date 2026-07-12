'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function JobDetail() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.job_id as string;

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/jobs/${jobId}`),
      api.get('/applications').catch(() => []),
    ])
      .then(([jobData, appsData]) => {
        setJob(jobData);
        if (Array.isArray(appsData)) {
          setAlreadyApplied(appsData.some((a: any) => String(a.job_id) === String(jobId)));
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [jobId, router]);

  const handleApply = async () => {
    setApplying(true);
    setError('');
    try {
      const app = await api.post(`/assessment/${jobId}/apply`);
      router.push(`/candidate/test/${app.id}`);
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Try again.');
      setApplying(false);
    }
  };

  const skills: string[] = job?.required_skills
    ? typeof job.required_skills === 'string'
      ? job.required_skills.split(',').map((s: string) => s.trim()).filter(Boolean)
      : job.required_skills
    : [];

  const outcomeLines: string[] = job?.expected_outcomes
    ? job.expected_outcomes.split('\n').filter((l: string) => l.trim())
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Job not found.</p>
          <Link href="/candidate/dashboard" className="text-sm underline text-black">
            Back to jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#111' }}
    >
      {/* ── Top nav ─────────────────────────────────────── */}
      <header className="border-b border-gray-100 sticky top-0 bg-white z-40">
        <div className="max-w-5xl mx-auto px-6 h-12 flex items-center gap-3">
          <Link
            href="/candidate/dashboard"
            className="text-xs text-gray-400 hover:text-black transition-colors flex items-center gap-1.5"
          >
            ← Back to jobs
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">

          {/* ── LEFT: Job info ────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {/* Company + Title */}
            <div>
              <div className="w-12 h-12 border border-gray-200 flex items-center justify-center mb-4 bg-gray-50">
                <span className="text-lg font-bold text-gray-400">S</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-black mb-1">
                {job.title}
              </h1>
              <p className="text-gray-500 text-sm mb-4">SkillLens Platform</p>

              {/* Meta tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {job.location && (
                  <span className="text-[12px] border border-gray-200 text-gray-600 px-3 py-1.5">
                    📍 {job.location}
                  </span>
                )}
                {job.job_type && (
                  <span className="text-[12px] border border-gray-200 text-gray-600 px-3 py-1.5">
                    {job.job_type}
                  </span>
                )}
                {job.salary_range && (
                  <span className="text-[12px] border border-gray-200 text-gray-600 px-3 py-1.5">
                    {job.salary_range}
                  </span>
                )}
              </div>

              {/* Primary CTA row (visible on mobile) */}
              <div className="flex items-center gap-3 lg:hidden pb-6 border-b border-gray-100">
                <button
                  onClick={!alreadyApplied ? handleApply : undefined}
                  disabled={applying || alreadyApplied}
                  className="flex items-center gap-2 bg-black text-white text-sm font-semibold px-5 py-2.5 hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {applying ? 'Starting…' : alreadyApplied ? '✓ Applied' : 'Start Assessment →'}
                </button>
              </div>

              {error && (
                <p className="mt-3 text-sm text-red-600">{error}</p>
              )}
            </div>

            {/* About this role */}
            {outcomeLines.length > 0 && (
              <div>
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                  About this role
                </h2>
                <div className="space-y-2 text-sm text-gray-600 leading-relaxed pl-4 border-l-2 border-gray-100">
                  {outcomeLines.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Assessment criteria */}
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                What you&apos;ll be assessed on
              </h2>
              <ul className="space-y-3">
                {[
                  'Problem understanding and decomposition',
                  'Solution approach and reasoning quality',
                  'Logic and execution clarity',
                  'Written communication quality',
                  'Response depth and relevance to the role',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="mt-0.5 text-black shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div>
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                  Required skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-[12px] border border-gray-200 text-gray-700 px-3 py-1.5 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* About SkillLens */}
            <div className="border-t border-gray-100 pt-8">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                About SkillLens
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                SkillLens is an evidence-based hiring platform that replaces résumé
                screening with AI-proctored micro-simulations. Every candidate is evaluated
                on actual performance, not self-reported credentials.
              </p>
            </div>
          </motion.div>

          {/* ── RIGHT: Sticky CTA card ────────────────────── */}
          <div className="hidden lg:block">
            <div className="sticky top-20 border border-gray-200 p-6 space-y-6">
              {/* Main CTA */}
              <button
                onClick={!alreadyApplied ? handleApply : undefined}
                disabled={applying || alreadyApplied}
                className="w-full flex items-center justify-center gap-2 bg-black text-white text-sm font-semibold py-3 hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {applying ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Starting…
                  </>
                ) : alreadyApplied ? (
                  '✓ Already Applied'
                ) : (
                  'Start Assessment →'
                )}
              </button>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              {/* Quick facts */}
              <div className="space-y-3 border-t border-gray-100 pt-5 text-sm text-gray-500">
                <div className="flex items-center gap-3">
                  <span className="text-gray-300 shrink-0">⏱</span>
                  ~15 minutes to complete
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-300 shrink-0">🔒</span>
                  AI-proctored session
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-300 shrink-0">📄</span>
                  No resume required
                </div>
              </div>

              {/* Steps */}
              <div className="border-t border-gray-100 pt-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-black mb-4">
                  What happens next
                </p>
                <ol className="space-y-3">
                  {[
                    'You start the 15-min AI assessment',
                    'Our AI analyzes your response',
                    'Recruiter reviews your evidence score',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-5 h-5 shrink-0 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-400">
                        {i + 1}
                      </span>
                      <span className="text-[12px] text-gray-500 leading-snug pt-0.5">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Your response is confidential and only visible to the hiring team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
