import React, { useState } from 'react';
import { User, Building, FileText, Bell, Shield, Camera, Save } from 'lucide-react';
import { motion } from 'framer-motion';

import { Session } from '../../types';

interface BusinessProfileProps {
  session: Session;
}

export function BusinessProfile({ session }: BusinessProfileProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'tax' | 'notifications' | 'security'>('general');

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto pb-32">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Manage your business profile and preferences.</p>
        </div>
        <button className="btn-primary py-2.5 px-6 font-bold flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Settings Navigation */}
        <div className="w-full md:w-64 shrink-0 flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
          <button 
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'general' ? 'bg-[var(--surface-sec)] text-[var(--text-primary)] border border-[var(--border)]' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-sec)]/50 border border-transparent'}`}
          >
            <Building className="w-5 h-5" /> General Profile
          </button>
          <button 
            onClick={() => setActiveTab('tax')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'tax' ? 'bg-[var(--surface-sec)] text-[var(--text-primary)] border border-[var(--border)]' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-sec)]/50 border border-transparent'}`}
          >
            <FileText className="w-5 h-5" /> Tax & Legal
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'notifications' ? 'bg-[var(--surface-sec)] text-[var(--text-primary)] border border-[var(--border)]' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-sec)]/50 border border-transparent'}`}
          >
            <Bell className="w-5 h-5" /> Notifications
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'security' ? 'bg-[var(--surface-sec)] text-[var(--text-primary)] border border-[var(--border)]' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-sec)]/50 border border-transparent'}`}
          >
            <Shield className="w-5 h-5" /> Security
          </button>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
            className="premium-card p-6 sm:p-8 space-y-8"
          >
            {activeTab === 'general' && (
              <>
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Business Profile</h2>
                  <div className="flex items-center gap-6">
                    <div className="relative group cursor-pointer">
                      <div className="w-24 h-24 rounded-2xl bg-[var(--surface-sec)] border border-[var(--border)] flex items-center justify-center text-3xl font-bold text-[var(--text-primary)] uppercase">
                        {session.user.name.charAt(0)}
                      </div>
                      <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-[var(--text-primary)]">{session.user.name}</p>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">Recommended logo size: 512x512px.</p>
                      <button className="text-sm font-bold text-[var(--accent-primary)] mt-2 hover:underline">Upload Image</button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Business Name</label>
                    <input type="text" defaultValue={session.user.name} className="input-premium w-full" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Industry / Category</label>
                    <select className="input-premium w-full">
                      <option>Food & Beverage</option>
                      <option>Retail</option>
                      <option>Healthcare</option>
                      <option>Event Staffing</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Short Description</label>
                    <textarea className="input-premium w-full" rows={3} defaultValue="A busy cafe in the heart of downtown, serving specialty coffee and pastries."></textarea>
                    <p className="text-xs text-[var(--text-secondary)]">Workers will see this description when viewing your shifts.</p>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'tax' && (
              <>
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Tax & Legal Information</h2>
                  <p className="text-sm text-[var(--text-secondary)] mb-6">This information is required for end-of-year tax reporting (1099 generation) and platform compliance.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Legal Entity Name</label>
                      <input type="text" defaultValue="Downtown Cafe LLC" className="input-premium w-full" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Tax ID / EIN</label>
                      <input type="text" defaultValue="XX-XXXXXXX" className="input-premium w-full font-mono" />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Registered Address</label>
                      <input type="text" defaultValue="123 Main St, Suite 100, City Center, ST 12345" className="input-premium w-full" />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                  <h3 className="font-bold text-yellow-600 dark:text-yellow-500 text-sm mb-1">1099 Automation is Active</h3>
                  <p className="text-xs text-[var(--text-secondary)]">ShiftRush will automatically generate and send 1099 forms to any worker who earns over $600 from your business this year. <a href="#" className="underline">Learn more</a></p>
                </div>
              </>
            )}

            {activeTab === 'notifications' && (
              <>
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">Notification Preferences</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[var(--text-primary)]">Shift Accepted</p>
                      <p className="text-sm text-[var(--text-secondary)] mt-0.5">When a worker claims an open shift.</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-[var(--text-primary)] text-[var(--surface)] text-xs font-bold rounded-lg">Push</button>
                      <button className="px-3 py-1 bg-[var(--surface-sec)] text-[var(--text-secondary)] text-xs font-bold rounded-lg border border-[var(--border)]">SMS</button>
                    </div>
                  </div>
                  
                  <div className="w-full h-px bg-[var(--border)]"></div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[var(--text-primary)]">Worker Arrival</p>
                      <p className="text-sm text-[var(--text-secondary)] mt-0.5">When a worker checks in at your location.</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-[var(--text-primary)] text-[var(--surface)] text-xs font-bold rounded-lg">Push</button>
                      <button className="px-3 py-1 bg-[var(--text-primary)] text-[var(--surface)] text-xs font-bold rounded-lg">SMS</button>
                    </div>
                  </div>
                  
                  <div className="w-full h-px bg-[var(--border)]"></div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[var(--text-primary)]">No-Show Alert</p>
                      <p className="text-sm text-[var(--text-secondary)] mt-0.5">If a worker is &gt;15 minutes late to check in.</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-[var(--text-primary)] text-[var(--surface)] text-xs font-bold rounded-lg">Push</button>
                      <button className="px-3 py-1 bg-[var(--text-primary)] text-[var(--surface)] text-xs font-bold rounded-lg">SMS</button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'security' && (
              <>
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">Security & Login</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[var(--surface-sec)] border border-[var(--border)] rounded-xl">
                    <div>
                      <p className="font-bold text-[var(--text-primary)]">Password</p>
                      <p className="text-sm text-[var(--text-secondary)] mt-0.5">Last changed 3 months ago</p>
                    </div>
                    <button className="btn-secondary px-4 py-2 font-bold text-sm">Update</button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[var(--surface-sec)] border border-[var(--border)] rounded-xl">
                    <div>
                      <p className="font-bold text-[var(--text-primary)]">Two-Factor Authentication (2FA)</p>
                      <p className="text-sm text-[var(--text-secondary)] mt-0.5">Secure your account with an extra step</p>
                    </div>
                    <button className="bg-[var(--success)]/10 text-[var(--success)] px-4 py-2 font-bold text-sm rounded-lg">Enabled</button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>

      </div>
    </div>
  );
}
