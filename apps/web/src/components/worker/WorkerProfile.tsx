import React, { useState } from 'react';
import { User, Shield, Calendar, Upload, MapPin, CheckCircle, Clock } from 'lucide-react';
import { SessionUser } from '../../types';

interface WorkerProfileProps {
  session: { token: string, user: SessionUser };
}

export function WorkerProfile({ session }: WorkerProfileProps) {

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      
      {/* Header */}
      <div className="bg-[var(--surface)]/90 backdrop-blur-lg border-b border-[var(--border)] pt-4 px-4 pb-4 sticky top-0 z-30">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">My Profile</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 flex flex-col gap-6">
        
        {/* Profile Completion */}
        <div className="premium-card p-5 bg-gradient-to-br from-[var(--surface)] to-[var(--surface-sec)]">
          <div className="flex justify-between items-end mb-2">
            <h3 className="font-bold text-[var(--text-primary)]">Profile Strength</h3>
            <span className="font-bold text-[var(--text-secondary)] text-sm">Just started</span>
          </div>
          <div className="w-full h-2 bg-[var(--border)] rounded-full overflow-hidden mb-3">
            <div className="h-full bg-[var(--accent-primary)] rounded-full" style={{ width: `10%` }}></div>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">Complete your profile to increase your dispatch ranking.</p>
        </div>

        {/* Basic Info */}
        <div className="premium-card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-[var(--surface-sec)] border-2 border-[var(--border)] flex items-center justify-center shrink-0 relative overflow-hidden group cursor-pointer">
              <User className="w-8 h-8 text-[var(--text-secondary)]" />
              <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                <Upload className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-[10px] uppercase font-semibold text-[var(--text-secondary)]">Full Name</label>
              <input type="text" defaultValue={session.user.name} className="w-full bg-transparent border-b border-[var(--border)] text-lg font-bold text-[var(--text-primary)] pb-1 focus:outline-none focus:border-[var(--accent-primary)]" />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] uppercase font-semibold text-[var(--text-secondary)] mb-1 block">Bio / Summary</label>
              <textarea className="input-premium w-full text-sm" rows={3} placeholder="Tell businesses what you're great at — e.g. 5 years in specialty coffee, fast learner, available weekends." />
            </div>
          </div>
        </div>

        {/* Verification & Skills */}
        <div className="premium-card p-6">
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[var(--success)]" /> Skills & Credentials
          </h3>
          
          <div className="flex flex-col gap-3 mb-6">
            <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-sec)] flex justify-between items-center cursor-pointer hover:border-[var(--accent-primary)] transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-[var(--border)] group-hover:border-[var(--accent-primary)] transition-colors flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)]">
                  <Upload className="w-3 h-3" />
                </div>
                <div>
                  <p className="font-bold text-[var(--text-primary)] text-sm">Food Handler Card</p>
                  <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide">Upload to unlock more shifts</p>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-sec)] flex justify-between items-center cursor-pointer hover:border-[var(--accent-primary)] transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-[var(--border)] group-hover:border-[var(--accent-primary)] transition-colors flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)]">
                  <Upload className="w-3 h-3" />
                </div>
                <div>
                  <p className="font-bold text-[var(--text-primary)] text-sm">ID Verification</p>
                  <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide">Required to access all shifts</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-[10px] uppercase font-semibold text-[var(--text-secondary)] mb-1 block">Min Hourly Rate</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">$</span>
                <input type="number" defaultValue={20} className="input-premium pl-7 w-full" />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-[10px] uppercase font-semibold text-[var(--text-secondary)] mb-1 block">Max Radius</label>
              <div className="relative">
                <input type="number" defaultValue={15} className="input-premium pr-8 w-full" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">km</span>
              </div>
            </div>
          </div>
        </div>

        {/* Availability Grid */}
        <div className="premium-card p-6">
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--accent-secondary)]" /> Availability Engine
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
            Set your weekly availability. We will only dispatch shifts to you during these windows.
          </p>

          <div className="grid grid-cols-7 gap-1 text-center mb-6">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">{day}</div>
                <div className={`h-12 rounded-md ${i < 5 ? 'bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]' : 'bg-[var(--surface-sec)] border border-[var(--border)]'}`}></div>
              </div>
            ))}
          </div>

          <button className="w-full py-3 rounded-xl border border-[var(--border)] text-[var(--text-primary)] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[var(--surface-sec)] transition-colors">
            <Clock className="w-4 h-4" /> Edit Schedule
          </button>
        </div>

        <button className="btn-primary w-full py-3 font-bold">Save Changes</button>

      </div>
    </div>
  );
}
