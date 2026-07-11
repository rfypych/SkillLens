'use client';

import { motion } from 'motion/react';
import { 
  Plus, 
  Copy, 
  CheckCircle2, 
  Users, 
  Clock,
  MoreVertical,
  Briefcase
} from 'lucide-react';
import { useState } from 'react';

const jobs = [
  { id: 'REQ-102', title: 'Senior Frontend Engineer', department: 'Engineering', location: 'Remote', candidates: 142, status: 'Active', postedAt: '2 days ago' },
  { id: 'REQ-103', title: 'Backend Developer (Go)', department: 'Platform', location: 'New York, NY', candidates: 89, status: 'Active', postedAt: '5 days ago' },
  { id: 'REQ-104', title: 'Data Scientist', department: 'Data', location: 'Remote', candidates: 215, status: 'Active', postedAt: '1 week ago' },
  { id: 'REQ-105', title: 'DevOps Engineer', department: 'Infrastructure', location: 'London, UK', candidates: 45, status: 'Paused', postedAt: '2 weeks ago' },
  { id: 'REQ-106', title: 'Fullstack Developer', department: 'Engineering', location: 'San Francisco, CA', candidates: 310, status: 'Active', postedAt: '3 weeks ago' },
];

export default function ActiveRolesPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyMagicLink = (id: string) => {
    navigator.clipboard.writeText(`https://skilllens.app/apply/${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-brand-secondary mb-2 tracking-tight">Active Roles</h1>
          <p className="text-brand-gray-dark text-lg">Manage open positions and generate assessment links.</p>
        </div>
        <button className="inline-flex items-center justify-center px-5 py-2.5 bg-brand-primary text-brand-white rounded-xl font-bold hover:bg-brand-dark-teal transition-all shadow-sm hover:-translate-y-0.5 active:translate-y-0">
          <Plus className="w-5 h-5 mr-2" />
          Create New Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job, index) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1, ease: "easeOut" }}
            className="group bg-brand-white p-6 rounded-2xl border border-brand-gray-light/30 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full hover:border-brand-primary/40 relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className={`inline-flex px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
                job.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-brand-gray-light/10 text-brand-gray-dark border-brand-gray-light/50'
              }`}>
                {job.status}
              </span>
              <button className="text-brand-gray-dark hover:text-brand-primary transition-colors p-1 rounded hover:bg-brand-gray-light/20">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-xl font-display font-bold text-brand-secondary mb-1 group-hover:text-brand-primary transition-colors">{job.title}</h3>
              <p className="text-sm font-medium text-brand-gray-dark mb-6 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                {job.department} <span className="text-brand-gray-light">•</span> {job.location}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6 flex-1 relative z-10">
              <div className="bg-brand-gray-light/5 rounded-xl p-4 border border-brand-gray-light/20 group-hover:bg-brand-white group-hover:border-brand-primary/20 transition-colors">
                <div className="flex items-center gap-2 text-brand-gray-dark mb-2">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Candidates</span>
                </div>
                <p className="text-2xl font-bold text-brand-secondary">{job.candidates}</p>
              </div>
              <div className="bg-brand-gray-light/5 rounded-xl p-4 border border-brand-gray-light/20 group-hover:bg-brand-white group-hover:border-brand-primary/20 transition-colors">
                <div className="flex items-center gap-2 text-brand-gray-dark mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Posted</span>
                </div>
                <p className="text-sm font-bold text-brand-secondary mt-1">{job.postedAt}</p>
              </div>
            </div>
            
            <div className="mt-auto relative z-10">
              <div className="text-xs font-bold uppercase tracking-wider text-brand-gray-dark mb-2">Assessment Magic Link</div>
              <button 
                onClick={() => copyMagicLink(job.id)}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all border ${
                  copiedId === job.id 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-brand-white border-brand-gray-light hover:border-brand-primary text-brand-secondary hover:text-brand-primary hover:bg-brand-gray-light/10'
                }`}
              >
                {copiedId === job.id ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Copied to Clipboard
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Magic Link
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
