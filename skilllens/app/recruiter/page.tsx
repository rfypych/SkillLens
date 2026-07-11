'use client';

import { motion } from 'motion/react';
import { 
  Users, 
  ShieldAlert, 
  Sparkles,
  TrendingUp,
  MoreHorizontal,
  ChevronRight,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import Link from 'next/link';

const stats = [
  {
    name: 'Total Evaluated',
    value: '1,284',
    change: '+12%',
    trend: 'up',
    icon: Users,
    color: 'bg-brand-primary/10 text-brand-primary',
    border: 'border-brand-primary/20'
  },
  {
    name: 'Hidden Gems Found',
    value: '42',
    change: '+4',
    trend: 'up',
    icon: Sparkles,
    color: 'bg-brand-accent/20 text-brand-accent',
    border: 'border-brand-accent/30'
  },
  {
    name: 'Fabrications Prevented',
    value: '315',
    change: '-2%',
    trend: 'down',
    icon: ShieldAlert,
    color: 'bg-red-50 text-red-600',
    border: 'border-red-100'
  },
];

const recentEvaluations = [
  { id: 'APP-091', name: 'Alex Rivera', role: 'Frontend Engineer', score: 94, status: 'Highly Validated', time: '10m ago' },
  { id: 'APP-090', name: 'Sam Chen', role: 'Backend Engineer', score: 88, status: 'Validated', time: '1h ago' },
  { id: 'APP-089', name: 'Jordan Smith', role: 'Fullstack Developer', score: 42, status: 'Fabricated', time: '3h ago' },
  { id: 'APP-088', name: 'Priya Patel', role: 'Data Scientist', score: 97, status: 'Hidden Gem', time: '5h ago' },
  { id: 'APP-087', name: 'Michael Chang', role: 'Frontend Engineer', score: 65, status: 'Inconsistent', time: '1d ago' },
];

export default function RecruiterDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-brand-secondary mb-2 tracking-tight">Command Center</h1>
          <p className="text-brand-gray-dark text-lg">High-level overview of your hiring pipeline and AI evaluations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-brand-white border border-brand-gray-light text-brand-secondary font-bold rounded-lg hover:bg-brand-gray-light/20 transition-colors text-sm">
            Download Report
          </button>
          <Link href="/recruiter/jobs" className="px-4 py-2 bg-brand-secondary text-brand-white font-bold rounded-lg hover:bg-brand-dark-teal transition-colors text-sm">
            New Assessment
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
            className={`bg-brand-white p-6 rounded-2xl border ${stat.border} shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.color} rounded-full blur-3xl opacity-20 -mr-10 -mt-10 transition-transform group-hover:scale-150`}></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                  stat.trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {stat.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {stat.change}
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
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-white text-brand-gray-dark text-xs uppercase tracking-wider border-b border-brand-gray-light/30">
                <th className="px-6 py-4 font-bold">Candidate</th>
                <th className="px-6 py-4 font-bold">Role</th>
                <th className="px-6 py-4 font-bold">Evidence Score</th>
                <th className="px-6 py-4 font-bold">AI Label</th>
                <th className="px-6 py-4 font-bold">Time</th>
                <th className="px-6 py-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gray-light/20">
              {recentEvaluations.map((evalData, index) => (
                <motion.tr 
                  key={evalData.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + (index * 0.05) }}
                  className="hover:bg-brand-gray-light/5 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-brand-secondary text-brand-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                        {evalData.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-brand-secondary">{evalData.name}</p>
                        <p className="text-xs text-brand-gray-dark font-mono mt-0.5">{evalData.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-brand-gray-dark">
                    {evalData.role}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-brand-secondary w-6">{evalData.score}</span>
                      <div className="w-full bg-brand-gray-light/30 rounded-full h-1.5 max-w-[80px] overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            evalData.score >= 90 ? 'bg-brand-primary' : 
                            evalData.score >= 70 ? 'bg-brand-dark-teal' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${evalData.score}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                      evalData.status === 'Highly Validated' ? 'bg-green-50 text-green-700 border-green-200' :
                      evalData.status === 'Hidden Gem' ? 'bg-brand-accent/20 text-brand-secondary border-brand-accent/50' :
                      evalData.status === 'Validated' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      evalData.status === 'Inconsistent' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {evalData.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-gray-dark font-medium">
                    {evalData.time}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/recruiter/candidates/${evalData.id}`}
                      className="inline-flex items-center justify-center p-2 text-brand-gray-dark hover:text-brand-secondary hover:bg-brand-gray-light/30 rounded-lg transition-colors group-hover:text-brand-primary focus:outline-none"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
