'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PersonIcon, EnvelopeClosedIcon, ArrowRightIcon } from '@radix-ui/react-icons';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';

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
        setError('Failed to load job details.');
      }
      
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await api.get('/auth/me');
          setUser(userData);
          setFormData({ name: userData.full_name || '', email: userData.email || '', resume_url: '' });
        } catch (err) {
          // Ignore, guest user
        }
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
      if (!file) throw new Error("Resume is required");
      dataPayload.append('file', file);

      const data = await api.post(`/assessment/${job_id}/apply`, dataPayload, { requireAuth: false });

      // Cookie is set by the backend now
      
      // Redirect to instructions
      router.push(`/candidate/instructions/${data.id}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center shadow-sm">
            <span className="font-bold text-white text-xl tracking-tighter">S</span>
          </div>
        </div>
        {initLoading ? (
          <p className="text-center text-gray-500">Loading job details...</p>
        ) : (
          <>
            <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
              {job?.title || "Candidate Assessment"}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-2 text-sm font-medium text-gray-500">
              <span>{job?.company_name || "Company"}</span>
              <span>&bull;</span>
              <span>{job?.location || "Remote"}</span>
              <span>&bull;</span>
              <span>{job?.job_type || "Full-time"}</span>
            </div>
            <p className="mt-4 text-center text-sm text-gray-600 line-clamp-3 px-4">
              {job?.description || "Please enter your details to begin the assessment."}
            </p>
          </>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-200 sm:rounded-xl sm:px-10">
          <form className="space-y-5" onSubmit={handleApply}>
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100 font-medium">
                {error}
              </div>
            )}
            
            {user ? (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700">Applying as</p>
                <p className="text-base font-bold text-gray-900 mt-1">{user.full_name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PersonIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                      placeholder="Alex Thompson"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeClosedIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                      placeholder="alex@example.com"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                Upload Resume (PDF required)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf"
                  required
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-gray-500
                    file:mr-4 file:py-1.5 file:px-3
                    file:rounded-md file:border-0
                    file:text-xs file:font-semibold
                    file:bg-black file:text-white
                    hover:file:bg-gray-800
                    border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-1 focus:ring-black focus:border-black cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Continue to Instructions
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            
            <p className="text-xs text-center text-gray-400 mt-4">
              By starting the assessment, you agree to being proctored for anti-cheat purposes.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
