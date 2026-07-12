'use client';

import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { 
  Info, 
  Clock, 
  Lock, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  BrainCircuit
} from 'lucide-react';
import { useState } from 'react';

export default function AssessmentInstructions() {
  const router = useRouter();
  const params = useParams();
  const application_id = params.application_id;

  const [agreed, setAgreed] = useState(false);

  const handleStart = () => {
    if (agreed) {
      router.push(`/candidate/test/${application_id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F9] py-12 px-4 sm:px-6 lg:px-8 font-sans flex items-center justify-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-brand-secondary skew-y-3 origin-top-left -z-10" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-dark-teal rounded-full blur-3xl opacity-50 mix-blend-screen -z-10" />
      
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <img src="/logo.svg" alt="SkillLens Logo" className="h-10 w-auto brightness-0 invert" />
            <span className="text-2xl font-display font-bold text-brand-white tracking-tight">SkillLens</span>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-brand-white rounded-3xl shadow-xl border border-brand-gray-light/30 overflow-hidden"
        >
          {/* Header */}
          <div className="px-8 md:px-12 py-10 relative overflow-hidden bg-brand-secondary text-brand-white border-b border-brand-gray-light/20">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-brand-primary rounded-full blur-3xl opacity-30"></div>
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 bg-brand-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-brand-white/20 shadow-sm">
                <ShieldCheck className="w-8 h-8 text-brand-accent" />
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">Assessment Briefing</h1>
              <p className="text-brand-gray-light text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                You are about to begin an AI-proctored technical micro-simulation. Please review the environment rules carefully before proceeding.
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 md:p-12 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
              {/* Rule 1 */}
              <div className="flex gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-gray-light/10 flex items-center justify-center text-brand-secondary border border-brand-gray-light/20 shadow-sm">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brand-secondary mb-1.5 uppercase tracking-wider">15-Minute Timer</h3>
                  <p className="text-sm text-brand-gray-dark leading-relaxed">
                    Once you start, a strict 15-minute timer will begin. The assessment cannot be paused or restarted under any circumstances.
                  </p>
                </div>
              </div>

              {/* Rule 2 */}
              <div className="flex gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20 shadow-sm">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brand-secondary mb-1.5 uppercase tracking-wider">Scenario-Based</h3>
                  <p className="text-sm text-brand-gray-dark leading-relaxed">
                    You will be presented with a technical scenario. We are evaluating your empirical approach and real-world problem-solving framework.
                  </p>
                </div>
              </div>

              {/* Rule 3 */}
              <div className="flex gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 border border-red-100 shadow-sm">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brand-secondary mb-1.5 uppercase tracking-wider">Anti-Cheat Monitoring</h3>
                  <p className="text-sm text-brand-gray-dark leading-relaxed">
                    This platform tracks tab switching and copy-pasting. Navigating away from the assessment page will be flagged in your final report.
                  </p>
                </div>
              </div>
              
              {/* Rule 4 */}
              <div className="flex gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-dark-teal/10 flex items-center justify-center text-brand-dark-teal border border-brand-dark-teal/20 shadow-sm">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brand-secondary mb-1.5 uppercase tracking-wider">AI Evaluation</h3>
                  <p className="text-sm text-brand-gray-dark leading-relaxed">
                    Your answers will be forensically evaluated by an AI model to verify claims made in your resume against your actual response depth.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-brand-gray-light/30">
              <label className="flex items-start gap-4 cursor-pointer group bg-[#F7F9F9] p-5 rounded-2xl border border-brand-gray-light/40 hover:border-brand-primary/50 transition-colors">
                <div className="relative flex items-center mt-0.5">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-brand-gray-light text-brand-primary focus:ring-brand-primary cursor-pointer transition-colors"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                </div>
                <span className="text-sm font-medium text-brand-gray-dark group-hover:text-brand-secondary transition-colors leading-relaxed">
                  I understand the rules and confirm that I will not switch tabs or use external unauthorized tools during this 15-minute assessment.
                </span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-4">
              <div className="flex items-center gap-2 text-brand-gray-medium text-xs font-bold uppercase tracking-widest">
                <Info className="w-4 h-4" /> Ensure a stable connection
              </div>
              <button
                onClick={handleStart}
                disabled={!agreed}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-primary text-brand-white font-bold rounded-xl hover:bg-brand-dark-teal transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-brand-primary/20 text-sm uppercase tracking-wider"
              >
                Start Assessment
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
