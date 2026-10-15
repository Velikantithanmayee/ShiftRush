import React, { useEffect } from 'react';
import { Terminal, Search } from 'lucide-react';


interface CommandPaletteProps {
  show: boolean;
  onClose: () => void;
  onExecute: (cmd: string) => void;
}

export function CommandPalette({ show, onClose, onExecute }: CommandPaletteProps) {
  const [search, setSearch] = React.useState('');

  useEffect(() => {
    if (show) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [show]);

  if (!show) return null;

  const commands = [
    { id: 'go_shifts', label: 'Go to Shifts', icon: <Search className="w-4 h-4" /> },
    { id: 'go_payments', label: 'Go to Earnings/Payments', icon: <Search className="w-4 h-4" /> },
    { id: 'go_calendar', label: 'Availability Calendar', icon: <Search className="w-4 h-4" /> },
    { id: 'toggle_theme', label: 'Toggle Light/Dark Theme', icon: <Terminal className="w-4 h-4" /> },
    { id: 'signout', label: 'Sign out', icon: <Terminal className="w-4 h-4" /> },
  ];

  const filtered = commands.filter(c => c.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
      <div className="absolute inset-0" onClick={onClose} />
      <div className="glow-card w-full max-w-xl relative z-10 animate-scale-in flex flex-col">
        <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
          <Search className="w-5 h-5 text-gray-400" />
          <input 
            autoFocus 
            type="text" 
            placeholder="Type a command or search..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-lg"
            style={{ color: 'var(--text-primary)' }}
          />
          <kbd className="px-2 py-1 rounded-md text-xs font-mono" style={{ background: 'var(--surface-sec)', color: 'var(--text-secondary)' }}>ESC</kbd>
        </div>
        <div className="p-2 max-h-80 overflow-y-auto">
          {filtered.length > 0 ? filtered.map(cmd => (
            <button 
              key={cmd.id} 
              onClick={() => onExecute(cmd.id)}
              className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors hover:bg-[var(--surface-sec)]"
            >
              <div className="p-1.5 rounded-lg bg-[var(--surface-sec)] text-[var(--accent-secondary)]">{cmd.icon}</div>
              <span className="font-medium text-[var(--text-primary)]">{cmd.label}</span>
            </button>
          )) : (
            <p className="p-4 text-center text-sm text-[var(--text-secondary)]">No commands found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
