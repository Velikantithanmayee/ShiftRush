import React, { useState } from 'react';
import { Compass, MapPin, Settings, CreditCard, User, DollarSign, Upload, Clock, Bell, BellOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Session, Shift, PaymentTransaction, TabId } from '../types';

import { WorkerShiftFeed } from './worker/WorkerShiftFeed';

type WorkerTab = 'find' | 'nearby' | 'settings';

interface WorkerDashboardProps {
  session: Session;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  shifts: Shift[];
  paymentsList: PaymentTransaction[];
  reliabilityScore: number;
  onClaimShift: (id: string) => void;
  onForwardShift: (id: string) => void;
}

export function WorkerDashboard({
  session,
  shifts,
  paymentsList,
  reliabilityScore,
  onClaimShift,
}: WorkerDashboardProps) {
  const [tab, setTab] = useState<WorkerTab>('find');
  const [pushEnabled, setPushEnabled] = useState(true);

  const openShifts = shifts.filter(s => s.status === 'open');
  const totalEarned = paymentsList.reduce((acc, p) => acc + (p.status === 'succeeded' ? p.amount : 0), 0);

  const tabs: { id: WorkerTab; label: string; icon: React.ReactNode }[] = [
    { id: 'find', label: 'Find Shifts', icon: <Compass className="w-5 h-5" /> },
    { id: 'nearby', label: 'Nearby', icon: <MapPin className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    switch (tab) {
      case 'find':
        return <WorkerShiftFeed shifts={shifts} onClaimShift={onClaimShift} />;

      case 'nearby':
        return (
          <div className="p-4 sm:p-8 max-w-2xl mx-auto pb-32 animate-fade-in">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Shifts Near You</h1>
            <p className="text-sm text-[var(--text-secondary)] mb-6">Open shifts within your radius, sorted by distance.</p>

            {openShifts.length === 0 ? (
              <div className="premium-card p-12 text-center border-dashed">
                <MapPin className="w-10 h-10 text-[var(--text-secondary)] mx-auto mb-3 opacity-30" />
                <h3 className="font-bold text-[var(--text-primary)] mb-1">No shifts nearby right now</h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto">
                  New shifts are posted frequently. Make sure your location radius is set in Settings.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {openShifts.map((shift, idx) => (
                  <motion.div
                    key={shift.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                    className="premium-card p-5 flex items-center justify-between gap-4 hover:border-[var(--accent-primary)] transition-colors cursor-pointer"
                    onClick={() => setTab('find')}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-[var(--text-primary)]">{shift.role}</p>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">{shift.businessName}</p>
                      <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {shift.distanceMeters ? `${(shift.distanceMeters / 1000).toFixed(1)} km away` : 'Nearby'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-lg text-[var(--success)]">${shift.payRate}/hr</p>
                      <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" />
                        {new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        );

      case 'settings':
        return (
          <div className="p-4 sm:p-8 max-w-2xl mx-auto pb-32 animate-fade-in flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Manage your account, pay, and notifications.</p>
            </div>

            {/* Identity */}
            <div className="premium-card p-6 flex flex-col gap-5">
              <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-[var(--accent-primary)]" /> Account
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[var(--surface-sec)] border border-[var(--border)] flex items-center justify-center text-xl font-bold text-[var(--text-primary)] uppercase shrink-0">
                  {session.user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[var(--text-primary)] truncate">{session.user.name}</p>
                  <p className="text-sm text-[var(--text-secondary)] truncate">{session.user.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Full Name</label>
                <input type="text" defaultValue={session.user.name} className="input-premium w-full" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Email</label>
                <input type="email" defaultValue={session.user.email} className="input-premium w-full" />
              </div>
              <button className="btn-primary py-2.5 font-bold text-sm">Save Changes</button>
            </div>

            {/* Payout */}
            <div className="premium-card p-6 flex flex-col gap-5">
              <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[var(--success)]" /> Pay & Payouts
              </h2>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-bold">Total Earned</p>
                  <p className="text-3xl font-bold text-[var(--text-primary)] mt-1">${totalEarned.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[var(--success)]/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-[var(--success)]" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
                <div className="relative z-10 flex items-start gap-4">
                  <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Connect Payout Account</h3>
                    <p className="text-sm text-indigo-100 mb-3 leading-relaxed">Link your bank via Stripe to receive instant payouts after shifts.</p>
                    <button className="bg-white text-indigo-600 font-bold px-4 py-2 rounded-lg text-sm hover:bg-indigo-50 transition-colors">
                      Setup Instant Payouts
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Min Hourly Rate ($)</label>
                <input type="number" defaultValue={20} className="input-premium w-full" />
                <p className="text-xs text-[var(--text-secondary)]">Only show shifts at or above this rate.</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Max Radius (km)</label>
                <input type="number" defaultValue={15} className="input-premium w-full" />
              </div>
            </div>

            {/* Credentials */}
            <div className="premium-card p-6 flex flex-col gap-4">
              <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-4 h-4 text-[var(--accent-secondary)]" /> Documents
              </h2>
              {[
                { label: 'Food Handler Card', desc: 'Upload to unlock hospitality shifts' },
                { label: 'ID Verification', desc: 'Required to access all shifts' },
              ].map(doc => (
                <div key={doc.label} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-sec)] flex items-center justify-between gap-3 cursor-pointer hover:border-[var(--accent-primary)] transition-colors group">
                  <div>
                    <p className="font-bold text-sm text-[var(--text-primary)]">{doc.label}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{doc.desc}</p>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-bold text-[var(--text-secondary)] group-hover:border-[var(--accent-primary)] group-hover:text-[var(--accent-primary)] transition-colors flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" /> Upload
                  </div>
                </div>
              ))}
            </div>

            {/* Notifications */}
            <div className="premium-card p-6 flex flex-col gap-4">
              <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-4 h-4 text-[var(--accent-primary)]" /> Notifications
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-[var(--text-primary)]">Push Notifications</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Instant alerts for new shifts nearby.</p>
                </div>
                <div
                  onClick={() => setPushEnabled(e => !e)}
                  className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${pushEnabled ? 'bg-[var(--accent-primary)]' : 'bg-[var(--border)]'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${pushEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>
            </div>

          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] pb-20 relative overflow-x-hidden">

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[var(--surface)]/80 backdrop-blur-md border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider">Worker</span>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">{session.user.name.split(' ')[0]}</h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-sec)] border border-[var(--border)]">
          <DollarSign className="w-3.5 h-3.5 text-[var(--success)]" />
          <span className="text-sm font-bold text-[var(--text-primary)]">${totalEarned.toFixed(2)}</span>
          <span className="text-xs text-[var(--text-secondary)]">earned</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-md mx-auto sm:max-w-[1200px] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
            className="w-full h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Nav — 3 tabs */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--surface)]/90 backdrop-blur-xl border-t border-[var(--border)] pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.1)]">
        <div className="max-w-md mx-auto sm:max-w-[1200px] flex items-center justify-around px-2 h-16">
          {tabs.map((t) => {
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                <div className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${isActive ? 'bg-[var(--surface-sec)] text-[var(--accent-primary)]' : ''}`}>
                  {t.icon}
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-[var(--text-primary)]' : ''}`}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

    </div>
  );
}
