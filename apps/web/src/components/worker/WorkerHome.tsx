import React, { useState, useEffect } from 'react';
import { Power, ChevronRight, Activity, DollarSign, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Shift, TabId } from '../../types';
import { UrgencyBadge } from '../UI';

interface WorkerHomeProps {
  shifts: Shift[];
  setActiveTab: (tab: TabId) => void;
  reliabilityScore: number;
}

export function WorkerHome({ shifts, setActiveTab, reliabilityScore }: WorkerHomeProps) {
  const [isAvailable, setIsAvailable] = useState(true);

  // Derived stats
  const upcomingShifts = shifts.filter(s => s.status === 'claimed').sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  const nextShift = upcomingShifts[0];
  const openShifts = shifts.filter(s => s.status === 'open');

  // SVG Circular Progress logic
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (reliabilityScore / 100) * circumference;

  return (
    <div className="p-4 sm:p-6 pb-24 flex flex-col gap-6 animate-fade-in">
      
      {/* Availability Toggle */}
      <div className="premium-card p-6 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--surface)] via-[var(--accent-primary)] to-[var(--surface)] opacity-50"></div>
        <button 
          onClick={() => setIsAvailable(!isAvailable)}
          className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border-4 ${
            isAvailable 
              ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]/20 text-white shadow-[0_0_30px_rgba(var(--accent-primary-rgb),0.4)]' 
              : 'bg-[var(--surface-sec)] border-[var(--border)] text-[var(--text-secondary)] shadow-none'
          }`}
        >
          <Power className={`w-10 h-10 transition-transform duration-300 ${isAvailable ? 'scale-110' : 'scale-100'}`} />
        </button>
        <p className={`mt-4 font-bold text-lg ${isAvailable ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
          {isAvailable ? "I'm Available" : "Off Duty"}
        </p>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Tap to change status</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Reliability Score Ring */}
        <div className="premium-card p-5 flex items-center gap-4">
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r={radius} className="stroke-[var(--border)] fill-none" strokeWidth="6" />
              <motion.circle 
                cx="40" cy="40" r={radius} 
                className="stroke-[var(--accent-primary)] fill-none stroke-round" 
                strokeWidth="6"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-lg font-bold text-[var(--text-primary)] leading-none">{reliabilityScore}</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-secondary)]">Reliability</p>
            <p className="text-sm font-medium text-[var(--text-primary)] mt-0.5">{reliabilityScore >= 90 ? 'Excellent' : reliabilityScore >= 70 ? 'Good' : 'Building'}</p>
          </div>
        </div>

        <div className="premium-card p-5 flex flex-col justify-center">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-secondary)] flex items-center gap-1"><DollarSign className="w-3 h-3"/> Today</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">$0.00</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="premium-card p-4 text-center">
          <p className="text-xl font-bold text-[var(--text-primary)]">{shifts.filter(s => s.status === 'completed').length}</p>
          <p className="text-[10px] text-[var(--text-secondary)] uppercase mt-1">Completed</p>
        </div>
        <div className="premium-card p-4 text-center">
          <p className="text-xl font-bold text-[var(--success)]">{upcomingShifts.length}</p>
          <p className="text-[10px] text-[var(--text-secondary)] uppercase mt-1">Upcoming</p>
        </div>
        <div className="premium-card p-4 text-center">
          <p className="text-xl font-bold text-[var(--text-primary)]">{openShifts.length}</p>
          <p className="text-[10px] text-[var(--text-secondary)] uppercase mt-1">Near You</p>
        </div>
      </div>

      {/* Next Shift */}
      {nextShift && (
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 uppercase tracking-wider">Next Shift</h3>
          <div className="glow-card p-5 bg-gradient-to-br from-[var(--surface)] to-[var(--surface-sec)] relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-[var(--accent-primary)]/10 rounded-full blur-2xl"></div>
            <p className="font-bold text-lg text-[var(--text-primary)]">{nextShift.role}</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{nextShift.businessName}</p>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Starts</p>
                <p className="text-sm font-bold text-[var(--accent-primary)] mt-0.5">{new Date(nextShift.startTime).toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <button onClick={() => setActiveTab('my-shifts')} className="btn-secondary py-2 px-4 text-sm">View Details</button>
            </div>
          </div>
        </div>
      )}

      {/* Shifts Near You Preview */}
      <div>
        <div className="flex items-center justify-between mb-4 mt-2">
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--accent-secondary)]" /> Near You
          </h3>
          <button onClick={() => setActiveTab('feed')} className="text-sm text-[var(--accent-primary)] font-medium flex items-center">
            See All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex flex-col gap-3">
          {openShifts.slice(0, 3).map(shift => (
            <div key={shift.id} onClick={() => setActiveTab('feed')} className="premium-card p-4 cursor-pointer hover:border-[var(--accent-primary)] transition-colors flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-[var(--text-primary)]">{shift.role}</p>
                  {shift.urgencyLevel !== 'normal' && <UrgencyBadge level={shift.urgencyLevel} />}
                </div>
                <p className="text-xs text-[var(--text-secondary)]">{shift.businessName} • {shift.distanceMeters ? (shift.distanceMeters/1000).toFixed(1) + ' km' : 'Nearby'}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[var(--success)]">${shift.payRate}/hr</p>
              </div>
            </div>
          ))}
          {openShifts.length === 0 && (
            <div className="p-8 text-center bg-[var(--surface-sec)] rounded-2xl border border-[var(--border)]">
              <p className="text-[var(--text-primary)] font-medium">No open shifts nearby.</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">We'll alert you when one matches.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
