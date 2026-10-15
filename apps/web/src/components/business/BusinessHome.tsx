import React from 'react';
import { MapPin, Users, Plus, AlertCircle, Clock, CheckCircle, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { Session, Shift, TabId } from '../../types';

interface BusinessHomeProps {
  session: Session;
  shifts: Shift[];
  setActiveTab: (tab: TabId) => void;
}

export function BusinessHome({ session, shifts, setActiveTab }: BusinessHomeProps) {
  const openShifts = shifts.filter(s => s.status === 'open');
  const claimedShifts = shifts.filter(s => s.status === 'claimed');
  const criticalShifts = openShifts.filter(s => s.urgencyLevel === 'critical' || s.urgencyLevel === 'high');

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto flex flex-col gap-8 pb-24">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Good morning, {session.user.name}.
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Here is your live shift status overview.</p>
        </div>
        <button 
          onClick={() => setActiveTab('post-shift')}
          className="btn-primary px-5 py-2.5 font-semibold text-sm flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Post a Shift
        </button>
      </div>

      {/* Real Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="premium-card p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--surface-sec)] text-[var(--accent-primary)] flex items-center justify-center border border-[var(--border)]">
              <Clock className="w-5 h-5" />
            </div>
            {openShifts.length > 0 && (
              <span className="badge badge-accent font-bold">Live</span>
            )}
          </div>
          <p className="text-4xl font-bold text-[var(--text-primary)] mb-1">{openShifts.length}</p>
          <p className="text-sm font-bold text-[var(--text-secondary)]">Active Open Shifts</p>
          {criticalShifts.length > 0 ? (
            <p className="text-xs text-[var(--error)] font-semibold mt-3 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {criticalShifts.length} urgent coverage request{criticalShifts.length > 1 ? 's' : ''}
            </p>
          ) : (
            <p className="text-xs text-[var(--text-secondary)] mt-3">All open shifts normal priority</p>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="premium-card p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--surface-sec)] text-[var(--success)] flex items-center justify-center border border-[var(--border)]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-4xl font-bold text-[var(--text-primary)] mb-1">{claimedShifts.length}</p>
          <p className="text-sm font-bold text-[var(--text-secondary)]">Shifts Claimed by Workers</p>
          <p className="text-xs text-[var(--text-secondary)] mt-3">Workers assigned and scheduled</p>
        </motion.div>
      </div>

      {/* Main Shift Status or Empty State */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[var(--text-primary)] text-lg">Current Posted Shifts</h3>
          {shifts.length > 0 && (
            <button onClick={() => setActiveTab('my-shifts')} className="text-xs font-bold text-[var(--accent-primary)] hover:underline">
              View all shifts &rarr;
            </button>
          )}
        </div>

        {shifts.length === 0 ? (
          <div className="premium-card p-10 text-center flex flex-col items-center justify-center border-dashed">
            <div className="w-14 h-14 rounded-2xl bg-[var(--surface-sec)] text-[var(--text-secondary)] flex items-center justify-center mb-4 border border-[var(--border)]">
              <Activity className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg text-[var(--text-primary)] mb-2">No active shifts posted yet</h4>
            <p className="text-sm text-[var(--text-secondary)] max-w-md mb-6 leading-relaxed">
              When an employee calls out sick, click below to dispatch a shift request to nearby qualified workers instantly.
            </p>
            <button 
              onClick={() => setActiveTab('post-shift')}
              className="btn-primary px-6 py-3 font-semibold text-sm flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Post Your First Shift
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {shifts.slice(0, 4).map(shift => (
              <div key={shift.id} className="premium-card p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-[var(--text-primary)]">{shift.role}</h4>
                    <span className={`badge ${shift.status === 'claimed' ? 'badge-success' : 'badge-accent'}`}>
                      {shift.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] font-medium">
                    ${shift.payRate.toFixed(2)}/hr • Urgency: {shift.urgencyLevel}
                  </p>
                </div>
                <button 
                  onClick={() => setActiveTab('my-shifts')} 
                  className="btn-secondary py-1.5 px-3 text-xs font-semibold"
                >
                  Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
