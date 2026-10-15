import React, { useState } from 'react';
import { Bell, CheckCircle, AlertTriangle, Clock, Info, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_NOTIFS = [
  { id: '1', type: 'success', title: 'Shift Accepted', message: 'Maria Garcia accepted your Barista shift for today at 9:00 AM.', time: '2m ago', read: false },
  { id: '2', type: 'warning', title: 'Late Arrival Alert', message: 'Mike R. is running 15 minutes late for the Dishwasher shift.', time: '1h ago', read: false },
  { id: '3', type: 'info', title: 'Shift Dispatched', message: 'Your Line Cook shift has been sent to 24 matching workers.', time: '3h ago', read: true },
  { id: '4', type: 'success', title: 'Payout Successful', message: 'Weekly payout of $345.00 has been processed via Stripe.', time: '1d ago', read: true },
  { id: '5', type: 'alert', title: 'Coverage Warning', message: 'You have 1 unfilled shift starting in less than 2 hours.', time: '1d ago', read: true },
];

export function BusinessNotifications() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFS);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto pb-32">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
            Notifications
            {unreadCount > 0 && <span className="bg-[var(--error)] text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>}
          </h1>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm font-bold text-[var(--accent-primary)] hover:underline">
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {notifications.map((n) => {
            let Icon = Info;
            let iconColor = 'text-[var(--text-secondary)]';
            let bgClass = 'bg-[var(--surface-sec)]';

            if (n.type === 'success') {
              Icon = CheckCircle;
              iconColor = 'text-[var(--success)]';
              bgClass = 'bg-[var(--success)]/10 border-[var(--success)]/20';
            } else if (n.type === 'warning') {
              Icon = Clock;
              iconColor = 'text-yellow-600 dark:text-yellow-500';
              bgClass = 'bg-yellow-500/10 border-yellow-500/20';
            } else if (n.type === 'alert') {
              Icon = AlertTriangle;
              iconColor = 'text-[var(--error)]';
              bgClass = 'bg-[var(--error)]/10 border-[var(--error)]/20';
            } else if (n.title.includes('Dispatched')) {
              Icon = Navigation;
              iconColor = 'text-[var(--accent-primary)]';
              bgClass = 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/20';
            }

            return (
              <motion.div 
                key={n.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${n.read ? 'bg-[var(--surface)] border-[var(--border)] opacity-70 hover:opacity-100' : `border border-[var(--border)] ${bgClass}`}`}
              >
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${n.read ? 'bg-[var(--surface-sec)] text-[var(--text-secondary)]' : 'bg-[var(--surface)] shadow-sm'} ${iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-bold ${n.read ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>{n.title}</h3>
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] whitespace-nowrap">{n.time}</span>
                    </div>
                    <p className={`text-sm ${n.read ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>{n.message}</p>
                    
                    {!n.read && n.title === 'Shift Accepted' && (
                      <div className="mt-3 flex gap-2">
                        <button className="btn-primary py-1.5 px-4 text-xs">View Worker Profile</button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {notifications.length === 0 && (
          <div className="text-center py-20">
            <Bell className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4 opacity-50" />
            <p className="text-[var(--text-primary)] font-bold text-lg">You're all caught up!</p>
            <p className="text-[var(--text-secondary)] text-sm mt-1">No new notifications.</p>
          </div>
        )}
      </div>

    </div>
  );
}
