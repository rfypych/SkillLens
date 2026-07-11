'use client';

import { motion } from 'motion/react';
import { 
  Briefcase, 
  Code2, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  MapPin,
  CircleDollarSign,
  ChevronRight,
  User
} from 'lucide-react';
import Link from 'next/link';

const myApplications = [
  { id: 'APP-091', role: 'Frontend Engineer', company: 'TechFlow', status: 'Evaluated', date: 'Oct 24, 2026', progress: 100 },
  { id: 'APP-092', role: 'Fullstack Developer', company: 'Nexus', status: 'Testing', date: 'Oct 25, 2026', link: '/candidate/test/APP-092', progress: 50 },
];

const openPositions = [
  { id: 'REQ-102', role: 'Senior React Developer', company: 'Starlight Inc', type: 'Remote', salary: '$120k - $150k', applicants: 42 },
  { id: 'REQ-103', role: 'Backend Go Engineer', company: 'TechFlow', type: 'Hybrid', salary: '$130k - $160k', applicants: 89 },
  { id: 'REQ-104', role: 'Data Engineer', company: 'DataScale', type: 'Remote', salary: '$140k - $170k', applicants: 15 },
];

export default function CandidateDashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-10">
      
      {/* Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-brand-secondary rounded-xl p-8 md:p-12 text-brand-white relative overflow-hidden"
      >
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-display font-bold leading-tight mb-4 tracking-tight">
            Showcase your logic, <br className="hidden md:block" />
            <span className="text-brand-gray-light font-normal">not just your memory.</span>
          </h1>
          <p className="text-brand-gray-light text-base mb-8 max-w-lg leading-relaxed">
            SkillLens evaluates your true engineering potential through interactive problem-solving scenarios in a secure, proctored environment.
          </p>
          <button className="px-5 py-2.5 bg-brand-primary text-brand-white text-sm font-semibold rounded-lg hover:bg-brand-dark-teal transition-colors flex items-center justify-center gap-2 max-w-max">
            <User className="w-4 h-4" />
            Update Profile
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* My Applications */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold text-brand-secondary">My Applications</h2>
              <p className="text-brand-gray-dark mt-1 text-sm">Track your active assessments.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {myApplications.map((app, i) => (
              <motion.div 
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (i * 0.1), ease: "easeOut" }}
                className="group relative bg-brand-white p-5 rounded-xl border border-brand-gray-light/30 shadow-sm hover:border-brand-gray-light/60 transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform ${
                      app.status === 'Testing' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-green-50 text-green-600'
                    }`}>
                      {app.status === 'Testing' ? <Code2 className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-brand-secondary text-lg mb-1">{app.role}</h3>
                      <div className="flex items-center gap-3 text-xs text-brand-gray-dark font-medium">
                        <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {app.company}</span>
                        <span className="w-1 h-1 bg-brand-gray-light rounded-full"></span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {app.date}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:items-end justify-center gap-3 w-full sm:w-auto">
                    {app.status === 'Testing' ? (
                      <Link 
                        href={app.link!}
                        className="w-full sm:w-auto px-5 py-2.5 bg-brand-secondary text-brand-white text-sm font-bold rounded-xl hover:bg-brand-dark-teal transition-colors flex items-center justify-center gap-2"
                      >
                        Take Assessment
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <div className="flex flex-col sm:items-end gap-2 w-full">
                        <span className="inline-flex px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-200 uppercase tracking-wider">
                          {app.status}
                        </span>
                        <div className="w-full sm:w-28 h-1.5 bg-brand-gray-light/20 rounded-full overflow-hidden mt-1">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${app.progress}%` }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="h-full bg-green-500 rounded-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Open Positions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold text-brand-secondary">Recommended Roles</h2>
              <p className="text-brand-gray-dark mt-1 text-sm">Based on your profile.</p>
            </div>
            <button className="text-sm font-bold text-brand-primary hover:text-brand-dark-teal flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            {openPositions.map((job, i) => (
              <motion.div 
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (i * 0.1), ease: "easeOut" }}
                className="group bg-brand-white p-5 rounded-xl border border-brand-gray-light/30 shadow-sm hover:border-brand-gray-light/60 transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-display font-bold text-brand-secondary text-lg mb-1 group-hover:text-brand-primary transition-colors">{job.role}</h3>
                    <p className="text-sm text-brand-gray-dark font-medium">{job.company}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-brand-gray-light/10 border border-brand-gray-light/20 flex items-center justify-center text-brand-secondary text-xs font-bold font-mono">
                    {job.company.substring(0, 2).toUpperCase()}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-gray-light/10 text-brand-gray-dark text-xs font-semibold rounded-lg">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.type}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-gray-light/10 text-brand-gray-dark text-xs font-semibold rounded-lg">
                    <CircleDollarSign className="w-3.5 h-3.5" />
                    {job.salary}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-brand-gray-light/20">
                  <p className="text-xs font-medium text-brand-gray-dark">
                    <span className="font-bold text-brand-secondary">{job.applicants}</span> applicants
                  </p>
                  <button className="px-5 py-2 bg-brand-white border border-brand-gray-light text-brand-secondary text-sm font-bold rounded-lg hover:border-brand-primary hover:text-brand-primary transition-colors">
                    Apply Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
