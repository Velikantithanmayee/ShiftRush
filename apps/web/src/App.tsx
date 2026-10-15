import React, { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Session, Page, TabId, UserRole, Shift, PaymentTransaction, Notification, FraudAlert } from './types';
import { API, MOCK_SHIFTS } from './mocks';

import { Header } from './components/Header';
import { AuthShell } from './components/AuthShell';
import { CommandPalette } from './components/CommandPalette';
import { LandingPage } from './components/LandingPage';
import { WorkerDashboard } from './components/WorkerDashboard';
import { BusinessDashboard } from './components/BusinessDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Alert } from './components/UI';

export default function App() {
  // ── Session & Global State ──
  const [session, setSession] = useState<Session | null>(null);
  const [page, setPage] = useState<Page>('landing');
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  // ── Auth Form State ──
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [roleSelection, setRoleSelection] = useState<UserRole>('worker');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Dashboard Data State ──
  const [shifts, setShifts] = useState<Shift[]>(MOCK_SHIFTS);
  const [paymentsList] = useState<PaymentTransaction[]>([]);
  const [reliabilityScore] = useState(98);
  const [fraudAlerts] = useState<FraudAlert[]>([]);
  const [adminStats, setAdminStats] = useState<any>({});

  // ── Initialize ──
  useEffect(() => {
    const raw = localStorage.getItem('shiftrush_session');
    if (raw) {
      try {
        const parsed: Session = JSON.parse(raw);
        setSession(parsed);
        setPage('dashboard');
      } catch {
        localStorage.removeItem('shiftrush_session');
      }
    }
    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // ── Keyboard Shortcuts ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(p => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── Helpers ──
  const addNotification = (msg: string, type: 'info'|'success'|'warning'|'error' = 'info') => {
    setNotifications(prev => [{ id: Math.random().toString(), message: msg, read: false, timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), type }, ...prev.slice(0, 4)]);
  };

  const persistSession = (s: Session | null) => {
    setSession(s);
    if (s) {
      localStorage.setItem('shiftrush_session', JSON.stringify(s));
      setPage('dashboard');
    } else {
      localStorage.removeItem('shiftrush_session');
      setPage('landing');
    }
  };

  const toggleTheme = () => {
    setDarkMode(d => !d);
    document.documentElement.classList.toggle('dark');
  };

  const executeCommand = (cmd: string) => {
    setShowCommandPalette(false);
    const tabMap: Record<string, TabId> = { go_shifts: 'shifts', go_payments: 'payments', go_calendar: 'calendar' };
    if (tabMap[cmd]) {
      setActiveTab(tabMap[cmd]);
      if (page !== 'dashboard') setPage('dashboard');
    }
    else if (cmd === 'toggle_theme') toggleTheme();
    else if (cmd === 'signout') persistSession(null);
  };

  // ── Data Fetching ──
  const fetchData = useCallback(async (s: Session) => {
    try {
      const auth = { Authorization: `Bearer ${s.token}` };
      if (s.user.role === 'business') {
        const r = await fetch(`${API}/api/v1/shifts/dashboard`, { headers: auth });
        if (r.ok) { const d = await r.json(); setShifts(d.shifts || []); }
      } else if (s.user.role === 'worker') {
        const r = await fetch(`${API}/api/v1/shifts/nearby?lat=37.7749&lng=-122.4194`, { headers: auth });
        if (r.ok) setShifts(await r.json());
      } else if (s.user.role === 'admin') {
        const r = await fetch(`${API}/api/v1/admin/dashboard`, { headers: auth });
        if (r.ok) setAdminStats(await r.json());
      }
    } catch (e) {
      console.warn("API not reachable, using mock data.");
    }
  }, []);

  useEffect(() => {
    if (session) fetchData(session);
  }, [session, fetchData]);

  // ── WebSocket Integration ──
  useEffect(() => {
    if (!session) {
      if (socket) { socket.disconnect(); setSocket(null); }
      return;
    }
    
    const newSocket = io(API, { path: '/ws' });
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      newSocket.emit('join', `${session.user.role}:${session.user.id}`);
      if (session.user.role === 'worker') newSocket.emit('join', 'workers_global');
      if (session.user.role === 'business') newSocket.emit('join', 'business_global');
    });

    newSocket.on('shift:new', ({ shift }) => {
      setShifts(prev => [shift, ...prev]);
      if (session.user.role === 'worker') addNotification(`New Shift Available: ${shift.role} at $${shift.payRate}/hr`, 'info');
    });

    newSocket.on('shift:updated', ({ shiftId, payRate, urgencyLevel, role }) => {
      setShifts(prev => prev.map(s => s.id === shiftId ? { ...s, payRate: payRate || s.payRate, urgencyLevel: urgencyLevel || s.urgencyLevel, role: role || s.role } : s));
    });

    newSocket.on('shift:cancelled', ({ shiftId }) => {
      setShifts(prev => prev.filter(s => s.id !== shiftId));
      addNotification('A shift you were viewing was cancelled.', 'warning');
    });

    newSocket.on('shift:claimed', ({ shiftId, workerName }) => {
      setShifts(prev => prev.map(s => s.id === shiftId ? { ...s, status: 'claimed', claimedByWorkerName: workerName } : s));
      addNotification(`Shift ${shiftId.substring(0,6)} claimed by ${workerName}!`, 'success');
    });

    newSocket.on('shift:claimed_global', ({ shiftId }) => {
      // Remove it from the board for other workers so they can't claim it
      if (session.user.role === 'worker') {
        setShifts(prev => prev.filter(s => s.id !== shiftId || s.status === 'claimed'));
      }
    });

    newSocket.on('notification', ({ message }) => {
      addNotification(message, 'info');
    });

    return () => { newSocket.disconnect(); };
  }, [session]);

  // ── Actions ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErrorMsg(''); setSuccessMsg('');
    try {
      const res = await fetch(`${API}/api/v1/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed.');
      setSuccessMsg('Welcome back!');
      setTimeout(() => persistSession({ token: data.accessToken, user: data.user }), 600);
    } catch (err: any) { setErrorMsg(err.message); } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErrorMsg(''); setSuccessMsg('');
    try {
      const res = await fetch(`${API}/api/v1/auth/signup`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role: roleSelection }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed.');
      setSuccessMsg('Account created! Redirecting to sign in...');
      setTimeout(() => {
        setPage('login');
        setPassword('');
        setSuccessMsg('');
      }, 1500);
    } catch (err: any) { setErrorMsg(err.message); } finally { setLoading(false); }
  };

  const handleClaimShift = async (id: string) => {
    if (!session) return;
    try {
      const idempotencyKey = `claim-${id}-${Date.now()}`;
      const res = await fetch(`${API}/api/v1/shifts/${id}/claim`, { 
        method: 'POST', 
        headers: { Authorization: `Bearer ${session.token}`, 'x-idempotency-key': idempotencyKey } 
      });
      if (res.status === 409) {
        addNotification('Someone else grabbed this shift just before you did!', 'warning');
        setShifts(prev => prev.filter(s => s.id !== id));
        return;
      }
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Claim failed');
      }
      addNotification('Shift accepted! Added to your schedule.', 'success');
      fetchData(session);
    } catch (err: any) { alert(err.message); }
  };

  const handleForwardShift = async (id: string) => {
    if (!session) return;
    try {
      const res = await fetch(`${API}/api/v1/shifts/${id}/forward`, { method: 'POST', headers: { Authorization: `Bearer ${session.token}` } });
      if (!res.ok) throw new Error('Forward failed');
      addNotification('Shift forwarded. +XP awarded.', 'success');
      fetchData(session);
    } catch (err: any) { alert(err.message); }
  };

  const handlePostShift = async (role: string, payRate: number, urgencyLevel: 'normal'|'high'|'critical', city: string, area: string, address: string, pinCode: string, radius: number) => {
    if (!session) return;
    try {
      const res = await fetch(`${API}/api/v1/shifts`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({ role, requiredSkills: ['General'], payRate, urgencyLevel, city, area, address, pinCode, radius, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 14400000).toISOString(), latitude: 37.77, longitude: -122.41 }),
      });
      if (!res.ok) throw new Error('Failed to post shift');
      addNotification(`Shift "${role}" dispatched successfully.`, 'success');
      // No need to fetch data, socket will receive shift:new instantly
    } catch (err: any) { alert(err.message); }
  };

  const handleEditShift = async (id: string, updates: any) => {
    if (!session) return;
    try {
      const res = await fetch(`${API}/api/v1/shifts/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to edit shift');
      addNotification('Shift updated.', 'success');
    } catch (err: any) { alert(err.message); }
  };

  const handleCancelShift = async (id: string) => {
    if (!session) return;
    if (!confirm('Are you sure you want to cancel this shift?')) return;
    try {
      const res = await fetch(`${API}/api/v1/shifts/${id}/cancel`, {
        method: 'POST', headers: { Authorization: `Bearer ${session.token}` }
      });
      if (!res.ok) throw new Error('Failed to cancel shift');
      addNotification('Shift cancelled.', 'info');
    } catch (err: any) { alert(err.message); }
  };

  // Removed renderAuthPage

  return (
    <div className="min-h-screen flex flex-col relative transition-colors duration-300">
      <Header 
        session={session} 
        darkMode={darkMode} 
        onToggleTheme={toggleTheme} 
        onSignOut={() => persistSession(null)} 
        onNav={(p) => { setPage(p); setErrorMsg(''); setSuccessMsg(''); }} 
        onCommandPalette={() => setShowCommandPalette(true)}
      />

      <CommandPalette 
        show={showCommandPalette} 
        onClose={() => setShowCommandPalette(false)} 
        onExecute={executeCommand}
      />

      {page === 'landing' && <LandingPage onNav={setPage} setRoleSelection={setRoleSelection} />}
      {page === 'login' && (
        <AuthShell title="Sign in" sub="Welcome back to ShiftRush">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {errorMsg && <Alert type="error" msg={errorMsg} />}
            {successMsg && <Alert type="success" msg={successMsg} />}
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">Work Email</label>
              <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="input-premium" placeholder="name@company.com" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">Password</label>
              <input required type="password" value={password} onChange={e=>setPassword(e.target.value)} className="input-premium" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 py-3">
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
            <p className="text-center text-sm text-[var(--text-secondary)] mt-4">
              Don't have an account? <button type="button" onClick={() => setPage('register')} className="text-[var(--accent-primary)] font-semibold hover:underline">Register</button>
            </p>
          </form>
        </AuthShell>
      )}

      {page === 'register' && (
        <AuthShell title="Create Account" sub="Join the real-time shift marketplace">
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {errorMsg && <Alert type="error" msg={errorMsg} />}
            {successMsg && <Alert type="success" msg={successMsg} />}
            <div className="flex bg-[var(--surface-sec)] p-1 rounded-xl mb-2">
              {(['worker', 'business'] as UserRole[]).map(r => (
                <button key={r} type="button" onClick={() => setRoleSelection(r)} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all capitalize ${roleSelection === r ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm font-bold' : 'text-[var(--text-secondary)]'}`}>
                  {r === 'worker' ? 'Worker' : 'Business'}
                </button>
              ))}
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">Full Name</label>
              <input required type="text" value={name} onChange={e=>setName(e.target.value)} className="input-premium" placeholder="Jane Doe" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">Work Email</label>
              <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="input-premium" placeholder="name@company.com" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">Password</label>
              <input required type="password" value={password} onChange={e=>setPassword(e.target.value)} className="input-premium" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 py-3">
              {loading ? 'Creating...' : 'Create Account'}
            </button>
            <p className="text-center text-sm text-[var(--text-secondary)] mt-4">
              Already have an account? <button type="button" onClick={() => setPage('login')} className="text-[var(--accent-primary)] font-semibold hover:underline">Sign in</button>
            </p>
          </form>
        </AuthShell>
      )}
      
      {page === 'dashboard' && session && (
        <div className="flex-1 bg-mesh relative">
          {session.user.role === 'worker' && <WorkerDashboard session={session} activeTab={activeTab} setActiveTab={setActiveTab} shifts={shifts} paymentsList={paymentsList} reliabilityScore={reliabilityScore} onClaimShift={handleClaimShift} onForwardShift={handleForwardShift} />}
          {session.user.role === 'business' && <BusinessDashboard session={session} activeTab={activeTab} setActiveTab={setActiveTab} shifts={shifts} onPostShift={handlePostShift} onEditShift={handleEditShift} onCancelShift={handleCancelShift} />}
          {session.user.role === 'admin' && <AdminDashboard session={session} activeTab={activeTab} setActiveTab={setActiveTab} fraudAlerts={fraudAlerts} adminStats={adminStats} />}
        </div>
      )}
    </div>
  );
}
