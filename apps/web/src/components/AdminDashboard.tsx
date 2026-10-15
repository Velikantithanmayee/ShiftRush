
import { ShieldAlert, Users, Building, Activity, Shield, BarChart2 } from 'lucide-react';
import { Session, TabId, FraudAlert } from '../types';

interface AdminDashboardProps {
  session: Session;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  fraudAlerts: FraudAlert[];
  adminStats: any;
}

export function AdminDashboard({ activeTab, setActiveTab, fraudAlerts, adminStats }: AdminDashboardProps) {
  
  const tabs = [
    { id: 'analytics', label: 'Platform Overview', icon: <Activity className="w-4 h-4" /> },
    { id: 'fraud', label: 'Fraud Detection', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'users', label: 'User Management', icon: <Users className="w-4 h-4" /> },
    { id: 'roadmap', label: 'Roadmap & Feedback', icon: <BarChart2 className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-fade-in">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Admin Control Center</h1>
          <p className="text-[var(--text-secondary)] mt-2">Platform-wide overview and security operations.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="premium-card px-5 py-3 flex items-center gap-3 border-l-4 border-l-[var(--success)]">
            <Shield className="w-5 h-5 text-[var(--success)]" />
            <div>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-semibold">System Status</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">Operational</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 border-b border-[var(--border)] pb-4 animate-slide-up delay-100">
        {tabs.map(t => (
          <button 
            key={t.id} 
            onClick={() => setActiveTab(t.id as TabId)}
            className={`tab-premium ${activeTab === t.id ? 'active' : ''}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="animate-slide-up delay-200">
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="premium-card p-6 border-t-4 border-t-[var(--accent-primary)]">
              <Users className="w-8 h-8 text-[var(--accent-primary)] mb-4" />
              <p className="text-3xl font-bold text-[var(--text-primary)]">{adminStats?.workers?.length || '1,420'}</p>
              <p className="text-sm text-[var(--text-secondary)] font-medium mt-1">Verified Workers</p>
            </div>
            <div className="premium-card p-6 border-t-4 border-t-[var(--accent-secondary)]">
              <Building className="w-8 h-8 text-[var(--accent-secondary)] mb-4" />
              <p className="text-3xl font-bold text-[var(--text-primary)]">{adminStats?.businesses?.length || 312}</p>
              <p className="text-sm text-[var(--text-secondary)] font-medium mt-1">Active Facilities</p>
            </div>
            <div className="premium-card p-6 border-t-4 border-t-[var(--success)]">
              <Activity className="w-8 h-8 text-[var(--success)] mb-4" />
              <p className="text-3xl font-bold text-[var(--text-primary)]">{adminStats?.analytics?.totalShifts || '14,892'}</p>
              <p className="text-sm text-[var(--text-secondary)] font-medium mt-1">All-Time Shifts</p>
            </div>
          </div>
        )}

        {activeTab === 'fraud' && (
          <div className="premium-card p-8">
            <div className="flex items-center justify-between mb-8 border-b border-[var(--border)] pb-6">
              <h3 className="text-xl font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-[var(--error)]" /> Active Fraud Alerts
              </h3>
            </div>
            <div className="flex flex-col gap-4">
              {fraudAlerts.length > 0 ? fraudAlerts.map(alert => (
                <div key={alert.id} className="p-4 rounded-xl border border-[var(--error)] bg-red-50/50 dark:bg-red-900/10 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-[var(--error)] uppercase text-xs tracking-wider">{alert.severity} Risk</span>
                      <span className="text-xs text-[var(--text-secondary)]">{new Date(alert.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="font-medium text-[var(--text-primary)]">{alert.reason}</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Target ID: {alert.targetId}</p>
                  </div>
                  <button className="btn-secondary text-xs px-3 py-1.5 border-[var(--error)] text-[var(--error)] hover:bg-[var(--error)] hover:text-white transition-colors">
                    Investigate
                  </button>
                </div>
              )) : (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 mx-auto text-[var(--success)] mb-4 opacity-50" />
                  <p className="font-medium text-[var(--text-primary)]">No active fraud alerts.</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Systems are secure.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
