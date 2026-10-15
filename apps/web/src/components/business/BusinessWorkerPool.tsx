import React, { useState } from 'react';
import { Star, ShieldBan, Search, Filter, Mail, Users, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export function BusinessWorkerPool() {
  const [workers] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredWorkers = workers.filter(w => {
    if (filter === 'favorites' && w.status !== 'favorite') return false;
    if (filter === 'blocked' && w.status !== 'blocked') return false;
    if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto pb-32">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Worker Pool</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Manage your trusted on-demand workforce.</p>
        </div>
        <button className="btn-primary py-2.5 px-4 font-bold flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Invite Worker
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="premium-card p-4">
          <p className="text-[10px] uppercase text-[var(--text-secondary)] font-bold mb-1 tracking-wider">Total Pool</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{workers.length}</p>
        </div>
        <div className="premium-card p-4 border-b-4 border-b-[var(--accent-primary)]">
          <p className="text-[10px] uppercase text-[var(--text-secondary)] font-bold mb-1 tracking-wider flex items-center gap-1"><Star className="w-3 h-3 text-[var(--accent-primary)]" /> Favorites</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">0</p>
        </div>
        <div className="premium-card p-4">
          <p className="text-[10px] uppercase text-[var(--text-secondary)] font-bold mb-1 tracking-wider">Avg Rating</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">—</p>
        </div>
        <div className="premium-card p-4 border-b-4 border-b-[var(--error)]">
          <p className="text-[10px] uppercase text-[var(--text-secondary)] font-bold mb-1 tracking-wider flex items-center gap-1"><ShieldBan className="w-3 h-3 text-[var(--error)]" /> Blocked</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">0</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input 
            type="text" placeholder="Search by name..." 
            value={search} onChange={e=>setSearch(e.target.value)}
            className="input-premium pl-9 py-2 w-full text-sm" 
          />
        </div>
        <div className="flex gap-2">
          {['all', 'favorites', 'blocked'].map(f => (
            <button 
              key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-colors ${filter === f ? 'bg-[var(--text-primary)] text-[var(--surface)]' : 'bg-[var(--surface-sec)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)]'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredWorkers.map((w, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
            key={w.id} className={`premium-card p-5 relative overflow-hidden group ${w.status === 'blocked' ? 'opacity-70' : ''}`}
          >
            {w.status === 'favorite' && (
              <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--accent-primary)]/10 rounded-bl-full flex items-start justify-end p-3 pointer-events-none">
                <Star className="w-4 h-4 text-[var(--accent-primary)] fill-[var(--accent-primary)]" />
              </div>
            )}
            {w.status === 'blocked' && (
              <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--error)]/10 rounded-bl-full flex items-start justify-end p-3 pointer-events-none">
                <ShieldBan className="w-4 h-4 text-[var(--error)]" />
              </div>
            )}

            <div className="flex gap-4">
              <div className="w-14 h-14 rounded-full bg-[var(--surface-sec)] border border-[var(--border)] flex items-center justify-center font-bold text-xl text-[var(--text-primary)] shrink-0">
                {w.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[var(--text-primary)] text-lg truncate pr-8">{w.name}</h3>
                <p className="text-sm text-[var(--text-secondary)] truncate">{w.role}</p>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm">
                  <span className="flex items-center gap-1 font-bold text-[var(--text-primary)]">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> {w.rating}
                  </span>
                  <span className="text-[var(--text-secondary)]">
                    <strong className="text-[var(--text-primary)]">{w.completed}</strong> shifts
                  </span>
                  <span className="text-[var(--text-secondary)] text-xs">
                    Last: {w.lastSeen}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[var(--border)] flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1">
                <Mail className="w-4 h-4" /> Message
              </button>
              <div className="flex gap-2">
                {w.status !== 'favorite' && (
                  <button className="text-xs font-bold px-3 py-1.5 rounded-lg border border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10">
                    Favorite
                  </button>
                )}
                {w.status === 'favorite' && (
                  <button className="text-xs font-bold px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-sec)]">
                    Remove Favorite
                  </button>
                )}
                {w.status !== 'blocked' && (
                  <button className="text-xs font-bold px-3 py-1.5 rounded-lg border border-[var(--error)] text-[var(--error)] hover:bg-[var(--error)]/10">
                    Block
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {filteredWorkers.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center py-16">
            <Users className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4 opacity-50" />
            <p className="text-[var(--text-secondary)] font-medium">No workers found in this category.</p>
          </div>
        )}
      </div>

    </div>
  );
}
