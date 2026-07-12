'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, ArrowRight, Loader2, AlertCircle, Briefcase, MapPin, Building2, UploadCloud } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import SponsorLogos from '@/components/SponsorLogos';

export default function ApplyForJob() {
  const router = useRouter();
  const params = useParams();
  const job_id = params.job_id;
  
  const [job, setJob] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    resume_url: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const jobData = await api.get(`/jobs/${job_id}`, { requireAuth: false });
        setJob(jobData);
      } catch (err) {
        setError('Failed to load job details. This link might be invalid or expired.');
      }
      
      const token = localStorage.getItem('token');
      // Attempt to load user if they are logged in
      try {
        const userData = await api.get('/auth/me');
        setUser(userData);
        setFormData({ name: userData.full_name || '', email: userData.email || '', resume_url: '' });
      } catch (err) {
        // Ignore, guest user
      }
      
      setInitLoading(false);
    };
    init();
  }, [job_id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const dataPayload = new FormData();
      if (formData.name) dataPayload.append('name', formData.name);
      if (formData.email) dataPayload.append('email', formData.email);
      if (!file) throw new Error("Please upload a valid PDF resume to continue.");
      dataPayload.append('file', file);

      const data = await api.post(`/assessment/${job_id}/apply`, dataPayload, { requireAuth: false });

      // Cookie is set by the backend now
      
      // Redirect to instructions
      router.push(`/candidate/instructions/${data.id}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting your application.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (initLoading) {
    return (
      <div className="min-h-screen bg-[#F7F9F9] flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
        <p className="text-brand-gray-dark font-medium font-mono text-sm animate-pulse tracking-widest uppercase">Loading Role Details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F7F9F9]">
      {/* Brand Side (Left on Desktop) */}
      <div className="w-full md:w-5/12 bg-brand-secondary p-8 md:p-12 text-brand-white flex flex-col justify-between items-start relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-dark-teal rounded-full blur-3xl opacity-50 mix-blend-screen pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-primary rounded-full blur-3xl opacity-30 mix-blend-screen pointer-events-none" />

        <div className="z-10 w-full mb-12">
          <div className="flex items-center gap-2.5 mb-16">
            <img src="/logo.svg" alt="SkillLens Logo" className="h-10 w-auto brightness-0 invert" />
            <span className="text-2xl font-display font-bold text-brand-white tracking-tight">SkillLens</span>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-white/10 border border-brand-white/20 text-brand-accent text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-sm">
              <Briefcase className="w-4 h-4" /> Assessment Portal
            </div>
            
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 leading-tight tracking-tight">
              {job?.title || "Role Assessment"}
            </h1>
            
            <div className="flex flex-wrap gap-4 text-sm text-brand-gray-light font-medium mb-8">
              <div className="flex items-center gap-1.5 bg-brand-white/5 px-3 py-2 rounded-lg">
                <Building2 className="w-4 h-4 text-brand-accent" /> {job?.company_name || "Company"}
              </div>
              <div className="flex items-center gap-1.5 bg-brand-white/5 px-3 py-2 rounded-lg">
                <MapPin className="w-4 h-4 text-brand-accent" /> {job?.location || "Remote"}
              </div>
            </div>

            <div className="prose prose-invert prose-sm line-clamp-4 text-brand-gray-light/80 leading-relaxed max-w-sm">
              {job?.description || "You've been invited to take a technical assessment. Please provide your details to begin the proctored session."}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Form Side (Right on Desktop) */}
      <div className="w-full md:w-7/12 flex flex-col justify-center px-6 py-12 md:px-24 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold text-brand-secondary mb-2 tracking-tight">Start Application</h2>
            <p className="text-brand-gray-dark">Enter your details and upload your resume to begin.</p>
          </div>

          <form className="space-y-5" onSubmit={handleApply}>
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 overflow-hidden shadow-sm"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {user ? (
              <div className="bg-[#F7F9F9] p-5 rounded-2xl border border-brand-gray-light/40 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-xs font-bold text-brand-gray-dark uppercase tracking-wider mb-1">Applying as</p>
                  <p className="text-base font-bold text-brand-secondary">{user.full_name}</p>
                  <p className="text-sm text-brand-gray-medium">{user.email}</p>
                </div>
                <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary border border-brand-primary/20">
                  <User className="w-6 h-6" />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-brand-secondary mb-1.5">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-brand-gray-light" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full pl-11 pr-4 py-3.5 bg-brand-white border border-brand-gray-light/50 rounded-xl text-sm text-brand-secondary placeholder:text-brand-gray-light focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all shadow-sm"
                      placeholder="e.g. Alex Thompson"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-secondary mb-1.5">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-brand-gray-light" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-11 pr-4 py-3.5 bg-brand-white border border-brand-gray-light/50 rounded-xl text-sm text-brand-secondary placeholder:text-brand-gray-light focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all shadow-sm"
                      placeholder="alex@example.com"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-brand-secondary mb-1.5">Upload Resume (PDF only)</label>
              <div className="relative group">
                <input
                  type="file"
                  accept=".pdf"
                  required
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`flex items-center gap-3 w-full px-4 py-3.5 bg-brand-white border-2 border-dashed ${file ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-gray-light/50 group-hover:border-brand-primary/50 group-hover:bg-[#F7F9F9]'} rounded-xl transition-all`}>
                  <div className={`p-2 rounded-lg ${file ? 'bg-brand-primary text-brand-white' : 'bg-brand-gray-light/20 text-brand-gray-dark'}`}>
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div className="flex-1 truncate">
                    <p className={`text-sm font-medium truncate ${file ? 'text-brand-primary' : 'text-brand-gray-dark'}`}>
                      {file ? file.name : "Click or drag PDF here"}
                    </p>
                    {!file && <p className="text-xs text-brand-gray-medium mt-0.5">Maximum file size 5MB</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || !job}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-xl shadow-lg shadow-brand-primary/20 text-sm font-bold text-brand-white bg-brand-primary hover:bg-brand-dark-teal focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wider"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Preparing Assessment...</>
                ) : (
                  <>Continue to Instructions <ArrowRight className="w-5 h-5 ml-1" /></>
                )}
              </button>
            </div>
            
            <p className="text-xs text-center text-brand-gray-medium mt-4 max-w-xs mx-auto leading-relaxed">
              By continuing, you agree to being proctored by our AI engine for anti-cheat verification purposes.
            </p>
          </form>

          <div className="mt-12 pt-8 border-t border-brand-gray-light/20">
            <SponsorLogos />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
