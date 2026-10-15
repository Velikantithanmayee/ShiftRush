
import { Sun, Moon, LogOut, Terminal, Layers } from 'lucide-react';
import { Session, Page } from '../types';

interface HeaderProps {
  session: Session | null;
  darkMode: boolean;
  onToggleTheme: () => void;
  onSignOut: () => void;
  onNav: (p: Page) => void;
  onCommandPalette: () => void;
}

export function Header({ session, darkMode, onToggleTheme, onSignOut, onNav, onCommandPalette }: HeaderProps) {
  return (
    <header className="glass sticky top-0 z-40 w-full transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
        <button onClick={() => onNav(session ? 'dashboard' : 'landing')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)]">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="font-bold text-xl tracking-tight text-[var(--text-primary)]">
              ShiftRush
            </span>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--accent-secondary)] mt-0.5">
              Real-Time Shifts
            </span>
          </div>
        </button>

        {session && (
          <button onClick={onCommandPalette} className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--accent-secondary)] hover:text-[var(--text-primary)] transition-all shadow-sm">
            <Terminal className="w-3.5 h-3.5" />
            <span className="text-sm font-medium">Command</span>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[var(--surface-sec)] ml-2 border border-[var(--border)]">⌘K</kbd>
          </button>
        )}

        <div className="flex items-center gap-4">
          <button onClick={onToggleTheme} className="p-2.5 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)] transition-all shadow-sm">
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          {session ? (
            <div className="flex items-center gap-3">
              <button onClick={() => onNav('dashboard')} className="btn-secondary hidden sm:flex">Dashboard</button>
              <div className="h-6 w-px bg-[var(--border)] mx-1" />
              <button onClick={onSignOut} className="p-2.5 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--error)] hover:border-[var(--error)] transition-all shadow-sm" title="Sign Out">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button onClick={() => onNav('login')} className="btn-ghost">Sign in</button>
              <button onClick={() => onNav('register')} className="btn-primary">Get started</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
