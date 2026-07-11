'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArchiveIcon, 
  TargetIcon, 
  LockClosedIcon, 
  LightningBoltIcon, 
  MagicWandIcon 
} from '@radix-ui/react-icons';
import { useRouter, useParams } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { api } from '@/lib/api';

export default function EditJob() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const data = await api.get(`/jobs/${id}`);
        setJob(data);
      } catch (err) {
        toast.error("Error connecting to server.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchJob();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataObj = {
        title: (e.target as any).title.value,
        expected_outcomes: (e.target as any).expected_outcomes.value,
        specific_skills: (e.target as any).specific_skills.value,
        compliance_criteria: (e.target as any).compliance_criteria.value,
        language: (e.target as any).language.value,
        location: (e.target as any).location.value,
        salary_range: (e.target as any).salary_range.value,
        job_type: (e.target as any).job_type.value,
      };
      await api.put(`/jobs/${id}`, formDataObj);

      toast.success("Job updated successfully!");
      setTimeout(() => router.push('/recruiter/jobs'), 1000);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading Job Details...</div>;
  }

  if (!job) {
    return <div className="p-10 text-center text-red-500">Job not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Toaster position="top-right" />
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-3 mb-2">
          Edit Role Parameters
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Update the contextual parameters. Note: Changing these will not regenerate the AI assessment scenario.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="clean-card rounded-xl p-8 space-y-6 bg-white"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-1.5">
                <ArchiveIcon className="w-4 h-4 text-gray-500" />
                Job Title
              </label>
              <input 
                required
                name="title"
                type="text" 
                defaultValue={job.title}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all text-sm"
              />
            </div>
            
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-1.5">
                Language
              </label>
              <select 
                name="language"
                defaultValue={job.language}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all text-sm"
              >
                <option value="English">English</option>
                <option value="Indonesian">Indonesian</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-1.5">Location</label>
              <input required name="location" type="text" defaultValue={job.location} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all text-sm" />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-1.5">Salary Range</label>
              <input required name="salary_range" type="text" defaultValue={job.salary_range} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all text-sm" />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-1.5">Job Type</label>
              <select name="job_type" defaultValue={job.job_type} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all text-sm">
                <option value="Full-time">Full-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-1">
              <TargetIcon className="w-4 h-4 text-gray-500" />
              Expected Outcomes (6-12 Months)
            </label>
            <textarea 
              required name="expected_outcomes" rows={2}
              defaultValue={job.expected_outcomes}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all resize-none text-sm"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-1">
              <LightningBoltIcon className="w-4 h-4 text-gray-500" />
              Non-Trainable Specific Skills
            </label>
            <textarea 
              required name="specific_skills" rows={2}
              defaultValue={job.specific_skills}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all resize-none text-sm"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-1">
              <LockClosedIcon className="w-4 h-4 text-gray-500" />
              Compliance & Non-Negotiables
            </label>
            <textarea 
              required name="compliance_criteria" rows={2}
              defaultValue={job.compliance_criteria}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all resize-none text-sm"
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-end gap-3"
        >
          <button 
            type="button" 
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-lg font-medium text-gray-600 hover:text-black hover:bg-gray-100 transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-lg font-medium bg-black hover:bg-gray-800 text-white shadow-sm transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ArchiveIcon className="w-4 h-4" />
            )}
            <span>Save Changes</span>
          </button>
        </motion.div>
      </form>
    </div>
  );
}
