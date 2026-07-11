'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { CheckIcon } from '@radix-ui/react-icons';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const data = await api.get('/auth/me');
        setUser(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = {
        full_name: (e.target as any).full_name.value,
        company_name: (e.target as any).company_name.value
      };
      const updated = await api.put('/auth/me', formData);
      setUser(updated);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Toaster position="top-right" />
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your profile and platform preferences.</p>
      </motion.div>

      <div className="clean-card p-8 rounded-xl bg-white border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Profile Information</h3>
        {user ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  name="full_name"
                  defaultValue={user.full_name || ''} 
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">Company Name</label>
                <input 
                  type="text" 
                  name="company_name"
                  defaultValue={user.company_name || ''} 
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black text-sm"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-900 mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  disabled
                  defaultValue={user.email} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-500 cursor-not-allowed text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">Email address cannot be changed.</p>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg font-medium bg-black hover:bg-gray-800 text-white shadow-sm transition-all flex items-center gap-2 text-sm disabled:opacity-70"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckIcon className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="text-sm text-gray-500">Loading profile...</div>
        )}
      </div>
    </div>
  );
}
