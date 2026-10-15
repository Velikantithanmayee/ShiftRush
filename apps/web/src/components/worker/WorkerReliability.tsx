import React from 'react';
import { Star, TrendingUp, AlertTriangle, ShieldCheck, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { TabId } from '../../types';

interface WorkerReliabilityProps {
  score: number;
  setActiveTab: (tab: TabId) => void;
}

export function WorkerReliability({ score, setActiveTab }: WorkerReliabilityProps) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col h-full bg-[var(--background)] absolute inset-0 z-50 overflow-y-auto pb-24">
      {/* Header */}
      <div className="bg-[var(--surface)]/90 backdrop-blur-lg border-b border-[var(--border)] pt-4 px-4 pb-4 sticky top-0 z-30 flex items-center gap-3">
        <button onClick={() => setActiveTab('home')} className="p-2 -ml-2 rounded-full hover:bg-[var(--surface-sec)] transition-colors">
          <ChevronLeft className="w-6 h-6 text-[var(--text-primary)]" />
        </button>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Reliability Score</h2>
      </div>

      <div className="p-4 sm:p-6 flex flex-col gap-6">
        
        {/* Main Score Ring */}
        <div className="premium-card p-8 flex flex-col items-center justify-center text-center">
          <div className="relative w-40 h-40 flex items-center justify-center mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r={radius} className="stroke-[var(--border)] fill-none" strokeWidth="8" />
              <motion.circle 
                cx="70" cy="70" r={radius} 
                className="stroke-[var(--accent-primary)] fill-none stroke-round drop-shadow-[0_0_10px_rgba(var(--accent-primary-rgb),0.5)]" 
                strokeWidth="8"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-[var(--text-primary)]">{score}</span>
              <span className="text-[10px] uppercase text-[var(--text-secondary)] tracking-wider mt-1">
                {score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : score > 0 ? 'Building' : 'New'}
              </span>
            </div>
          </div>
          
          <p className="text-sm text-[var(--text-secondary)] mt-4 max-w-[280px]">
            Complete shifts and maintain a high check-in rate to grow your score and unlock priority dispatch.
          </p>
        </div>

        <div className="premium-card p-6">
          <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--accent-secondary)]" /> Score History
          </h3>
          <div className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-[var(--text-secondary)] mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium text-[var(--text-primary)]">No history yet</p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Your reliability trend will appear after completing shifts.</p>
          </div>
        </div>

        {/* Factor Breakdown */}
        <div className="premium-card p-6">
          <h3 className="font-bold text-[var(--text-primary)] mb-4">Score Factors</h3>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--success)]/10 flex items-center justify-center text-[var(--success)]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">Completion Rate</p>
                  <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide">High Impact</p>
                </div>
              </div>
              <span className="font-bold text-[var(--text-primary)]">{score > 0 ? '—' : '—'}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--success)]/10 flex items-center justify-center text-[var(--success)]">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">Business Rating</p>
                  <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide">Medium Impact</p>
                </div>
              </div>
              <span className="font-bold text-[var(--text-primary)]">—</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">Late Cancellations</p>
                  <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide">High Impact</p>
                </div>
              </div>
              <span className="font-bold text-[var(--text-primary)]">0</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
