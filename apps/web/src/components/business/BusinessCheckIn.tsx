import React, { useState } from 'react';
import { QrCode, CheckCircle, Clock, AlertCircle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Shift } from '../../types';

interface BusinessCheckInProps {
  shifts: Shift[];
}

export function BusinessCheckIn({ shifts }: BusinessCheckInProps) {
  const claimedShifts = shifts.filter(s => s.status === 'claimed');
  const [checkedInIds, setCheckedInIds] = useState<string[]>([]);
  const [showScanner, setShowScanner] = useState(false);

  const handleCheckIn = (id: string) => {
    setCheckedInIds(prev => [...prev, id]);
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto pb-32">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Live Check-In</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Manage arrivals for today's shifts.</p>
        </div>
        <button 
          onClick={() => setShowScanner(true)}
          className="bg-[var(--text-primary)] text-[var(--surface)] px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <QrCode className="w-5 h-5" /> Scan QR Pass
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Main List */}
        <div className="flex-1 space-y-4">
          <div className="relative mb-6">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input type="text" placeholder="Search by name or role..." className="input-premium pl-9 py-2 w-full text-sm" />
          </div>

          <h3 className="font-bold text-[var(--text-primary)] text-sm uppercase tracking-wider mb-2">Today's Roster</h3>

          <AnimatePresence>
            {claimedShifts.map(s => {
              const isCheckedIn = checkedInIds.includes(s.id);
              const workerName = s.claimedByWorkerName || 'Assigned Worker';

              return (
                <motion.div 
                  key={s.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`premium-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 ${isCheckedIn ? 'border-l-[var(--success)]' : 'border-l-[var(--border)]'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${isCheckedIn ? 'bg-[var(--success)]/10 text-[var(--success)]' : 'bg-[var(--surface-sec)] text-[var(--text-secondary)]'}`}>
                      {workerName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--text-primary)]">{workerName}</h4>
                      <p className="text-sm text-[var(--text-secondary)] font-medium">{s.role}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="flex items-center gap-1 text-[var(--text-secondary)]"><Clock className="w-3 h-3" /> Shift ID: {s.id.substring(0,6)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {isCheckedIn ? (
                      <div className="flex items-center gap-2 text-[var(--success)] font-bold px-4 py-2 bg-[var(--success)]/10 rounded-lg">
                        <CheckCircle className="w-5 h-5" /> Verified
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleCheckIn(s.id)}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-lg border-2 border-[var(--border)] font-bold text-[var(--text-primary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/5 transition-all"
                      >
                        Verify Arrival
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {claimedShifts.length === 0 && (
            <div className="premium-card p-10 text-center border-dashed">
              <Clock className="w-10 h-10 text-[var(--text-secondary)] mx-auto mb-3 opacity-40" />
              <h4 className="font-bold text-[var(--text-primary)] text-base mb-1">No workers scheduled for today</h4>
              <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto">
                Once a worker claims a posted shift, they will appear here for live arrival verification.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Stats */}
        <div className="w-full md:w-72 space-y-4">
          <div className="premium-card p-5 bg-gradient-to-br from-[var(--surface)] to-[var(--surface-sec)]">
            <h3 className="font-bold text-[var(--text-primary)] text-sm uppercase tracking-wider mb-4">Arrival Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Total Expected</span>
                <span className="font-bold text-[var(--text-primary)]">{workers.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Checked In</span>
                <span className="font-bold text-[var(--success)]">{workers.filter(w=>w.status==='checked-in').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Pending</span>
                <span className="font-bold text-[var(--text-primary)]">{workers.filter(w=>w.status==='pending').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Delayed</span>
                <span className="font-bold text-[var(--error)]">{workers.filter(w=>w.status==='late').length}</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[var(--border)]">
              <button className="w-full py-2 bg-[var(--surface-sec)] text-[var(--text-secondary)] font-bold text-sm rounded-lg hover:bg-[var(--border)] hover:text-[var(--text-primary)] transition-colors">
                Download Roster
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* QR Scanner Modal Placeholder */}
      <AnimatePresence>
        {showScanner && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-[var(--surface)] p-6 rounded-2xl w-full max-w-sm relative">
              <button onClick={() => setShowScanner(false)} className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <X className="w-6 h-6" />
              </button>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Scan QR Pass</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Ask the worker to show their ShiftRush Passport QR code.</p>
              </div>
              <div className="aspect-square bg-black rounded-xl overflow-hidden relative border-2 border-[var(--border)]">
                {/* Scanner animation line */}
                <motion.div 
                  animate={{ top: ['0%', '100%', '0%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-0 right-0 h-0.5 bg-[var(--accent-primary)] shadow-[0_0_15px_rgba(var(--accent-primary-rgb),1)] z-10"
                />
                <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">Camera Feed Active</div>
                <div className="absolute inset-4 border-2 border-white/20 rounded-lg">
                  {/* Corner markers */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white/80 rounded-tl"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white/80 rounded-tr"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white/80 rounded-bl"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white/80 rounded-br"></div>
                </div>
              </div>
              <button onClick={() => {
                handleCheckIn('2'); // mock scan success
                setShowScanner(false);
              }} className="w-full mt-6 py-3 bg-[var(--accent-primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity">
                Simulate Successful Scan
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
