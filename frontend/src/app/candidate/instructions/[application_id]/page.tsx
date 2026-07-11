'use client';

import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { 
  InfoCircledIcon, 
  ClockIcon, 
  LockClosedIcon, 
  ExclamationTriangleIcon,
  ArrowRightIcon
} from '@radix-ui/react-icons';
import { useEffect, useState } from 'react';

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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans flex items-center justify-center">
      <div className="max-w-3xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-black px-8 py-10 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
                <LockClosedIcon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-3 font-serif">Assessment Instructions</h1>
              <p className="text-gray-300 text-sm max-w-lg mx-auto">
                You are about to begin a proctored technical micro-simulation. Please read the following rules carefully before proceeding.
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 md:p-12 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Rule 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <ClockIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1 uppercase tracking-wider">15-Minute Timer</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Once you start, a strict 15-minute timer will begin. The assessment cannot be paused or restarted under any circumstances.
                  </p>
                </div>
              </div>

              {/* Rule 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                  <InfoCircledIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1 uppercase tracking-wider">Scenario-Based</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    You will be presented with a technical scenario. We are evaluating your empirical approach and problem-solving framework.
                  </p>
                </div>
              </div>

              {/* Rule 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                  <ExclamationTriangleIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1 uppercase tracking-wider">Anti-Cheat Monitoring</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    This platform tracks tab switching and copy-pasting. Navigating away from the assessment page will be flagged in your report.
                  </p>
                </div>
              </div>
              
              {/* Rule 4 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                  <LockClosedIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1 uppercase tracking-wider">AI Evaluation</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Your answer will be evaluated by an AI model to verify claims made in your resume against your actual response.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center mt-0.5">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black cursor-pointer peer"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-black transition-colors">
                  I understand the rules and confirm that I will not switch tabs or use external unauthorized tools during this 15-minute assessment.
                </span>
              </label>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleStart}
                disabled={!agreed}
                className="flex items-center gap-2 px-8 py-3.5 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm uppercase tracking-wider"
              >
                Start Assessment
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
