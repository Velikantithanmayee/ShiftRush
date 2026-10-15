import React, { useState } from 'react';
import { MapPin, Users, Plus, Edit2, Trash2, Mail, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_LOCATIONS = [
  { id: '1', name: 'Downtown Cafe', address: '123 Main St, City Center', manager: 'Sarah Jenkins', active: true },
  { id: '2', name: 'Uptown Roastery', address: '456 Oak Ave, Northside', manager: 'Mike R.', active: true },
];

const MOCK_TEAM = [
  { id: '1', name: 'Sarah Jenkins', email: 'sarah@cafe.com', role: 'Owner', location: 'All Locations' },
  { id: '2', name: 'Mike R.', email: 'mike@cafe.com', role: 'Manager', location: 'Uptown Roastery' },
];

export function BusinessTeam() {
  const [view, setView] = useState<'locations' | 'team'>('locations');

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto pb-32">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Organization</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Manage your business locations and team permissions.</p>
        </div>
        <button className="btn-primary py-2.5 px-4 font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" /> {view === 'locations' ? 'Add Location' : 'Invite Member'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-[var(--border)] pb-4">
        <button 
          onClick={() => setView('locations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${view === 'locations' ? 'bg-[var(--text-primary)] text-[var(--surface)]' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-sec)]'}`}
        >
          <MapPin className="w-4 h-4" /> Locations
        </button>
        <button 
          onClick={() => setView('team')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${view === 'team' ? 'bg-[var(--text-primary)] text-[var(--surface)]' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-sec)]'}`}
        >
          <Users className="w-4 h-4" /> Team Members
        </button>
      </div>

      {/* Content */}
      <motion.div 
        key={view}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
      >
        {view === 'locations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_LOCATIONS.map(loc => (
              <div key={loc.id} className="premium-card p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--surface-sec)] border border-[var(--border)] flex items-center justify-center text-[var(--text-primary)]">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--text-primary)] text-lg">{loc.name}</h3>
                      <span className="text-[10px] uppercase font-bold text-[var(--success)] bg-[var(--success)]/10 px-2 py-0.5 rounded">Active</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-sec)] hover:text-[var(--text-primary)] transition-colors"><Edit2 className="w-4 h-4" /></button>
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  <p className="text-sm text-[var(--text-secondary)]">{loc.address}</p>
                  <p className="text-sm text-[var(--text-secondary)]">Managed by <strong className="text-[var(--text-primary)]">{loc.manager}</strong></p>
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'team' && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--surface-sec)] text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-bold">
                    <th className="p-4 border-b border-[var(--border)]">Name</th>
                    <th className="p-4 border-b border-[var(--border)]">Role</th>
                    <th className="p-4 border-b border-[var(--border)]">Access</th>
                    <th className="p-4 border-b border-[var(--border)]"></th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_TEAM.map((member) => (
                    <tr key={member.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-sec)]/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center font-bold text-xs border border-[var(--accent-primary)]/20">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-[var(--text-primary)] text-sm">{member.name}</p>
                            <p className="text-xs text-[var(--text-secondary)]">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--text-secondary)] bg-[var(--surface-sec)] border border-[var(--border)] px-2 py-1 rounded">
                          <Shield className="w-3 h-3" /> {member.role}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">{member.location}</td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2 rounded-lg hover:bg-[var(--surface-sec)]">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {member.role !== 'Owner' && (
                          <button className="text-[var(--text-secondary)] hover:text-[var(--error)] transition-colors p-2 rounded-lg hover:bg-[var(--error)]/10">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

    </div>
  );
}
