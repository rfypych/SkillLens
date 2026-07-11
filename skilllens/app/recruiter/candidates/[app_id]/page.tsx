'use client';

import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  ShieldAlert, 
  CheckCircle, 
  Terminal,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  MessageSquare,
  AlertTriangle,
  FileCode2,
  Clock,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// Using use function for Next.js 15+ dynamic params
import { use } from 'react';

export default function CandidateForensicReport({ params }: { params: Promise<{ app_id: string }> }) {
  const resolvedParams = use(params);
  const appId = resolvedParams.app_id;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(100);

  // Mock code replay logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && progress < 100) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 1;
        });
      }, 100);
    } else if (progress >= 100) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, progress]);

  const mockCode = `function optimizeDataProcessor(dataset) {
  // Candidate initially typed a very naive O(n^2) approach here
  // then suddenly pasted the optimized Map-based approach below.
  
  const optimizedMap = new Map();
  
  for(let item of dataset) {
    if(!optimizedMap.has(item.id)) {
      optimizedMap.set(item.id, item);
    } else {
      // Merge logic
      let existing = optimizedMap.get(item.id);
      optimizedMap.set(item.id, {...existing, ...item});
    }
  }
  
  return Array.from(optimizedMap.values());
}`;

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <Link href="/recruiter/candidates" className="inline-flex items-center gap-2 text-sm font-medium text-brand-gray-dark hover:text-brand-secondary transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Candidates
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-display font-bold text-brand-secondary">Jordan Smith</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-bold border bg-red-50 text-red-700 border-red-200">
              <ShieldAlert className="w-4 h-4" />
              Fabricated
            </span>
          </div>
          <p className="text-brand-gray-dark font-medium">Fullstack Developer • {appId} • Evaluated Oct 24, 2026</p>
        </div>
        
        <div className="flex items-center gap-4 bg-brand-white p-4 rounded-xl border border-brand-gray-light/30 shadow-sm">
          <div className="text-right">
            <p className="text-xs font-bold text-brand-gray-dark uppercase tracking-wider mb-1">Evidence Score</p>
            <p className="text-3xl font-display font-bold text-red-600">42<span className="text-lg text-brand-gray-light">/100</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Matrix & Telemetry */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Claim vs Evidence Matrix */}
          <div className="bg-brand-white p-6 rounded-2xl border border-brand-gray-light/30 shadow-sm">
            <h2 className="text-lg font-display font-bold text-brand-secondary mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-brand-primary" />
              Claim vs Evidence Matrix
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-brand-gray-light/10 rounded-xl">
                <p className="text-xs font-bold text-brand-gray-dark uppercase tracking-wider mb-2">Resume Claim</p>
                <p className="text-sm font-medium text-brand-secondary">"Expert in algorithm optimization and complex data structures in JavaScript."</p>
              </div>
              <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                <p className="text-xs font-bold text-red-800 uppercase tracking-wider mb-2">AI Evidence Analysis</p>
                <p className="text-sm text-red-900">
                  Candidate struggled with basic iteration syntax for 15 minutes, followed by a sudden 50-line paste of perfectly optimized O(n) code using ES6 Maps. Micro-interview revealed inability to explain how `Map.has()` works conceptually.
                </p>
              </div>
            </div>
          </div>

          {/* Telemetry Gauges */}
          <div className="bg-brand-white p-6 rounded-2xl border border-brand-gray-light/30 shadow-sm">
            <h2 className="text-lg font-display font-bold text-brand-secondary mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Safety Telemetry
            </h2>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-1 font-medium">
                  <span className="text-brand-secondary">Focus Preservation</span>
                  <span className="text-red-600">45%</span>
                </div>
                <div className="w-full bg-brand-gray-light/30 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <p className="text-xs text-brand-gray-dark mt-1">12 tab switches detected during active coding phase.</p>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1 font-medium">
                  <span className="text-brand-secondary">Input Authenticity</span>
                  <span className="text-red-600">12%</span>
                </div>
                <div className="w-full bg-brand-gray-light/30 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                </div>
                <p className="text-xs text-brand-gray-dark mt-1">88% of final code was pasted in a single 2-second window.</p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1 font-medium">
                  <span className="text-brand-secondary">Pace Consistency</span>
                  <span className="text-yellow-600">60%</span>
                </div>
                <div className="w-full bg-brand-gray-light/30 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <p className="text-xs text-brand-gray-dark mt-1">Highly erratic typing speeds.</p>
              </div>
            </div>
          </div>
          
          {/* AI Interview Copilot */}
          <div className="bg-brand-white p-6 rounded-2xl border border-brand-gray-light/30 shadow-sm">
            <h2 className="text-lg font-display font-bold text-brand-secondary mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-accent" />
              AI Interview Copilot
            </h2>
            <p className="text-sm text-brand-gray-dark mb-4">Suggested questions for human follow-up based on forensic analysis:</p>
            <ul className="space-y-3">
              <li className="p-3 bg-brand-gray-light/10 rounded-lg text-sm font-medium text-brand-secondary flex gap-3">
                <span className="text-brand-primary font-bold">1.</span>
                "Can you walk me through why you chose a Map over a plain Object for merging the dataset in your solution?"
              </li>
              <li className="p-3 bg-brand-gray-light/10 rounded-lg text-sm font-medium text-brand-secondary flex gap-3">
                <span className="text-brand-primary font-bold">2.</span>
                "If the dataset was 100x larger, how would your memory footprint change with this implementation?"
              </li>
            </ul>
          </div>

        </div>

        {/* Right Column - Time Travel & Transcripts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Time-Travel Replay */}
          <div className="bg-brand-secondary rounded-2xl border border-brand-dark-teal shadow-sm overflow-hidden flex flex-col h-[400px]">
            <div className="p-4 border-b border-brand-dark-teal flex items-center justify-between bg-brand-secondary/90">
              <h2 className="text-lg font-display font-bold text-brand-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-brand-accent" />
                Time-Travel Code Replay
              </h2>
              <div className="flex items-center gap-2 text-brand-white/70 text-xs font-mono bg-brand-dark-teal/50 px-3 py-1 rounded">
                <Clock className="w-3.5 h-3.5" />
                14:22 / 45:00
              </div>
            </div>
            
            {/* Editor Area */}
            <div className="flex-1 p-6 bg-[#0a192f] text-[#c9d1d9] font-mono text-sm overflow-auto relative">
              <pre><code>{mockCode.substring(0, Math.floor(mockCode.length * (progress / 100)))}</code></pre>
              
              {/* Highlight Paste Event */}
              {progress > 80 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded font-sans font-bold text-sm backdrop-blur-sm"
                >
                  LARGE PASTE EVENT DETECTED
                </motion.div>
              )}
            </div>

            {/* Scrubber & Controls */}
            <div className="p-4 bg-brand-secondary border-t border-brand-dark-teal">
              <div className="flex items-center gap-4 mb-3">
                <span className="text-xs text-brand-white/50 font-mono w-10 text-right">
                  {Math.floor(45 * (progress/100))}:{(Math.floor((45 * 60 * (progress/100)) % 60)).toString().padStart(2, '0')}
                </span>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full h-1.5 bg-brand-dark-teal rounded-lg appearance-none cursor-pointer accent-brand-accent"
                />
                <span className="text-xs text-brand-white/50 font-mono w-10">45:00</span>
              </div>
              <div className="flex justify-center items-center gap-4">
                <button 
                  onClick={() => setProgress(0)}
                  className="p-2 text-brand-white/70 hover:text-brand-white hover:bg-brand-dark-teal rounded-full transition-colors"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 flex items-center justify-center bg-brand-accent text-brand-secondary rounded-full hover:bg-white transition-colors"
                >
                  {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                </button>
                <button 
                  onClick={() => setProgress(100)}
                  className="p-2 text-brand-white/70 hover:text-brand-white hover:bg-brand-dark-teal rounded-full transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Micro-Interview Transcript */}
          <div className="bg-brand-white rounded-2xl border border-brand-gray-light/30 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-brand-gray-light/30">
              <h2 className="text-lg font-display font-bold text-brand-secondary flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-primary" />
                Micro-Interview Transcript
              </h2>
            </div>
            <div className="p-6 space-y-6 bg-[#F7F9F9]">
              
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-brand-secondary flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-brand-accent" />
                </div>
                <div className="flex-1">
                  <div className="bg-brand-white p-4 rounded-2xl rounded-tl-sm shadow-sm border border-brand-gray-light/20">
                    <p className="text-sm text-brand-secondary">I noticed you updated the data processing function to use a `Map`. That's highly efficient for this case. Could you briefly explain why `Map.set()` and `Map.get()` provide an advantage over finding items in an Array?</p>
                  </div>
                  <span className="text-xs text-brand-gray-dark mt-1 ml-1 font-medium">AI Proctor • 14:23</span>
                </div>
              </div>

              <div className="flex gap-4 flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                  JS
                </div>
                <div className="flex-1 flex flex-col items-end">
                  <div className="bg-brand-primary text-brand-white p-4 rounded-2xl rounded-tr-sm shadow-sm">
                    <p className="text-sm">Arrays are slow. Maps are just faster in JavaScript.</p>
                  </div>
                  <span className="text-xs text-brand-gray-dark mt-1 mr-1 font-medium">Jordan • 14:27 (4 min delay)</span>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-brand-secondary flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-brand-accent" />
                </div>
                <div className="flex-1">
                  <div className="bg-brand-white p-4 rounded-2xl rounded-tl-sm shadow-sm border border-brand-gray-light/20">
                    <p className="text-sm text-brand-secondary">True, Maps often provide O(1) time complexity for these lookups. In your merge logic: `optimizedMap.set(item.id, {'{'}...existing, ...item{'}'});`, what happens if `existing` and `item` have the same nested object properties?</p>
                  </div>
                  <span className="text-xs text-brand-gray-dark mt-1 ml-1 font-medium">AI Proctor • 14:28</span>
                </div>
              </div>

              <div className="flex gap-4 flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                  JS
                </div>
                <div className="flex-1 flex flex-col items-end">
                  <div className="bg-brand-primary text-brand-white p-4 rounded-2xl rounded-tr-sm shadow-sm">
                    <p className="text-sm">It merges them correctly.</p>
                  </div>
                  <span className="text-xs text-red-500 mt-1 mr-1 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Flagged: Avoided technical depth
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
