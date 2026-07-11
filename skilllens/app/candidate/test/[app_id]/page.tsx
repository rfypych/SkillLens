'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Clock, 
  Terminal, 
  Play,
  Send,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Code2,
  Maximize2
} from 'lucide-react';
import { use } from 'react';
import { useRouter } from 'next/navigation';

export default function AssessmentEnvironment({ params }: { params: Promise<{ app_id: string }> }) {
  const resolvedParams = use(params);
  const appId = resolvedParams.app_id;
  const router = useRouter();
  
  const [code, setCode] = useState('// Write your solution here...\n\nfunction processData(input) {\n  \n}\n');
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<null | 'success' | 'running'>(null);

  // Line numbers calculation
  const lineCount = code.split('\n').length;
  const lines = Array.from({ length: Math.max(10, lineCount) }, (_, i) => i + 1);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleRunTests = () => {
    setIsRunning(true);
    setTestResults('running');
    setTimeout(() => {
      setIsRunning(false);
      setTestResults('success');
    }, 2000);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      router.push('/candidate/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-brand-dark text-brand-white flex flex-col font-sans">
      {/* Proctored Top Bar */}
      <header className="h-14 bg-brand-secondary border-b border-brand-dark-teal flex items-center justify-between px-6 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 bg-brand-primary/20 text-brand-accent px-3 py-1.5 rounded-full text-xs font-bold border border-brand-primary/50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="relative flex h-2 w-2 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
            </span>
            Proctoring Active
          </motion.div>
          <span className="text-xs text-brand-gray-light font-medium hidden sm:inline-block border-l border-brand-dark-teal pl-4">
            Session: {appId}
          </span>
        </div>
        
        <div className="flex items-center gap-5">
          <motion.div 
            animate={{ scale: timeLeft < 300 ? [1, 1.05, 1] : 1 }}
            transition={{ repeat: timeLeft < 300 ? Infinity : 0, duration: 1 }}
            className={`flex items-center gap-2 font-mono text-sm font-bold ${timeLeft < 300 ? 'text-red-400' : 'text-brand-white'}`}
          >
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </motion.div>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-brand-primary text-brand-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-brand-dark-teal transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
            {!isSubmitting && <Send className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Scenario Box (Left Panel) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-1/3 bg-brand-secondary border-r border-brand-dark-teal flex flex-col h-[50vh] lg:h-auto overflow-y-auto"
        >
          <div className="p-5 border-b border-brand-dark-teal bg-brand-secondary sticky top-0 z-10 flex justify-between items-center">
            <h2 className="text-brand-white font-display font-bold flex items-center gap-2">
              <Terminal className="w-5 h-5 text-brand-accent" />
              Scenario: Data Optimization
            </h2>
            <button className="text-brand-gray-light hover:text-brand-white transition-colors">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-6 prose prose-invert max-w-none text-sm text-brand-gray-light">
            <p className="text-brand-white font-medium mb-6 leading-relaxed">
              You are building a high-frequency trading dashboard. The backend sends a continuous stream of pricing objects.
            </p>
            
            <h3 className="text-brand-accent text-sm font-bold mt-8 mb-3 uppercase tracking-wider">Problem Statement</h3>
            <p className="leading-relaxed">
              Implement a function that takes an array of price updates and returns a deduplicated array of the latest prices for each asset.
            </p>

            <div className="bg-brand-dark border border-brand-dark-teal rounded-xl p-5 mt-6 font-mono text-xs leading-relaxed overflow-x-auto shadow-inner">
              <span className="text-brand-gray-dark block mb-2">// Input Example</span>
              <span className="text-brand-accent">const</span> input = [<br/>
              &nbsp;&nbsp;{'{'} id: <span className="text-blue-400">'AAPL'</span>, price: <span className="text-purple-400">150.2</span> {'}'},<br/>
              &nbsp;&nbsp;{'{'} id: <span className="text-blue-400">'MSFT'</span>, price: <span className="text-purple-400">300.5</span> {'}'},<br/>
              &nbsp;&nbsp;{'{'} id: <span className="text-blue-400">'AAPL'</span>, price: <span className="text-purple-400">151.0</span> {'}'}<br/>
              ];<br/><br/>
              <span className="text-brand-gray-dark block mb-2">// Expected Output</span>
              [<br/>
              &nbsp;&nbsp;{'{'} id: <span className="text-blue-400">'AAPL'</span>, price: <span className="text-purple-400">151.0</span> {'}'},<br/>
              &nbsp;&nbsp;{'{'} id: <span className="text-blue-400">'MSFT'</span>, price: <span className="text-purple-400">300.5</span> {'}'}<br/>
              ]
            </div>

            <div className="mt-8 p-5 bg-brand-dark-teal/20 border border-brand-dark-teal rounded-xl">
              <h4 className="text-brand-white text-sm font-bold mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                Evaluation Criteria
              </h4>
              <ul className="list-disc pl-5 space-y-2 text-brand-gray-light">
                <li>Time Complexity <span className="text-brand-accent">(O(n) preferred)</span></li>
                <li>Memory Efficiency</li>
                <li>Edge case handling (empty arrays, missing properties)</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Workspace/Input Area (Right Panel) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-2/3 flex flex-col h-[50vh] lg:h-auto bg-brand-dark"
        >
          <div className="flex items-center justify-between px-4 py-3 bg-brand-secondary border-b border-brand-dark-teal">
            <div className="flex gap-2">
              <span className="px-4 py-1.5 bg-brand-dark text-brand-accent text-xs font-mono font-bold rounded-lg border border-brand-dark-teal shadow-sm flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5" />
                solution.js
              </span>
            </div>
            <button 
              onClick={handleRunTests}
              disabled={isRunning}
              className="flex items-center gap-2 text-xs font-bold text-brand-secondary bg-brand-accent hover:bg-white px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              {isRunning ? 'Running...' : 'Run Tests'}
            </button>
          </div>
          
          <div className="flex-1 relative flex">
            {/* Line Numbers */}
            <div className="w-12 bg-brand-secondary border-r border-brand-dark-teal flex flex-col items-end py-6 pr-3 font-mono text-sm text-brand-gray-dark select-none">
              {lines.map(line => (
                <div key={line} className="h-6 leading-6">{line}</div>
              ))}
            </div>
            {/* Editor */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 bg-transparent text-brand-white font-mono text-sm p-6 focus:outline-none resize-none leading-6 whitespace-pre"
              spellCheck="false"
              placeholder="// Start coding..."
            />
          </div>
          
          {/* Console Output Area */}
          <div className="h-56 bg-brand-secondary border-t border-brand-dark-teal flex flex-col">
            <div className="px-4 py-2 border-b border-brand-dark-teal text-xs font-bold text-brand-gray-light uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Console Output
            </div>
            <div className="p-4 font-mono text-xs overflow-y-auto flex-1 bg-brand-dark shadow-inner">
              <AnimatePresence mode="popLayout">
                {!testResults && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p className="text-brand-gray-dark mb-2">System initialized. Ready for execution.</p>
                    <p className="text-brand-accent">&gt; _</p>
                  </motion.div>
                )}
                
                {testResults === 'running' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <p className="text-brand-gray-light mb-1">&gt; node test-runner.js</p>
                    <p className="text-brand-gray-dark mb-2 flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin text-brand-accent" />
                      Executing hidden test suite against solution.js...
                    </p>
                  </motion.div>
                )}

                {testResults === 'success' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="text-brand-gray-light mb-2">&gt; node test-runner.js</p>
                    <div className="space-y-1 mb-4">
                      <p className="text-green-400 flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> Test 1: Basic deduplication - PASS</p>
                      <p className="text-green-400 flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> Test 2: Maintain order - PASS</p>
                      <p className="text-green-400 flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> Test 3: Large dataset (1M items) - PASS</p>
                    </div>
                    <p className="text-brand-accent font-bold">✨ All tests passed successfully!</p>
                    <p className="text-brand-gray-dark mt-4">&gt; _</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

