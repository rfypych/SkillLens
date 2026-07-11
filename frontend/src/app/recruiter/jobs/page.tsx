'use client';

import { motion } from 'framer-motion';
import { Plus, Copy, CheckCircle2, Users, Clock, MoreVertical, Briefcase, Edit2, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { api } from '@/lib/api';

export default function ActiveRolesPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const router = useRouter();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (e.target && typeof e.target.closest === 'function') {
        if (!e.target.closest('.action-menu-trigger')) {
          setOpenMenuId(null);
        }
      } else {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    api.get('/jobs/my-jobs')
      .then(data => {
        if (Array.isArray(data)) setJobs(data.filter((j: any) => j.status === 'open'));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleArchive = async (jobId: number) => {
    if (!confirm('Are you sure you want to close and archive this job? Candidates will no longer see this position.')) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs(jobs.filter(j => j.id !== jobId));
      toast.success('Job closed and archived.');
    } catch {
      toast.error('An error occurred.');
    }
  };

  const copyMagicLink = (job: any) => {
    const url = `${window.location.origin}/candidate/apply/${job.magic_link_token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(job.id);
    toast.success('Magic link copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-brand-secondary mb-2 tracking-tight">Active Roles</h1>
          <p className="text-brand-gray-dark text-lg">Manage open positions and generate assessment links.</p>
        </div>
        <Link href="/recruiter/jobs/new" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 bg-brand-primary text-brand-white rounded-xl font-bold text-sm sm:text-base hover:bg-brand-dark-teal transition-all shadow-sm hover:-translate-y-0.5 active:translate-y-0">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Create New Role
          </button>
        </Link>
      </div>

      {!loading && jobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-brand-gray-light/40 rounded-2xl bg-brand-white">
          <Briefcase className="w-12 h-12 text-brand-gray-light mb-4" />
          <h3 className="text-xl font-display font-bold text-brand-secondary mb-2">No Active Roles</h3>
          <p className="text-brand-gray-dark text-sm max-w-sm mb-6">Create your first role to start evaluating candidates with AI-powered assessments.</p>
          <Link href="/recruiter/jobs/new">
            <button className="px-5 py-2.5 bg-brand-secondary text-brand-white rounded-xl font-bold hover:bg-brand-dark-teal transition-colors text-sm">
              Create New Role
            </button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job, index) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1, ease: 'easeOut' }}
            className={`group bg-brand-white p-6 rounded-2xl border border-brand-gray-light/30 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full hover:border-brand-primary/40 relative ${openMenuId === job.id ? 'z-50' : 'z-10'}`}
          >
            <div className="flex justify-between items-start mb-4 relative z-20">
              <span className="inline-flex px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border bg-green-50 text-green-700 border-green-200 shadow-sm">
                Active
              </span>
              <div className="relative action-menu-trigger" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setOpenMenuId(openMenuId === job.id ? null : job.id)}
                  className={`p-1.5 rounded-lg transition-colors ${openMenuId === job.id ? 'bg-brand-gray-light/20 text-brand-secondary' : 'text-brand-gray-dark hover:text-brand-secondary hover:bg-brand-gray-light/10'}`}
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                
                {openMenuId === job.id && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute right-0 mt-1 w-40 bg-brand-white border border-brand-gray-light/30 rounded-xl shadow-lg overflow-hidden py-1 z-50"
                  >
                    <Link href={`/recruiter/jobs/${job.id}`} onClick={() => setOpenMenuId(null)} className="w-full text-left px-4 py-2 text-sm text-brand-secondary hover:bg-brand-gray-light/10 transition-colors font-medium flex items-center gap-2">
                      <Edit2 className="w-3.5 h-3.5" /> Edit Job
                    </Link>
                    <button onClick={() => { handleArchive(job.id); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium flex items-center gap-2">
                      <XCircle className="w-3.5 h-3.5" /> Close Role
                    </button>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="relative z-10">
              <h3 className="text-xl font-display font-bold text-brand-secondary mb-1 group-hover:text-brand-primary transition-colors">{job.title}</h3>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs font-medium text-brand-gray-dark flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />{job.department || 'Engineering'}
                </span>
                {job.location && <span className="text-xs font-medium text-brand-gray-dark">· {job.location}</span>}
                {job.salary_range && <span className="text-xs font-medium text-brand-primary">· {job.salary_range}</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 flex-1 relative z-10">
              <div className="bg-brand-gray-light/5 rounded-xl p-3 sm:p-4 border border-brand-gray-light/20 group-hover:bg-brand-white group-hover:border-brand-primary/20 transition-colors">
                <div className="flex items-center gap-1.5 sm:gap-2 text-brand-gray-dark mb-1 sm:mb-2">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Candidates</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-brand-secondary">{job.candidate_count ?? 0}</p>
              </div>
              <div className="bg-brand-gray-light/5 rounded-xl p-3 sm:p-4 border border-brand-gray-light/20 group-hover:bg-brand-white group-hover:border-brand-primary/20 transition-colors">
                <div className="flex items-center gap-1.5 sm:gap-2 text-brand-gray-dark mb-1 sm:mb-2">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Posted</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-brand-secondary mt-1">
                  {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="mt-auto relative z-10">
              <div className="text-xs font-bold uppercase tracking-wider text-brand-gray-dark mb-2">Assessment Magic Link</div>
              <button
                onClick={() => copyMagicLink(job)}
                className={`w-full flex items-center justify-center gap-2 py-2 sm:py-3 px-4 rounded-xl font-bold text-sm transition-all border ${
                  copiedId === job.id
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-brand-white border-brand-gray-light hover:border-brand-primary text-brand-secondary hover:text-brand-primary hover:bg-brand-gray-light/10'
                }`}
              >
                {copiedId === job.id ? (
                  <><CheckCircle2 className="w-4 h-4" />Copied to Clipboard</>
                ) : (
                  <><Copy className="w-4 h-4" />Copy Magic Link</>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
