

export function UrgencyBadge({ level }: { level: string }) {
  const cls: Record<string, string> = { critical: 'badge-error', high: 'badge-accent', normal: 'badge-accent-secondary' };
  return <span className={`badge ${cls[level] || 'badge-accent-secondary'}`}>{level.toUpperCase()}</span>;
}

export function StatusPill({ status }: { status: string }) {
  const cls: Record<string, string> = { 
    open: 'badge-accent', 
    claimed: 'badge-accent-secondary', 
    completed: 'badge-success', 
    cancelled: 'badge-error', 
    forwarded: 'badge' 
  };
  return <span className={`badge ${cls[status] || 'badge'}`}>{status.toUpperCase()}</span>;
}

export function Alert({ type, msg }: { type: 'error' | 'success'; msg: string }) {
  const isError = type === 'error';
  return (
    <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${isError ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400' : 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:border-green-900/50 dark:text-green-400'}`}>
      {msg}
    </div>
  );
}

export function SkeletonLoader({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-16 w-full" style={{ animationDelay: `${i * 100}ms` }} />
      ))}
    </div>
  );
}
