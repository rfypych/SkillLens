'use client';

import { motion } from 'framer-motion';
import { Search, Filter, ChevronRight, ShieldAlert, Sparkles, CheckCircle, XCircle, AlertTriangle, Archive } from 'lucide-react';
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
}

interface Application {
  id: number;
  status: string;
  created_at: string;
  job?: { title: string };
  user: { full_name: string; email: string };
  assessment_results: AssessmentResult[];
}

export default function CandidatesPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/applications')
      .then(data => {
        if (Array.isArray(data)) setApplications(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = applications.filter(app =>
    app.user.full_name.toLowerCase().includes(search.toLowerCase()) ||
    `APP-${app.id}`.toLowerCase().includes(search.toLowerCase()) ||
    (app.job?.title ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const handleArchive = async (id: number) => {
    if (!confirm('Archive this candidate?')) return;
    try {
      await api.delete(`/applications/${id}`);
      setApplications(prev => prev.filter(a => a.id !== id));
    } catch {
      alert('Failed to archive');
    }
  };

  const getLabelStyle = (label: string | null, isCheat: boolean) => {
    if (isCheat || label === 'Likely Fabricated' || label === 'Fabricated')
      return 'bg-red-50 text-red-700 border-red-200';
    if (label === 'Hidden Gem')
      return 'bg-brand-accent/20 text-brand-secondary border-brand-accent/50';
    if (label === 'Highly Validated')
      return 'bg-green-50 text-green-700 border-green-200';
    if (label === 'Validated' || label === 'Solid Match')
      return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  };

  const getLabelIcon = (label: string | null, isCheat: boolean) => {
    if (isCheat || label === 'Fabricated') return <XCircle className="w-3 h-3" />;
    if (label === 'Highly Validated') return <CheckCircle className="w-3 h-3" />;
    if (label === 'Hidden Gem') return <Sparkles className="w-3 h-3" />;
    return <AlertTriangle className="w-3 h-3" />;
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-secondary mb-2">Candidates Database</h1>
          <p className="text-brand-gray-dark">Comprehensive view of all applicants and their AI forensic evaluations.</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-brand-white p-4 rounded-t-2xl border border-brand-gray-light/30 border-b-0 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-brand-gray-dark" />
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="block w-full pl-9 pr-3 py-2.5 border border-brand-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm transition-colors"
            placeholder="Search by name, ID, or role..."
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-brand-gray-light rounded-lg text-sm font-medium text-brand-secondary hover:bg-brand-gray-light/10 transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Data Dense Table */}
      <div className="bg-brand-white border border-brand-gray-light/30 rounded-b-2xl shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="sticky top-0 bg-brand-white shadow-sm z-10">
              <tr className="bg-brand-gray-light/10 text-brand-gray-dark text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium border-b border-brand-gray-light/30">Candidate</th>
                <th className="px-6 py-4 font-medium border-b border-brand-gray-light/30">Role & Date</th>
                <th className="px-6 py-4 font-medium border-b border-brand-gray-light/30">AI Evaluation Label</th>
                <th className="px-6 py-4 font-medium border-b border-brand-gray-light/30">Evidence Score</th>
                <th className="px-6 py-4 font-medium border-b border-brand-gray-light/30 w-1/4">Telemetry Alerts</th>
                <th className="px-6 py-4 font-medium border-b border-brand-gray-light/30 text-right">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gray-light/20">
              {loading && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-brand-gray-dark">Loading...</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-brand-gray-dark">No candidates found.</td></tr>
              )}
              {filtered.map((app, index) => {
                const latest = app.assessment_results?.[app.assessment_results.length - 1];
                const score = latest?.overall_score ?? null;
                const label = latest?.claim_vs_evidence_label ?? null;
                const isCheat = latest?.ai_cheating_detected ?? false;
                const tabSwitches = latest?.tab_switches ?? 0;
                const pastes = latest?.copy_paste_attempts ?? 0;
                const displayLabel = isCheat ? 'Fabricated' : label ?? 'Pending';

                const telemetryClean = !isCheat && tabSwitches <= 2 && pastes === 0;
                const telemetryText = isCheat
                  ? 'AI-generated code pasted'
                  : tabSwitches > 5 ? `High tab switching (${tabSwitches}x)` : 
                    pastes > 0 ? `${pastes} paste event(s) detected` : 'Clean';

                return (
                  <motion.tr
                    key={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="hover:bg-brand-gray-light/5 transition-colors group text-sm"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-secondary text-brand-white flex items-center justify-center font-bold text-xs">
                          {app.user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-brand-secondary">{app.user.full_name}</p>
                          <p className="text-xs text-brand-gray-dark font-mono">APP-{app.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-brand-secondary">{app.job?.title ?? 'N/A'}</p>
                      <p className="text-xs text-brand-gray-dark">
                        {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${getLabelStyle(label, isCheat)}`}>
                        {getLabelIcon(label, isCheat)}
                        {displayLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-brand-secondary w-6">{score !== null ? score.toFixed(0) : '-'}</span>
                        <div className="w-full bg-brand-gray-light/30 rounded-full h-1.5 max-w-[100px]">
                          {score !== null && (
                            <div
                              className={clsx('h-1.5 rounded-full', score >= 80 ? 'bg-brand-primary' : score >= 60 ? 'bg-brand-dark-teal' : 'bg-red-500')}
                              style={{ width: `${score}%` }}
                            />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {telemetryClean ? (
                        <span className="text-brand-gray-dark flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          Clean
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-start gap-1 text-xs font-medium">
                          <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                          {telemetryText}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleArchive(app.id)}
                          className="p-1.5 text-brand-gray-dark hover:bg-red-50 hover:text-red-600 rounded transition-colors"
                          title="Archive"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/recruiter/candidates/${app.id}`}
                          className="inline-flex items-center justify-center px-3 py-1.5 bg-brand-secondary text-brand-white text-xs font-medium rounded hover:bg-brand-dark-teal transition-colors"
                        >
                          View Report
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-brand-gray-light/30 flex items-center justify-between text-sm text-brand-gray-dark">
          <span>Showing {filtered.length} of {applications.length} entries</span>
        </div>
      </div>
    </div>
  );
}
