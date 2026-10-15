import React, { useState } from 'react';
import { Forward, X, Users, Zap, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkerShiftForwardModalProps {
  shiftId: string;
  onClose: () => void;
}

export function WorkerShiftForwardModal({ shiftId, onClose }: WorkerShiftForwardModalProps) {
  const [state, setState] = useState<'idle' | 'processing' | 'success'>('idle');

  const handleForward = () => {
    setState('processing');
    // Simulate API call
    setTimeout(() => {
      setState('success');
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={state === 'idle' ? onClose : undefined}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 w-full max-w-sm shadow-2xl overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {state === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-[var(--accent-secondary)]/10 flex items-center justify-center text-[var(--accent-secondary)]">
                  <Forward className="w-6 h-6" />
                </div>
                <button onClick={onClose} className="p-2 -mr-2 -mt-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Forward this Shift?</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
                Can't make it? Forwarding sends this shift back to the network instantly. If another worker claims it, your Reliability Score is protected.
              </p>

              <div className="bg-[var(--surface-sec)] p-4 rounded-xl border border-[var(--border)] mb-6 space-y-3">
                <div className="flex items-start gap-3">
                  <Users className="w-4 h-4 text-[var(--accent-primary)] mt-0.5 shrink-0" />
                  <p className="text-xs text-[var(--text-primary)]">Instantly alerts 14 nearby workers with matching skills.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-[var(--text-primary)]">Earn +50 XP if the shift is successfully covered by someone else.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 font-bold text-sm text-[var(--text-primary)] bg-[var(--surface-sec)] rounded-xl hover:bg-[var(--border)] transition-colors">
                  Nevermind
                </button>
                <button onClick={handleForward} className="flex-1 py-3 font-bold text-sm text-white bg-[var(--accent-secondary)] rounded-xl shadow-lg shadow-[var(--accent-secondary)]/30 hover:opacity-90 transition-opacity">
                  Forward Now
                </button>
              </div>
            </motion.div>
          )}

          {state === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-8">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-[var(--border)] rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[var(--accent-secondary)] rounded-full border-t-transparent animate-spin"></div>
                <Forward className="w-8 h-8 text-[var(--accent-secondary)] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Dispatching...</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-2 text-center">Alerting nearby workers</p>
            </motion.div>
          )}

          {state === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-8">
              <div className="w-20 h-20 bg-[var(--success)]/10 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-[var(--success)]" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] text-center">Shift Forwarded!</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-2 text-center leading-relaxed">
                We'll notify you if it gets covered. Your schedule has been updated.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
