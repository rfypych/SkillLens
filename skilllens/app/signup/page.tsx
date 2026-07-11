'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Mail, Lock, User, Briefcase, Code, Aperture } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<'candidate' | 'recruiter'>('candidate');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accountType === 'recruiter') {
      router.push('/recruiter');
    } else {
      router.push('/candidate/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row-reverse">
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-24 bg-brand-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-10">
            <h1 className="text-4xl font-display font-bold text-brand-secondary mb-2">Create an account.</h1>
            <p className="text-brand-gray-dark">Join SkillLens to experience the next generation of technical hiring.</p>
          </div>

          <div className="mb-8">
            <div className="flex bg-brand-gray-light/20 p-1 rounded-xl relative">
              <motion.div 
                className="absolute inset-y-1 w-[calc(50%-4px)] bg-brand-white rounded-lg shadow-sm"
                animate={{ 
                  left: accountType === 'candidate' ? '4px' : 'calc(50% + 0px)' 
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
              <button
                type="button"
                onClick={() => setAccountType('candidate')}
                className={`relative flex-1 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 z-10 ${
                  accountType === 'candidate' ? 'text-brand-secondary' : 'text-brand-gray-dark hover:text-brand-secondary'
                }`}
              >
                <Code className="w-4 h-4" />
                Candidate
              </button>
              <button
                type="button"
                onClick={() => setAccountType('recruiter')}
                className={`relative flex-1 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 z-10 ${
                  accountType === 'recruiter' ? 'text-brand-secondary' : 'text-brand-gray-dark hover:text-brand-secondary'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Recruiter
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-brand-secondary mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-brand-gray-light" />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-brand-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-colors"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-secondary mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-brand-gray-light" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-brand-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-colors"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-secondary mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-brand-gray-light" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-brand-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 mt-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-brand-white bg-brand-primary hover:bg-brand-dark-teal focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors"
            >
              Create Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-brand-gray-dark">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-brand-primary hover:text-brand-dark-teal transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
      <div className="hidden md:flex w-1/2 bg-brand-secondary p-12 text-brand-white flex-col justify-between items-start relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-dark-teal rounded-full blur-3xl opacity-50 mix-blend-screen pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-primary rounded-full blur-3xl opacity-30 mix-blend-screen pointer-events-none"></div>
        
        <div className="z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-accent flex items-center justify-center text-brand-secondary shadow-sm">
              <Aperture className="w-6 h-6" />
            </div>
            <span className="text-2xl font-display font-bold text-brand-white tracking-tight">SkillLens</span>
          </div>
        </div>
        
        <div className="z-10 max-w-lg">
          <h3 className="text-4xl font-display font-bold leading-tight mb-4 text-brand-white">
            {accountType === 'candidate' ? 'Showcase your true engineering potential.' : 'Hire with precision and confidence.'}
          </h3>
          <p className="text-brand-gray-light text-lg">
            {accountType === 'candidate' 
              ? 'Our proctored environments and AI copilot ensure your logic and problem-solving skills shine, without getting bogged down by syntax memorization.'
              : 'Detect fabricated responses instantly with our AI forensic reports and telemetry gauges. Identify hidden gems effortlessly.'}
          </p>
        </div>
      </div>
    </div>
  );
}
