'use client';

import { motion } from 'framer-motion';
import {
  Briefcase, Code2, CheckCircle2, Clock, ArrowRight, MapPin, CircleDollarSign, ChevronRight, User
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function CandidateDashboard() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingTo, setApplyingTo] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'applications' | 'positions'>('applications');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    Promise.all([
      api.get('/jobs'),
      api.get('/applications')
    ]).then(([jobsData, appsData]) => {
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setApplications(Array.isArray(appsData) ? appsData : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [router]);

  const handleApply = (jobId: number) => {
    router.push(`/candidate/apply/${jobId}`);
  };

  const myAppIds = applications.map(a => a.job_id);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10">

      {/* Compact Greeting Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="bg-brand-secondary rounded-xl px-8 py-5 text-brand-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark-teal/30 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-xl font-display font-bold leading-tight tracking-tight">
            Your Assessment Dashboard
          </h1>
          <p className="text-brand-gray-light text-sm mt-0.5">
            Track your applications and explore open positions.
          </p>
        </div>
        <Link href="/candidate/profile" className="relative z-10 flex-shrink-0 px-4 py-2 bg-brand-primary text-brand-white text-sm font-semibold rounded-lg hover:bg-brand-dark-teal transition-colors flex items-center gap-2">
          <User className="w-4 h-4" />
          Update Profile
        </Link>
      </motion.div>


      {/* Mobile Tabs */}
      <div className="flex lg:hidden bg-brand-white p-1 rounded-xl border border-brand-gray-light/30 shadow-sm">
        <button
          onClick={() => setActiveTab('applications')}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'applications' ? 'bg-brand-primary/10 text-brand-primary' : 'text-brand-gray-dark hover:bg-brand-gray-light/20'}`}
        >
          My Applications
        </button>
        <button
          onClick={() => setActiveTab('positions')}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'positions' ? 'bg-brand-primary/10 text-brand-primary' : 'text-brand-gray-dark hover:bg-brand-gray-light/20'}`}
        >
          Open Positions
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">

        {/* My Applications */}
        <div className={`space-y-6 ${activeTab === 'applications' ? 'block' : 'hidden lg:block'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold text-brand-secondary">My Applications</h2>
              <p className="text-brand-gray-dark mt-1 text-sm">Track your active assessments.</p>
            </div>
          </div>

          {applications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-brand-gray-light/40 rounded-2xl bg-brand-white">
              <Briefcase className="w-10 h-10 text-brand-gray-light mb-3" />
              <p className="text-brand-gray-dark text-sm">No applications yet. Apply to an open position below.</p>
            </div>
          )}

          <div className="space-y-4">
            {applications.map((app, i) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1, ease: 'easeOut' }}
                className="group relative bg-brand-white p-5 rounded-xl border border-brand-gray-light/30 shadow-sm hover:border-brand-gray-light/60 transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      app.status === 'testing' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-green-50 text-green-600'
                    }`}>
                      {app.status === 'testing' ? <Code2 className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-brand-secondary text-lg mb-1">{app.job?.title ?? 'Assessment'}</h3>
                      <div className="flex items-center gap-3 text-xs text-brand-gray-dark font-medium">
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(app.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                    {app.status === 'testing' ? (
                      <Link
                        href={`/candidate/test/${app.id}`}
                        className="w-full sm:w-auto px-5 py-2.5 bg-brand-secondary text-brand-white text-sm font-bold rounded-xl hover:bg-brand-dark-teal transition-colors flex items-center justify-center gap-2"
                      >
                        Take Assessment
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <div className="flex flex-wrap sm:flex-col sm:items-end gap-2 w-full">
                        {app.status === 'evaluated' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border uppercase tracking-wider bg-blue-50 text-blue-700 border-blue-200">
                            <Clock className="w-3.5 h-3.5" /> In Review
                          </span>
                        )}
                        {app.status === 'interview' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border uppercase tracking-wider bg-purple-50 text-purple-700 border-purple-200">
                            <User className="w-3.5 h-3.5" /> Interview
                          </span>
                        )}
                        {app.status === 'hired' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border uppercase tracking-wider bg-green-50 text-green-700 border-green-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Hired
                          </span>
                        )}
                        {app.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border uppercase tracking-wider bg-red-50 text-red-700 border-red-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Not Selected
                          </span>
                        )}
                        {!['testing', 'evaluated', 'interview', 'hired', 'rejected'].includes(app.status) && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border uppercase tracking-wider bg-brand-gray-light/20 text-brand-gray-dark border-brand-gray-light">
                            {app.status}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Open Positions */}
        <div className={`space-y-6 ${activeTab === 'positions' ? 'block' : 'hidden lg:block'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold text-brand-secondary">Open Positions</h2>
              <p className="text-brand-gray-dark mt-1 text-sm">Available roles with AI-proctored assessments.</p>
            </div>
          </div>

          {jobs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-brand-gray-light/40 rounded-2xl bg-brand-white">
              <p className="text-brand-gray-dark text-sm">No open positions available right now. Check back later.</p>
            </div>
          )}

          <div className="space-y-4">
            {jobs.map((job, i) => {
              const hasApplied = myAppIds.includes(job.id);
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, ease: 'easeOut' }}
                  className="group bg-brand-white p-5 rounded-xl border border-brand-gray-light/30 shadow-sm hover:border-brand-gray-light/60 transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-display font-bold text-brand-secondary text-lg mb-1 group-hover:text-brand-primary transition-colors">{job.title}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-brand-gray-light/10 border border-brand-gray-light/20 flex items-center justify-center text-brand-secondary text-xs font-bold font-mono">
                      {job.id}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {job.location && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-gray-light/10 text-brand-gray-dark text-xs font-semibold rounded-lg">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location}
                      </span>
                    )}
                    {job.salary_range && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-gray-light/10 text-brand-gray-dark text-xs font-semibold rounded-lg">
                        <CircleDollarSign className="w-3.5 h-3.5" />
                        {job.salary_range}
                      </span>
                    )}
                    {job.job_type && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-gray-light/10 text-brand-gray-dark text-xs font-semibold rounded-lg">
                        {job.job_type}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-brand-gray-dark mb-6 line-clamp-2 leading-relaxed">{job.expected_outcomes}</p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-brand-gray-light/20">
                    <p className="text-xs font-medium text-brand-gray-dark">
                      <span className="font-bold text-brand-secondary">{job.candidate_count ?? 0}</span> applicants
                    </p>
                    {hasApplied ? (
                      <button disabled className="px-5 py-2 bg-brand-gray-light/20 text-brand-gray-dark text-sm font-bold rounded-lg cursor-not-allowed">
                        Already Applied
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApply(job.id)}
                        disabled={applyingTo === job.id}
                        className="px-5 py-2 bg-brand-white border border-brand-gray-light text-brand-secondary text-sm font-bold rounded-lg hover:border-brand-primary hover:text-brand-primary transition-colors disabled:opacity-50"
                      >
                        {applyingTo === job.id ? 'Loading...' : 'Apply Now'}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
