'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Mail, Lock, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import SponsorLogos from '@/components/SponsorLogos';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const loginData = new URLSearchParams();
      loginData.append('username', email);
      loginData.append('password', password);
      
      // Cookie is set by the backend now
      await api.post('/auth/login', loginData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        requireAuth: false
      });
      
      // Get user role
      const me = await api.get('/auth/me');
      if (me.role === 'recruiter') {
        router.push('/recruiter');
      } else {
        router.push('/candidate/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Form Side */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 py-12 md:py-0 md:px-24 bg-brand-white flex-1 md:flex-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center gap-2.5 mb-12">
            <img src="/logo.svg" alt="SkillLens Logo" className="h-8 w-auto" />
            <span className="text-xl font-display font-bold text-brand-secondary tracking-tight">SkillLens</span>
          </div>

          <div className="mb-10">
            <h1 className="text-4xl font-display font-bold text-brand-secondary mb-2">Welcome back.</h1>
            <p className="text-brand-gray-dark">Sign in to your SkillLens account to continue.</p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

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
                  onChange={e => setEmail(e.target.value)}
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
                  value={password}
                  onChange={e => setPassword(e.target.value)}
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
              <a href="#" className="text-sm font-medium text-brand-primary hover:text-brand-dark-teal transition-colors">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-brand-white bg-brand-primary hover:bg-brand-dark-teal focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-brand-gray-dark">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-brand-primary hover:text-brand-dark-teal transition-colors">
              Sign up now
            </Link>
          </p>
          
          <div className="mt-12 pt-8">
            <SponsorLogos />
          </div>
        </motion.div>
      </div>

      {/* Brand Side */}
      <div className="hidden md:flex w-1/2 bg-brand-secondary p-12 text-brand-white flex-col justify-between items-start relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-dark-teal rounded-full blur-3xl opacity-50 mix-blend-screen pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-primary rounded-full blur-3xl opacity-30 mix-blend-screen pointer-events-none" />

        <div className="z-10">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="SkillLens Logo" className="h-10 w-auto brightness-0 invert" />
            <span className="text-2xl font-display font-bold text-brand-white tracking-tight">SkillLens</span>
          </div>
        </div>

        <div className="z-10 max-w-lg">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
            Hire the right talent,<br/>
            <span className="text-brand-accent">with absolute certainty.</span>
          </h2>
          <p className="text-brand-gray-light text-lg leading-relaxed mb-10">
            SkillLens is the AI-native Applicant Tracking System built to eliminate resume fraud and automate technical screening. Discover true problem solvers in a fraction of the time.
          </p>
        </div>
      </div>
    </div>
  );
}
