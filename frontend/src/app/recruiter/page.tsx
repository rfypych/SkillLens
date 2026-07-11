'use client';

import { motion } from 'framer-motion';
import { 
  Users, 
  ShieldAlert, 
  Sparkles,
  TrendingUp,
  ChevronRight,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import clsx from 'clsx';

interface AssessmentResult {
  overall_score: number | null;
  ai_cheating_detected: boolean;
  tab_switches: number;
  copy_paste_attempts: number;
  claim_vs_evidence_label: string | null;
  created_at: string;
}

interface Application {
  id: number;
  status: string;
  created_at: string;
  job?: { title: string };
  user: { full_name: string; email: string };
  assessment_results: AssessmentResult[];
}

export default function RecruiterDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/applications')
      .then(data => {
        if (Array.isArray(data)) setApplications(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalEvaluated = applications.filter(a => a.status === 'evaluated' || a.status === 'hired' || a.status === 'interview').length;
  let hiddenGemsCount = 0;
  let fraudPreventedCount = 0;

  applications.forEach(a => {
    const latest = a.assessment_results?.[a.assessment_results.length - 1];
    if (latest) {
      if (latest.claim_vs_evidence_label === 'Hidden Gem') hiddenGemsCount++;
      if (latest.ai_cheating_detected) fraudPreventedCount++;
    }
  });

  const stats = [
    {
      name: 'Total Evaluated',
      value: loading ? '...' : totalEvaluated.toString(),
      trend: 'up' as const,
      icon: Users,
      color: 'bg-brand-primary/10 text-brand-primary',
      border: 'border-brand-primary/20'
    },
    {
      name: 'Hidden Gems Found',
      value: loading ? '...' : hiddenGemsCount.toString(),
      trend: 'up' as const,
      icon: Sparkles,
      color: 'bg-brand-accent/20 text-brand-secondary',
      border: 'border-brand-accent/30'
    },
    {
      name: 'Fabrications Prevented',
      value: loading ? '...' : fraudPreventedCount.toString(),
      trend: 'down' as const,
      icon: ShieldAlert,
      color: 'bg-red-50 text-red-600',
      border: 'border-red-100'
    },
  ];

  const getLabelStyle = (label: string | null, isCheat: boolean) => {
    if (isCheat || label === 'Likely Fabricated' || label === 'Fabricated' || label === 'Mismatch')
      return 'bg-red-50 text-red-700 border-red-200';
    if (label === 'Hidden Gem')
      return 'bg-brand-accent/20 text-brand-secondary border-brand-accent/50';
    if (label === 'Highly Validated')
      return 'bg-green-50 text-green-700 border-green-200';
    if (label === 'Solid Match' || label === 'Validated')
      return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-brand-secondary mb-2 tracking-tight">Command Center</h1>
          <p className="text-brand-gray-dark text-lg">High-level overview of your hiring pipeline and AI evaluations.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/recruiter/jobs" className="px-4 py-2 bg-brand-secondary text-brand-white font-bold rounded-lg hover:bg-brand-dark-teal transition-colors text-sm">
            New Assessment
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto pb-4 md:pb-0 snap-x hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
            className={`min-w-[280px] md:min-w-0 flex-shrink-0 snap-center bg-brand-white p-6 rounded-2xl border ${stat.border} shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.color} rounded-full blur-3xl opacity-20 -mr-10 -mt-10 transition-transform group-hover:scale-150`} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                  stat.trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {stat.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                </span>
              </div>
              <h3 className="text-4xl md:text-5xl font-display font-bold text-brand-secondary mb-2 tracking-tight">{stat.value}</h3>
              <p className="text-sm font-medium text-brand-gray-dark uppercase tracking-wider">{stat.name}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Evaluations Table */}
      <div className="bg-brand-white rounded-2xl border border-brand-gray-light/30 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-brand-gray-light/30 flex items-center justify-between bg-brand-gray-light/5">
          <h2 className="text-xl font-display font-bold text-brand-secondary">Recent Evaluations</h2>
          <Link href="/recruiter/candidates" className="text-sm font-bold text-brand-primary hover:text-brand-dark-teal transition-colors flex items-center gap-1 group">
            View All
            <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-brand-white text-brand-gray-dark text-xs uppercase tracking-wider border-b border-brand-gray-light/30">
                <th className="px-6 py-4 font-bold">Candidate</th>
                <th className="px-6 py-4 font-bold">Role</th>
                <th className="px-6 py-4 font-bold">Evidence Score</th>
                <th className="px-6 py-4 font-bold">AI Label</th>
                <th className="px-6 py-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gray-light/20">
              {applications.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-brand-gray-dark">
                    No evaluations yet. Share a job link to get started.
                  </td>
                </tr>
              )}
              {applications.slice(0, 10).map((app, index) => {
                const latest = app.assessment_results?.[app.assessment_results.length - 1];
                const score = latest?.overall_score ?? null;
                const label = latest?.claim_vs_evidence_label ?? null;
                const isCheat = latest?.ai_cheating_detected ?? false;
                const displayLabel = isCheat ? 'Fabricated' : label ?? 'Pending';

                return (
                  <motion.tr
                    key={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                    className="hover:bg-brand-gray-light/5 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-brand-secondary text-brand-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                          {app.user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-brand-secondary">{app.user.full_name}</p>
                          <p className="text-xs text-brand-gray-dark font-mono mt-0.5">APP-{app.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-brand-gray-dark">
                      {app.job?.title ?? `Job ID: ${app.id}`}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-brand-secondary w-6">{score !== null ? score.toFixed(0) : '-'}</span>
                        <div className="w-full bg-brand-gray-light/30 rounded-full h-1.5 max-w-[80px] overflow-hidden">
                          {score !== null && (
                            <div
                              className={clsx('h-full rounded-full', score >= 80 ? 'bg-brand-primary' : score >= 60 ? 'bg-brand-dark-teal' : 'bg-red-500')}
                              style={{ width: `${score}%` }}
                            />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${getLabelStyle(label, isCheat)}`}>
                        {displayLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/recruiter/candidates/${app.id}`}
                        className="inline-flex items-center justify-center p-2 text-brand-gray-dark hover:text-brand-secondary hover:bg-brand-gray-light/30 rounded-lg transition-colors group-hover:text-brand-primary focus:outline-none"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
