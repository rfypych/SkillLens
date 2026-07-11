'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  ShieldAlert, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Activity,
  Users,
  CalendarDays
} from 'lucide-react';
import { api } from '@/lib/api';

export default function MetricsDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalProcessed: 0,
    fraudCount: 0,
    hiddenGems: 0,
    averageScore: 0,
    labels: {
      'Highly Validated': 0,
      'Solid Match': 0,
      'Mismatch': 0,
      'Likely Fabricated': 0,
      'Pending': 0,
    },
    trendData: [] as { dateStr: string, label: string, count: number }[]
  });

  useEffect(() => {
    api.get('/applications')
      .then((data: any[]) => {
        let total = 0;
        let fraud = 0;
        let gems = 0;
        let scoreSum = 0;
        let labels = {
          'Highly Validated': 0,
          'Solid Match': 0,
          'Mismatch': 0,
          'Likely Fabricated': 0,
          'Pending': 0,
        };

        const trendMap = new Map();
        const trendArray: { dateStr: string, label: string, count: number }[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          trendMap.set(dateStr, { dateStr, label, count: 0 });
          trendArray.push(trendMap.get(dateStr));
        }

        if (Array.isArray(data)) {
          data.forEach(app => {
            const results = app.assessment_results || [];
            if (results.length > 0) {
              const latest = results[results.length - 1];
              total++;
              
              const isCheat = latest.ai_cheating_detected;
              const label = latest.claim_vs_evidence_label;
              const score = latest.overall_score || 0;

              if (isCheat) fraud++;
              if (label === 'Hidden Gem') gems++;
              if (!isCheat && score > 0) scoreSum += score;

              const displayLabel = isCheat ? 'Likely Fabricated' : (label || 'Pending');
              if (labels[displayLabel as keyof typeof labels] !== undefined) {
                labels[displayLabel as keyof typeof labels]++;
              } else if (label === 'Hidden Gem') {
                labels['Highly Validated']++;
              } else if (label === 'Validated') {
                labels['Solid Match']++;
              } else {
                labels['Pending']++;
              }
            }

            if (app.created_at) {
              const appDateStr = app.created_at.split('T')[0];
              if (trendMap.has(appDateStr)) {
                trendMap.get(appDateStr).count++;
              }
            }
          });
        }

        const validScoreCount = total - fraud - labels['Pending'];
        
        setMetrics({
          totalProcessed: total,
          fraudCount: fraud,
          hiddenGems: gems,
          averageScore: validScoreCount > 0 ? Math.round(scoreSum / validScoreCount) : 0,
          labels,
          trendData: trendArray
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fraudRate = metrics.totalProcessed > 0 
    ? Math.round((metrics.fraudCount / metrics.totalProcessed) * 100) 
    : 0;

  const kpis = [
    { name: 'Total Evaluated', value: loading ? '...' : metrics.totalProcessed, icon: Users, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
    { name: 'Average Evidence Score', value: loading ? '...' : metrics.averageScore, icon: Target, color: 'text-brand-secondary', bg: 'bg-brand-secondary/10' },
    { name: 'Fraud Prevention Rate', value: loading ? '...' : `${fraudRate}%`, icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' },
    { name: 'Hidden Gems Found', value: loading ? '...' : metrics.hiddenGems, icon: Sparkles, color: 'text-brand-accent', bg: 'bg-brand-accent/20' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-brand-secondary tracking-tight flex items-center gap-3 mb-2">
          <BarChart3 className="w-8 h-8 text-brand-primary" />
          Analytics & Insights
        </h1>
        <p className="text-brand-gray-dark text-lg">AI performance and talent pipeline telemetry.</p>
      </div>

      {/* KPI Grid */}
      <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 overflow-x-auto pb-4 md:pb-0 snap-x hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="min-w-[240px] md:min-w-0 flex-shrink-0 snap-center bg-brand-white p-6 rounded-2xl border border-brand-gray-light/30 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
            </div>
            <h3 className="text-4xl font-display font-bold text-brand-secondary mb-1">{kpi.value}</h3>
            <p className="text-xs font-bold text-brand-gray-dark uppercase tracking-wider">{kpi.name}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-brand-white p-8 rounded-2xl border border-brand-gray-light/30 shadow-sm"
        >
          <h2 className="text-xl font-display font-bold text-brand-secondary mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-primary" />
            Candidate Alignment Distribution
          </h2>
          
          <div className="space-y-6">
            {Object.entries(metrics.labels).map(([label, count], idx) => {
              if (label === 'Pending') return null;
              const total = metrics.totalProcessed || 1;
              const percentage = Math.round((count / total) * 100);
              
              let barColor = 'bg-brand-primary';
              if (label === 'Likely Fabricated') barColor = 'bg-red-500';
              if (label === 'Mismatch') barColor = 'bg-yellow-500';
              if (label === 'Solid Match') barColor = 'bg-blue-500';

              return (
                <div key={label}>
                  <div className="flex justify-between text-sm font-bold text-brand-secondary mb-2">
                    <span>{label}</span>
                    <span>{percentage}% ({count})</span>
                  </div>
                  <div className="w-full h-3 bg-brand-gray-light/20 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }}
                      className={`h-full ${barColor} rounded-full`} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-brand-secondary p-8 rounded-2xl border border-brand-dark-teal text-brand-white shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center mb-6">
              <TrendingUp className="w-6 h-6 text-brand-accent" />
            </div>
            <h2 className="text-xl font-display font-bold mb-3">AI Engine ROI</h2>
            <p className="text-brand-gray-light text-sm leading-relaxed">
              By filtering out <strong>{metrics.fraudCount}</strong> fabricated or mismatching candidates automatically, the SkillLens AI has saved your engineering team approximately <strong>{metrics.fraudCount * 1.5} hours</strong> of technical screening time this quarter.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Trend Chart Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-brand-white p-8 rounded-2xl border border-brand-gray-light/30 shadow-sm"
      >
        <h2 className="text-xl font-display font-bold text-brand-secondary mb-8 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-brand-primary" />
          Assessment Volume (Last 7 Days)
        </h2>
        
        <div className="flex items-end gap-2 h-48 w-full mt-4">
          {metrics.trendData.map((day, idx) => {
            const maxCount = Math.max(...metrics.trendData.map(d => d.count), 1);
            const heightPercentage = (day.count / maxCount) * 100;
            return (
              <div key={day.dateStr} className="flex-1 h-full flex flex-col justify-end items-center group cursor-pointer">
                <div className="w-full relative flex justify-center items-end h-full bg-brand-gray-light/5 hover:bg-brand-gray-light/10 transition-colors rounded-t-md max-w-[40px]">
                  <div className="absolute -top-8 bg-brand-secondary text-brand-white text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.count}
                  </div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: day.count === 0 ? '4px' : `${heightPercentage}%` }}
                    transition={{ duration: 0.8, delay: 0.7 + (idx * 0.1) }}
                    className="w-full bg-brand-primary/40 group-hover:bg-brand-primary rounded-t-md transition-colors"
                  />
                </div>
                <span className="text-xs font-bold text-brand-gray-dark mt-3">{day.label}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
