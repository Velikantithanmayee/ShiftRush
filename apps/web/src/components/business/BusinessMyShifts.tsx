import React, { useState } from 'react';
import { Filter, Search, Calendar, Clock, MapPin, ChevronRight, X, AlertTriangle, MessageSquare, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusPill, UrgencyBadge } from '../UI';

import { Shift } from '../../types';

interface BusinessMyShiftsProps {
  shifts: Shift[];
  onCancelShift: (id: string) => void;
}

export function BusinessMyShifts({ shifts, onCancelShift }: BusinessMyShiftsProps) {
  const [filter, setFilter] = useState('all');
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const filteredShifts = shifts.filter(s => filter === 'all' || s.status === filter);

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto pb-32">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Shift Management</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Track open requests and active workers.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input type="text" placeholder="Search shifts..." className="input-premium pl-9 py-2 w-full sm:w-64 text-sm" />
          </div>
          <button className="p-2 border border-[var(--border)] rounded-xl bg-[var(--surface-sec)] text-[var(--text-primary)] hover:bg-[var(--border)] transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {['all', 'open', 'claimed', 'completed', 'cancelled'].map(f => (
          <button 
            key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-colors ${filter === f ? 'bg-[var(--text-primary)] text-[var(--surface)]' : 'bg-[var(--surface-sec)] text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)]'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Shift List */}
      <div className="flex flex-col gap-3">
        {filteredShifts.map(shift => (
          <div 
            key={shift.id} 
            onClick={() => setSelectedShift(shift)}
            className="premium-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:border-[var(--accent-primary)] group transition-all"
          >
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-full bg-[var(--surface-sec)] flex flex-col items-center justify-center shrink-0 border border-[var(--border)]">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">{shift.date === 'Today' ? 'TODAY' : 'OCT'}</span>
                <span className="text-sm font-bold text-[var(--text-primary)]">{shift.date === 'Today' ? new Date().getDate() : '23'}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-[var(--text-primary)]">{shift.role}</h3>
                  <StatusPill status={shift.status} />
                  {shift.urgency !== 'normal' && <UrgencyBadge level={shift.urgency} />}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {shift.time}</span>
                  {shift.status === 'open' && <span className="font-semibold text-[var(--accent-primary)]">{shift.matches} Matches Nearby</span>}
                  {shift.worker && <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1"><Users className="w-3 h-3" /> {shift.worker}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <ChevronRight className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors" />
            </div>
          </div>
        ))}

        {filteredShifts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[var(--text-secondary)] font-medium">No shifts found for this filter.</p>
          </div>
        )}
      </div>

      {/* Details Slide-Over (Drawer) */}
      <AnimatePresence>
        {selectedShift && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedShift(null)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-[var(--surface)] shadow-2xl border-l border-[var(--border)] flex flex-col"
            >
              <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-sec)]">
                <h2 className="font-bold text-[var(--text-primary)]">Shift Details</h2>
                <button onClick={() => setSelectedShift(null)} className="p-2 rounded-full hover:bg-[var(--border)] text-[var(--text-secondary)]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-2xl font-bold text-[var(--text-primary)]">{selectedShift.role}</h3>
                    <StatusPill status={selectedShift.status} />
                  </div>
                  <p className="text-[var(--text-secondary)] flex items-center gap-2"><MapPin className="w-4 h-4" /> Downtown Cafe</p>
                </div>

                <div className="bg-[var(--surface-sec)] rounded-xl p-4 space-y-3 border border-[var(--border)]">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Date</span>
                    <span className="font-bold text-[var(--text-primary)]">{selectedShift.date}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Time</span>
                    <span className="font-bold text-[var(--text-primary)]">{selectedShift.time}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Pay Rate</span>
                    <span className="font-bold text-[var(--text-primary)]">$22.00/hr</span>
                  </div>
                </div>

                {selectedShift.status === 'open' && (
                  <div className="bg-[var(--accent-primary)]/10 rounded-xl p-4 border border-[var(--accent-primary)]/20">
                    <p className="font-bold text-[var(--accent-primary)] mb-1 text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Finding Worker</p>
                    <p className="text-sm text-[var(--text-secondary)]">We have notified {selectedShift.matches} qualified workers in the area. Waiting for acceptance.</p>
                    <div className="w-full h-1 bg-[var(--border)] mt-3 rounded-full overflow-hidden">
                      <div className="h-full w-1/3 bg-[var(--accent-primary)] animate-pulse rounded-full"></div>
                    </div>
                  </div>
                )}

                {selectedShift.status === 'claimed' && (
                  <div className="flex flex-col gap-4">
                    <h4 className="font-bold text-[var(--text-primary)] text-sm uppercase tracking-wider">Assigned Worker</h4>
                    <div className="flex items-center justify-between premium-card p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center font-bold">
                          {selectedShift.worker?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-[var(--text-primary)]">{selectedShift.worker}</p>
                          <p className="text-xs text-[var(--text-secondary)]">Reliability: 98/100</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 bg-[var(--surface-sec)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]"><MessageSquare className="w-4 h-4" /></button>
                        <button className="p-2 bg-[var(--surface-sec)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]"><Phone className="w-4 h-4" /></button>
                      </div>
                    </div>

                    <h4 className="font-bold text-[var(--text-primary)] text-sm uppercase tracking-wider mt-2">Live Location</h4>
                    <div className="w-full h-48 bg-[var(--surface-sec)] rounded-xl border border-[var(--border)] relative overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                      {/* Fake Map Elements */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full animate-ping absolute"></div>
                        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md relative z-10"></div>
                        <div className="bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg mt-2 relative z-10 whitespace-nowrap">
                          {selectedShift.worker} (ETA: {selectedShift.eta})
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 bg-[var(--surface)] text-[10px] font-bold text-[var(--text-secondary)] px-2 py-1 rounded border border-[var(--border)]">MOCK MAP</div>
                    </div>
                  </div>
                )}
              </div>

              {selectedShift.status === 'open' && (
                <div className="p-4 border-t border-[var(--border)] bg-[var(--surface)]">
                  <button className="w-full py-3 rounded-xl font-bold text-[var(--error)] bg-[var(--error)]/10 hover:bg-[var(--error)]/20 transition-colors">
                    Cancel Shift
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
