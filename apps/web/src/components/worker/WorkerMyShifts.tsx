import React, { useState } from 'react';
import { Calendar, MapPin, Navigation, Forward, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shift } from '../../types';
import { WorkerShiftForwardModal } from './WorkerShiftForwardModal';

interface WorkerMyShiftsProps {
  shifts: Shift[];
  onForwardShift: (id: string) => void;
}

type SubTab = 'upcoming' | 'completed' | 'cancelled';

export function WorkerMyShifts({ shifts, onForwardShift }: WorkerMyShiftsProps) {
  const [activeTab, setActiveTab] = useState<SubTab>('upcoming');
  const [forwardingShiftId, setForwardingShiftId] = useState<string | null>(null);

  const filteredShifts = shifts.filter(s => {
    if (activeTab === 'upcoming') return s.status === 'claimed';
    if (activeTab === 'completed') return s.status === 'completed';
    if (activeTab === 'cancelled') return s.status === 'cancelled' || s.status === 'forwarded';
    return false;
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      
      {/* Sub Header */}
      <div className="bg-[var(--surface)]/90 backdrop-blur-lg border-b border-[var(--border)] pt-4 px-4 sticky top-0 z-30">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">My Shifts</h2>
        <div className="flex gap-4 border-b border-[var(--border)]">
          {(['upcoming', 'completed', 'cancelled'] as SubTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium capitalize relative transition-colors ${
                activeTab === tab ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="myshifts-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-primary)] rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <AnimatePresence mode="popLayout">
          {filteredShifts.map(shift => (
            <motion.div
              key={shift.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="premium-card p-5 mb-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-[var(--text-primary)] leading-tight">{shift.role}</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-0.5">{shift.businessName}</p>
                </div>
                {activeTab === 'upcoming' && (
                  <div className="text-right">
                    <p className="font-bold text-lg text-[var(--success)]">${shift.payRate}/hr</p>
                  </div>
                )}
                {activeTab === 'completed' && (
                  <div className="flex items-center gap-1 text-[var(--success)] bg-[var(--success)]/10 px-2 py-1 rounded-md text-xs font-bold">
                    <CheckCircle className="w-3.5 h-3.5" /> Done
                  </div>
                )}
                {activeTab === 'cancelled' && (
                  <div className="flex items-center gap-1 text-[var(--error)] bg-[var(--error)]/10 px-2 py-1 rounded-md text-xs font-bold">
                    <XCircle className="w-3.5 h-3.5" /> {shift.status}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 mb-4 bg-[var(--surface-sec)] p-3 rounded-xl border border-[var(--border)]">
                <div className="flex items-center gap-2 text-sm text-[var(--text-primary)] font-medium">
                  <Calendar className="w-4 h-4 text-[var(--accent-primary)]" />
                  {new Date(shift.startTime).toLocaleDateString()} • {new Date(shift.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(shift.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <div className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                  <MapPin className="w-4 h-4 text-[var(--accent-secondary)] mt-0.5" />
                  <span>{shift.address || 'Location hidden until 2hrs before shift'}<br/>{shift.area}, {shift.city} {shift.pinCode}</span>
                </div>
              </div>

              {activeTab === 'upcoming' && (
                <div className="flex gap-3">
                  <button className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2">
                    <Navigation className="w-4 h-4" /> Directions
                  </button>
                  <button 
                    onClick={() => setForwardingShiftId(shift.id)}
                    className="flex-1 btn-secondary py-2.5 text-sm flex items-center justify-center gap-2 bg-[var(--surface-sec)] text-[var(--text-primary)]"
                  >
                    <Forward className="w-4 h-4" /> Forward (+XP)
                  </button>
                </div>
              )}
              {activeTab === 'completed' && (
                <button className="w-full btn-secondary py-2.5 text-sm">Download Receipt</button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredShifts.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center text-center p-8 mt-10"
          >
            <div className="w-20 h-20 rounded-full bg-[var(--surface-sec)] flex items-center justify-center mb-4">
              <Calendar className="w-10 h-10 text-[var(--text-secondary)] opacity-50" />
            </div>
            <p className="font-medium text-[var(--text-primary)] text-lg">No {activeTab} shifts.</p>
            <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-[250px]">
              {activeTab === 'upcoming' ? "You don't have any shifts scheduled. Check the feed to claim one!" : "Your history is clean."}
            </p>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {forwardingShiftId && (
          <WorkerShiftForwardModal
            shiftId={forwardingShiftId}
            onClose={() => {
              setForwardingShiftId(null);
              onForwardShift(forwardingShiftId);
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
