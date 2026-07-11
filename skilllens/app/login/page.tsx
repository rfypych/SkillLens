'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Mail, Lock, Aperture } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login based on email
    if (email.includes('recruiter')) {
      router.push('/recruiter');
    } else {
      router.push('/candidate/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-24 bg-brand-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-10">
            <h1 className="text-4xl font-display font-bold text-brand-secondary mb-2">Welcome back.</h1>
            <p className="text-brand-gray-dark">Sign in to your SkillLens account to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-brand-secondary mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-brand-gray-light" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-brand-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-colors"
                  placeholder="you@company.com (type 'recruiter' for recruiter dashboard)"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-brand-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" type="checkbox" className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-brand-gray-light rounded" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-brand-gray-dark">Remember me</label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-brand-primary hover:text-brand-dark-teal transition-colors">Forgot password?</a>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-brand-white bg-brand-primary hover:bg-brand-dark-teal focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors"
            >
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-brand-gray-dark">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-brand-primary hover:text-brand-dark-teal transition-colors">
              Sign up now
            </Link>
          </p>
        </motion.div>
      </div>
      <div className="hidden md:flex w-1/2 bg-brand-secondary p-12 text-brand-white flex-col justify-between items-start relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-dark-teal rounded-full blur-3xl opacity-50 mix-blend-screen pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-primary rounded-full blur-3xl opacity-30 mix-blend-screen pointer-events-none"></div>
        
        <div className="z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-accent flex items-center justify-center text-brand-secondary shadow-sm">
              <Aperture className="w-6 h-6" />
            </div>
            <span className="text-2xl font-display font-bold text-brand-white tracking-tight">SkillLens</span>
          </div>
        </div>
        
        <div className="z-10 max-w-lg">
          <blockquote className="text-2xl font-display leading-tight mb-6">
            "SkillLens has completely transformed how we evaluate engineering talent. The AI forensic insights allow us to spot true potential while filtering out fabricated responses with 100% accuracy."
          </blockquote>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-dark-teal flex items-center justify-center text-brand-accent font-bold text-xl">
              SM
            </div>
            <div>
              <p className="font-bold text-brand-white">Sarah Mitchell</p>
              <p className="text-brand-gray-light text-sm">VP of Engineering, TechFlow</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
