'use client';

import { motion } from 'motion/react';
import { 
  Search, 
  Filter, 
  ChevronRight,
  ShieldAlert,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

const candidates = [
  { id: 'APP-091', name: 'Alex Rivera', role: 'Senior Frontend Engineer', score: 94, label: 'Highly Validated', telemetry: 'Clean', date: 'Oct 24, 2026' },
  { id: 'APP-090', name: 'Sam Chen', role: 'Backend Developer', score: 88, label: 'Validated', telemetry: 'Clean', date: 'Oct 24, 2026' },
  { id: 'APP-089', name: 'Jordan Smith', role: 'Fullstack Developer', score: 42, label: 'Fabricated', telemetry: 'High tab switching, Copy-paste detected', date: 'Oct 24, 2026' },
  { id: 'APP-088', name: 'Priya Patel', role: 'Data Scientist', score: 97, label: 'Hidden Gem', telemetry: 'Clean', date: 'Oct 23, 2026' },
  { id: 'APP-087', name: 'Michael Chang', role: 'Frontend Engineer', score: 65, label: 'Inconsistent', telemetry: 'Idle periods detected', date: 'Oct 23, 2026' },
  { id: 'APP-086', name: 'Emma Wilson', role: 'DevOps Engineer', score: 91, label: 'Highly Validated', telemetry: 'Clean', date: 'Oct 22, 2026' },
  { id: 'APP-085', name: 'David Kim', role: 'Backend Developer', score: 38, label: 'Fabricated', telemetry: 'AI generated code pasted', date: 'Oct 22, 2026' },
  { id: 'APP-084', name: 'Sarah Jones', role: 'Data Scientist', score: 82, label: 'Validated', telemetry: 'Clean', date: 'Oct 21, 2026' },
  { id: 'APP-083', name: 'James Taylor', role: 'Frontend Engineer', score: 96, label: 'Hidden Gem', telemetry: 'Clean', date: 'Oct 21, 2026' },
  { id: 'APP-082', name: 'Olivia Brown', role: 'Fullstack Developer', score: 71, label: 'Inconsistent', telemetry: 'Frequent tab switching', date: 'Oct 20, 2026' },
];

export default function CandidatesPage() {
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
          <table className="w-full text-left border-collapse">
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
              {candidates.map((candidate, index) => (
                <motion.tr 
                  key={candidate.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className="hover:bg-brand-gray-light/5 transition-colors group text-sm"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-secondary text-brand-white flex items-center justify-center font-bold text-xs">
                        {candidate.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-brand-secondary">{candidate.name}</p>
                        <p className="text-xs text-brand-gray-dark font-mono">{candidate.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-brand-secondary">{candidate.role}</p>
                    <p className="text-xs text-brand-gray-dark">{candidate.date}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${
                      candidate.label === 'Highly Validated' ? 'bg-green-50 text-green-700 border-green-200' :
                      candidate.label === 'Hidden Gem' ? 'bg-brand-accent/20 text-brand-secondary border-brand-accent/50' :
                      candidate.label === 'Validated' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      candidate.label === 'Inconsistent' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {candidate.label === 'Highly Validated' && <CheckCircle className="w-3 h-3" />}
                      {candidate.label === 'Hidden Gem' && <Sparkles className="w-3 h-3" />}
                      {candidate.label === 'Fabricated' && <XCircle className="w-3 h-3" />}
                      {candidate.label === 'Inconsistent' && <AlertTriangle className="w-3 h-3" />}
                      {candidate.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-brand-secondary w-6">{candidate.score}</span>
                      <div className="w-full bg-brand-gray-light/30 rounded-full h-1.5 max-w-[100px]">
                        <div 
                          className={`h-1.5 rounded-full ${
                            candidate.score >= 90 ? 'bg-brand-primary' : 
                            candidate.score >= 70 ? 'bg-brand-dark-teal' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${candidate.score}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {candidate.telemetry === 'Clean' ? (
                      <span className="text-brand-gray-dark flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        Clean
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-start gap-1 text-xs font-medium">
                        <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        {candidate.telemetry}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/recruiter/candidates/${candidate.id}`}
                      className="inline-flex items-center justify-center px-3 py-1.5 bg-brand-secondary text-brand-white text-xs font-medium rounded hover:bg-brand-dark-teal transition-colors"
                    >
                      View Report
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Dummy */}
        <div className="p-4 border-t border-brand-gray-light/30 flex items-center justify-between text-sm text-brand-gray-dark">
          <span>Showing 1 to 10 of 1,284 entries</span>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 border border-brand-gray-light rounded hover:bg-brand-gray-light/20" disabled>Prev</button>
            <button className="px-3 py-1 border border-brand-primary bg-brand-primary text-brand-white rounded">1</button>
            <button className="px-3 py-1 border border-brand-gray-light rounded hover:bg-brand-gray-light/20">2</button>
            <button className="px-3 py-1 border border-brand-gray-light rounded hover:bg-brand-gray-light/20">3</button>
            <span>...</span>
            <button className="px-3 py-1 border border-brand-gray-light rounded hover:bg-brand-gray-light/20">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
