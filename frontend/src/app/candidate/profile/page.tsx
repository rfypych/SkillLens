'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Briefcase, FileText, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function CandidateProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    profile: {
      bio: '',
      experience: '',
      resume_url: ''
    }
  });

  useEffect(() => {
    api.get('/auth/me')
      .then(data => {
        setFormData({
          full_name: data.full_name || '',
          email: data.email || '',
          profile: {
            bio: data.profile?.bio || '',
            experience: data.profile?.experience || '',
            resume_url: data.profile?.resume_url || ''
          }
        });
        setLoading(false);
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/auth/me', {
        full_name: formData.full_name,
        profile: formData.profile
      });
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12">
      <Toaster position="top-right" />
      
      <div>
        <Link href="/candidate/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-brand-gray-dark hover:text-brand-secondary transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-brand-secondary mb-2 tracking-tight">My Profile</h1>
        <p className="text-brand-gray-dark text-lg">Manage your personal information and master resume.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-brand-white rounded-2xl border border-brand-gray-light/30 shadow-sm overflow-hidden"
      >
        <form onSubmit={handleSave} className="p-8 space-y-8">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-bold text-brand-secondary mb-4 flex items-center gap-2 border-b border-brand-gray-light/30 pb-2">
              <User className="w-5 h-5 text-brand-primary" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-brand-secondary mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-3 bg-brand-gray-light/5 border border-brand-gray-light rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-brand-secondary mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-brand-gray-dark" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full pl-11 pr-4 py-3 bg-brand-gray-light/10 border border-brand-gray-light rounded-xl text-brand-gray-dark cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-brand-gray-dark mt-1">Email cannot be changed.</p>
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div>
            <h3 className="text-lg font-bold text-brand-secondary mb-4 flex items-center gap-2 border-b border-brand-gray-light/30 pb-2">
              <FileText className="w-5 h-5 text-brand-primary" />
              Professional Details
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-brand-secondary mb-2">Short Bio</label>
                <textarea
                  value={formData.profile.bio}
                  onChange={e => setFormData({ ...formData, profile: { ...formData.profile, bio: e.target.value } })}
                  placeholder="I am a software engineer passionate about building scalable AI applications..."
                  className="w-full h-24 px-4 py-3 bg-brand-gray-light/5 border border-brand-gray-light rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-brand-secondary mb-2">Experience Summary</label>
                <textarea
                  value={formData.profile.experience}
                  onChange={e => setFormData({ ...formData, profile: { ...formData.profile, experience: e.target.value } })}
                  placeholder="5 years at TechCorp (Backend), 2 years at Startup Inc (Fullstack)..."
                  className="w-full h-32 px-4 py-3 bg-brand-gray-light/5 border border-brand-gray-light rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all resize-y"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-brand-secondary mb-2">LinkedIn or Portfolio URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-brand-gray-dark" />
                  </div>
                  <input
                    type="url"
                    value={formData.profile.resume_url}
                    onChange={e => setFormData({ ...formData, profile: { ...formData.profile, resume_url: e.target.value } })}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full pl-11 pr-4 py-3 bg-brand-gray-light/5 border border-brand-gray-light rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-brand-gray-light/30 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-xl font-bold bg-brand-secondary text-brand-white hover:bg-brand-dark-teal transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-brand-white/30 border-t-brand-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
