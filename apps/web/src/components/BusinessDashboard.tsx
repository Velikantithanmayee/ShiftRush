import React, { useState, useEffect } from 'react';
import { Home, Plus, List, CheckSquare, Users, CreditCard, Building2, Settings, Bell, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Session, Shift, TabId } from '../types';

import { BusinessHome } from './business/BusinessHome';
import { BusinessPostShift } from './business/BusinessPostShift';
import { BusinessMyShifts } from './business/BusinessMyShifts';
import { BusinessCheckIn } from './business/BusinessCheckIn';
import { BusinessWorkerPool } from './business/BusinessWorkerPool';
import { BusinessEarnings } from './business/BusinessEarnings';
import { BusinessTeam } from './business/BusinessTeam';
import { BusinessProfile } from './business/BusinessProfile';
import { BusinessNotifications } from './business/BusinessNotifications';

interface BusinessDashboardProps {
  session: Session;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  shifts: Shift[];
  onPostShift: (role: string, payRate: number, urgencyLevel: 'normal'|'high'|'critical', city: string, area: string, address: string, pinCode: string, radius: number) => void;
  onEditShift: (id: string, updates: any) => void;
  onCancelShift: (id: string) => void;
}

const NAV_ITEMS = [
  { id: 'home', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
  { id: 'post-shift', label: 'Post a Shift', icon: <Plus className="w-5 h-5" />, primary: true },
  { id: 'my-shifts', label: 'Shift Management', icon: <List className="w-5 h-5" /> },
  { id: 'check-in', label: 'Live Check-In', icon: <CheckSquare className="w-5 h-5" /> },
  { id: 'worker-pool', label: 'Worker Pool', icon: <Users className="w-5 h-5" /> },
  { id: 'earnings', label: 'Billing & Payouts', icon: <CreditCard className="w-5 h-5" /> },
  { id: 'team', label: 'Locations & Team', icon: <Building2 className="w-5 h-5" /> },
  { id: 'profile', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

export function BusinessDashboard({ session, activeTab, setActiveTab, shifts, onPostShift, onEditShift, onCancelShift }: BusinessDashboardProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <BusinessHome session={session} shifts={shifts} setActiveTab={setActiveTab} />;
      case 'post-shift': return <BusinessPostShift onPostShift={onPostShift} setActiveTab={setActiveTab} />;
      case 'my-shifts': return <BusinessMyShifts shifts={shifts} onCancelShift={onCancelShift} />;
      case 'check-in': return <BusinessCheckIn shifts={shifts} />;
      case 'worker-pool': return <BusinessWorkerPool />;
      case 'earnings': return <BusinessEarnings shifts={shifts} />;
      case 'team': return <BusinessTeam session={session} />;
      case 'profile': return <BusinessProfile session={session} />;
      case 'notifications': return <BusinessNotifications />;
      default: return <BusinessHome session={session} shifts={shifts} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[var(--background)] overflow-hidden">
      
      {/* Mobile Header & Hamburger */}
      <div className="lg:hidden absolute top-0 left-0 right-0 z-40 bg-[var(--surface)]/90 backdrop-blur-lg border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-[var(--surface-sec)] text-[var(--text-primary)]">
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="font-bold text-[var(--text-primary)] text-lg capitalize">{activeTab.replace('-', ' ')}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setActiveTab('notifications')} className="p-2 rounded-full bg-[var(--surface-sec)] text-[var(--text-primary)] relative hover:bg-[var(--border)] transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[var(--error)] rounded-full border-2 border-[var(--surface-sec)]"></span>
          </button>
        </div>
      </div>

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <AnimatePresence>
        {(isMobileMenuOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
          <>
            {isMobileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              />
            )}

            <motion.aside 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col shadow-2xl lg:shadow-none lg:transform-none ${isMobileMenuOpen ? 'block' : 'hidden lg:flex'}`}
            >
              <div className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[var(--text-primary)] text-lg leading-tight">{session.user.name}</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Business Account</p>
                </div>
                {isMobileMenuOpen && (
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2 text-[var(--text-secondary)]">
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>

              <nav className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-1">
                {NAV_ITEMS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as TabId)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      activeTab === item.id 
                        ? item.primary 
                          ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-[var(--accent-primary)]/30'
                          : 'bg-[var(--surface-sec)] text-[var(--text-primary)]'
                        : item.primary
                          ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/20'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--surface-sec)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="p-4 border-t border-[var(--border)]">
                <button 
                  onClick={() => setActiveTab('notifications')}
                  className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-sec)] hover:text-[var(--text-primary)] transition-all"
                >
                  <Bell className="w-5 h-5" />
                  Notifications
                  <span className="ml-auto bg-[var(--error)] text-white text-[10px] px-2 py-0.5 rounded-full">3</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden bg-[var(--background)] lg:pt-0 pt-[60px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-y-auto"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>

        {/* Sticky Mobile "Post Shift" FAB */}
        {activeTab !== 'post-shift' && (
          <div className="lg:hidden fixed bottom-6 right-6 z-30">
            <button 
              onClick={() => setActiveTab('post-shift')}
              className="w-14 h-14 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center shadow-lg shadow-[var(--accent-primary)]/40 hover:scale-105 active:scale-95 transition-transform"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        )}
      </main>

    </div>
  );
}
