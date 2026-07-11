'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, User, Building2, Aperture, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function Signup() {
  const router = useRouter();
  const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    company_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        role,
        company_name: role === 'candidate' ? null : formData.company_name
      };
      await api.post('/auth/signup', payload, { requireAuth: false });

      // Auto-login after signup
      const loginData = new URLSearchParams();
      loginData.append('username', formData.email);
      loginData.append('password', formData.password);

      try {
        // Cookie is set by the backend now
        await api.post('/auth/login', loginData.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          requireAuth: false
        });
        const me = await api.get('/auth/me');
        router.push(role === 'recruiter' ? '/recruiter' : '/candidate/dashboard');
      } catch {
        router.push('/login');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Form Side */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-24 bg-brand-white py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-10">
            <h1 className="text-4xl font-display font-bold text-brand-secondary mb-2">Create an account.</h1>
            <p className="text-brand-gray-dark">Join SkillLens and experience AI-powered recruitment.</p>
          </div>

          {/* Role Toggle */}
          <div className="flex bg-[#F7F9F9] p-1.5 rounded-xl mb-8 border border-brand-gray-light/40">
            {(['candidate', 'recruiter'] as const).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wider ${
                  role === r
                    ? 'bg-brand-white shadow-sm text-brand-secondary border border-brand-gray-light/40'
                    : 'text-brand-gray-dark hover:text-brand-secondary'
                }`}
              >
                {r === 'candidate' ? 'I\'m a Candidate' : 'I\'m a Recruiter'}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSignup}>
            <div>
              <label className="block text-sm font-medium text-brand-secondary mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-brand-gray-light" />
                </div>
                <input
                  type="text"
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-brand-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-colors"
                  placeholder="Sarah Jenkins"
                />
              </div>
            </div>

            {role === 'recruiter' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <label className="block text-sm font-medium text-brand-secondary mb-1">Company Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-brand-gray-light" />
                  </div>
                  <input
                    type="text"
                    name="company_name"
                    required={role === 'recruiter'}
                    value={formData.company_name}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-brand-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-colors"
                    placeholder="Acme Corp"
                  />
                </div>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-brand-secondary mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-brand-gray-light" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-brand-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-colors"
                  placeholder="you@email.com"
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
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-brand-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-brand-white bg-brand-primary hover:bg-brand-dark-teal focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating account...' : `Create ${role === 'recruiter' ? 'Recruiter' : 'Candidate'} Account`}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-brand-gray-dark">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-brand-primary hover:text-brand-dark-teal transition-colors">
              Sign in
            </Link>
          </p>
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

        <div className="z-10 space-y-6 max-w-sm">
          <div className="p-5 bg-brand-dark-teal/40 rounded-2xl border border-brand-dark-teal">
            <p className="text-sm font-bold text-brand-accent uppercase tracking-wider mb-2">For Candidates</p>
            <p className="text-brand-gray-light text-sm leading-relaxed">Prove your real-world skills through AI-proctored scenario simulations. Stand out beyond your resume.</p>
          </div>
          <div className="p-5 bg-brand-dark-teal/40 rounded-2xl border border-brand-dark-teal">
            <p className="text-sm font-bold text-brand-accent uppercase tracking-wider mb-2">For Recruiters</p>
            <p className="text-brand-gray-light text-sm leading-relaxed">Get forensic-level insight into every applicant. Detect fabricated skills, identify hidden gems, and hire with confidence.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
