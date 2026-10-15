import React, { useState } from 'react';
import { Filter, MapPin, Clock, DollarSign, Compass, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shift } from '../../types';
import { UrgencyBadge } from '../UI';

interface WorkerShiftFeedProps {
  shifts: Shift[];
  onClaimShift: (id: string) => void;
}

export function WorkerShiftFeed({ shifts, onClaimShift }: WorkerShiftFeedProps) {
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [claimingState, setClaimingState] = useState<'idle' | 'loading' | 'success'>('idle');
  const openShifts = shifts.filter(s => s.status === 'open');

  const handleClaim = () => {
    if (!selectedShift) return;
    setClaimingState('loading');
    setTimeout(() => {
      setClaimingState('success');
      setTimeout(() => {
        onClaimShift(selectedShift.id);
        setSelectedShift(null);
        setClaimingState('idle');
      }, 1000);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      
      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-30 bg-[var(--surface)]/90 backdrop-blur-lg border-b border-[var(--border)] px-4 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface-sec)] border border-[var(--border)] text-sm font-medium whitespace-nowrap text-[var(--text-primary)] shrink-0 hover:border-[var(--accent-primary)] transition-colors">
          <Filter className="w-3.5 h-3.5" /> All Filters
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface-sec)] border border-[var(--border)] text-sm font-medium whitespace-nowrap text-[var(--text-primary)] shrink-0 hover:border-[var(--accent-primary)] transition-colors">
          Distance <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface-sec)] border border-[var(--border)] text-sm font-medium whitespace-nowrap text-[var(--text-primary)] shrink-0 hover:border-[var(--accent-primary)] transition-colors">
          Pay Rate <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface-sec)] border border-[var(--border)] text-sm font-medium whitespace-nowrap text-[var(--text-primary)] shrink-0 hover:border-[var(--accent-primary)] transition-colors">
          Urgency <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 flex flex-col gap-4">
        <AnimatePresence>
          {openShifts.map(shift => (
            <motion.div 
              key={shift.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => setSelectedShift(shift)}
              className="premium-card p-5 cursor-pointer hover:border-[var(--accent-primary)] transition-colors active:scale-[0.98]"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg text-[var(--text-primary)] leading-tight">{shift.role}</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-0.5">{shift.businessName}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl text-[var(--success)]">${shift.payRate}</p>
                  <p className="text-[10px] text-[var(--text-secondary)] uppercase">per hr</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {shift.urgencyLevel !== 'normal' && <UrgencyBadge level={shift.urgencyLevel} />}
                {shift.requiredSkills.slice(0, 2).map(s => <span key={s} className="badge">{s.replace('_', ' ')}</span>)}
                {shift.requiredSkills.length > 2 && <span className="badge">+{shift.requiredSkills.length - 2}</span>}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-[var(--text-secondary)] pt-3 border-t border-[var(--border)]">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[var(--accent-primary)]" /> {new Date(shift.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[var(--accent-primary)]" /> {shift.distanceMeters ? `${(shift.distanceMeters/1000).toFixed(1)} km` : 'Nearby'}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {openShifts.length === 0 && (
          <div className="p-8 text-center text-[var(--text-secondary)]">
            <Compass className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-medium">No matches found right now.</p>
            <p className="text-sm mt-1">Try expanding your radius filter.</p>
          </div>
        )}
      </div>

      {/* Bottom Sheet Modal */}
      <AnimatePresence>
        {selectedShift && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => claimingState === 'idle' && setSelectedShift(null)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--surface)] rounded-t-3xl border-t border-[var(--border)] shadow-[0_-10px_40px_rgba(0,0,0,0.3)] max-w-md mx-auto sm:max-w-[1200px]"
            >
              <div className="w-12 h-1.5 bg-[var(--border)] rounded-full mx-auto my-3" />
              
              <div className="p-6 pb-safe">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] leading-tight">{selectedShift.role}</h2>
                    <p className="text-[var(--text-secondary)] mt-1">{selectedShift.businessName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-[var(--success)]">${selectedShift.payRate}</p>
                    <p className="text-xs text-[var(--text-secondary)] uppercase">per hr</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-[var(--surface-sec)] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-[var(--accent-primary)]" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-[var(--text-secondary)] font-semibold">Start Time</p>
                      <p className="font-bold text-[var(--text-primary)] text-sm">{new Date(selectedShift.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--surface-sec)] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-[var(--accent-primary)]" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-[var(--text-secondary)] font-semibold">Location</p>
                      <p className="font-bold text-[var(--text-primary)] text-sm">{selectedShift.distanceMeters ? `${(selectedShift.distanceMeters/1000).toFixed(1)} km` : 'Local'}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3">Requirements</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedShift.requiredSkills.map(s => <span key={s} className="badge bg-[var(--surface-sec)]">{s.replace('_', ' ')}</span>)}
                  </div>
                </div>

                <button 
                  onClick={handleClaim}
                  disabled={claimingState !== 'idle'}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                    claimingState === 'idle' ? 'bg-[var(--accent-primary)] text-white hover:opacity-90 active:scale-[0.98] shadow-lg shadow-[var(--accent-primary)]/30' :
                    claimingState === 'loading' ? 'bg-[var(--surface-sec)] text-[var(--text-primary)] cursor-wait' :
                    'bg-[var(--success)] text-white'
                  }`}
                >
                  {claimingState === 'idle' && 'Accept Shift'}
                  {claimingState === 'loading' && <span className="animate-pulse">Locking shift...</span>}
                  {claimingState === 'success' && <><Check className="w-6 h-6" /> Secured!</>}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
