import React from 'react';
import { Layers } from 'lucide-react';

interface AuthShellProps {
  children: React.ReactNode;
  title: string;
  sub: string;
}

export function AuthShell({ children, title, sub }: AuthShellProps) {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-20 relative overflow-hidden bg-mesh">
      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white shadow-lg bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)]">
            <Layers className="w-8 h-8" />
          </div>
          <h2 className="text-4xl font-semibold tracking-tight text-[var(--text-primary)] mb-3">{title}</h2>
          <p className="text-[var(--text-secondary)] font-medium">{sub}</p>
        </div>
        <div className="glow-card p-8 sm:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}
