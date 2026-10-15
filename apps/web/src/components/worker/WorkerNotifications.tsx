import React, { useState } from 'react';
import { Bell, ChevronLeft, Settings, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Notification, TabId } from '../../types';

interface WorkerNotificationsProps {
  notifications: Notification[];
  setActiveTab: (tab: TabId) => void;
}

export function WorkerNotifications({ notifications, setActiveTab }: WorkerNotificationsProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    push: true,
    sms: false,
    email: true,
    marketing: false
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-[var(--success)]" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-[var(--error)]" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <Info className="w-5 h-5 text-[var(--accent-primary)]" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--background)] absolute inset-0 z-50 overflow-y-auto pb-24">
      {/* Header */}
      <div className="bg-[var(--surface)]/90 backdrop-blur-lg border-b border-[var(--border)] pt-4 px-4 pb-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveTab('home')} className="p-2 -ml-2 rounded-full hover:bg-[var(--surface-sec)] transition-colors">
            <ChevronLeft className="w-6 h-6 text-[var(--text-primary)]" />
          </button>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Notifications</h2>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="p-2 -mr-2 rounded-full hover:bg-[var(--surface-sec)] transition-colors">
          <Settings className="w-5 h-5 text-[var(--text-secondary)]" />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {showSettings ? (
          <div className="premium-card p-6 animate-fade-in">
            <h3 className="font-bold text-[var(--text-primary)] mb-6">Notification Preferences</h3>
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-[var(--text-primary)]">Push Notifications</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Instant alerts for new shifts nearby.</p>
                </div>
                <div 
                  onClick={() => setPreferences(p => ({ ...p, push: !p.push }))}
                  className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${preferences.push ? 'bg-[var(--accent-primary)]' : 'bg-[var(--border)]'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${preferences.push ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-[var(--text-primary)]">SMS Alerts</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Text messages for critical updates.</p>
                </div>
                <div 
                  onClick={() => setPreferences(p => ({ ...p, sms: !p.sms }))}
                  className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${preferences.sms ? 'bg-[var(--accent-primary)]' : 'bg-[var(--border)]'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${preferences.sms ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-[var(--text-primary)]">Email Digest</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Daily summary of your earnings and activity.</p>
                </div>
                <div 
                  onClick={() => setPreferences(p => ({ ...p, email: !p.email }))}
                  className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${preferences.email ? 'bg-[var(--accent-primary)]' : 'bg-[var(--border)]'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${preferences.email ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>
            </div>
            <button onClick={() => setShowSettings(false)} className="w-full btn-secondary mt-8 py-3">Done</button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 animate-fade-in">
            {notifications.length > 0 ? notifications.map(n => (
              <div key={n.id} className={`premium-card p-4 flex gap-4 ${!n.read ? 'border-[var(--accent-primary)]/50 bg-[var(--accent-primary)]/5' : ''}`}>
                <div className="shrink-0 mt-1">
                  {getIcon(n.type)}
                </div>
                <div>
                  <p className={`text-sm ${!n.read ? 'font-bold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                    {n.message}
                  </p>
                  <p className="text-[10px] uppercase text-[var(--text-secondary)] font-semibold mt-2">{n.timestamp}</p>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-[var(--text-secondary)]">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="font-medium text-lg text-[var(--text-primary)]">All Caught Up</p>
                <p className="mt-2 text-sm">You have no new notifications.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
