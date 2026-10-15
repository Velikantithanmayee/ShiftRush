import React, { useState } from 'react';
import { ArrowRight, Clock, Shield, Zap, CheckCircle, MapPin, Users, Smartphone, Check, Sparkles, Building2, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserRole } from '../types';

interface LandingPageProps {
  onNav: (page: any) => void;
  setRoleSelection: (role: UserRole) => void;
}

export function LandingPage({ onNav, setRoleSelection }: LandingPageProps) {
  const [demoState, setDemoState] = useState<'idle' | 'matching' | 'claimed'>('idle');

  const triggerDemo = () => {
    setDemoState('matching');
    setTimeout(() => setDemoState('claimed'), 2500);
  };

  return (
    <main className="flex-1 relative overflow-hidden bg-mesh pb-24">
      
      {/* ── 1. HERO SECTION ── */}
      <section className="relative z-10 max-w-[1100px] mx-auto px-6 pt-20 sm:pt-28 pb-16 text-center animate-fade-in">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface-sec)] border border-[var(--border)] text-[var(--accent-primary)] text-xs font-semibold mb-8 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" /> Built for last-minute, hourly shift gaps
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-[-0.04em] max-w-4xl mx-auto text-[var(--text-primary)]">
          Fill your same-day shift gaps in <span className="text-gradient">minutes.</span>
        </h1>
        
        <p className="mt-6 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed font-normal text-[var(--text-secondary)]">
          ShiftRush is a real-time shift marketplace connecting local businesses with qualified, available hourly workers instantly. No agencies. No dead-end group chats.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <button 
            onClick={() => { setRoleSelection('business'); onNav('register'); }} 
            className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            Post a shift as a business <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => { setRoleSelection('worker'); onNav('register'); }} 
            className="btn-secondary text-base px-8 py-3.5 w-full sm:w-auto"
          >
            Find shifts as a worker
          </button>
        </div>
        
        <p className="mt-4 text-xs font-medium text-[var(--text-secondary)]">
          No subscription required to post your first shift. 100% free for workers.
        </p>
      </section>

      {/* ── 2. PRODUCT DEMO WALKTHROUGH (0 FAKE STATS) ── */}
      <section className="max-w-[950px] mx-auto px-6 mb-24">
        <div className="glow-card p-6 sm:p-10 border border-[var(--border)] relative overflow-hidden bg-[var(--surface)]">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-6 border-b border-[var(--border)]">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-secondary)] block mb-1">
                Real-Time Dispatch Engine
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">How ShiftRush handles a call-out</h2>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-[var(--surface-sec)] text-[var(--text-secondary)] border border-[var(--border)] font-semibold w-max">
              Interactive Product Demo
            </span>
          </div>

          {/* Business Scenario Story */}
          <div className="bg-[var(--surface-sec)] p-6 rounded-2xl border border-[var(--border)] mb-6 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed space-y-3">
            <p>
              Imagine you own a small coffee shop. At 7:00 AM your barista texts you — <span className="text-[var(--text-primary)] font-semibold">sick, can't come in</span>. Your shift starts in 2 hours.
            </p>
            <p>
              You panic, text everyone you know, post in a WhatsApp group, maybe call an agency that takes 3 days to respond. 
            </p>
            <p className="text-[var(--text-primary)] font-semibold pt-1">
              ShiftRush fixes that in minutes. You open ShiftRush and post your shift request:
            </p>
          </div>

          {/* Live Simulator Interface */}
          <div className="p-6 rounded-2xl bg-[var(--surface-sec)]/50 border border-[var(--border)] text-center">
            
            {demoState === 'idle' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-left font-mono text-xs text-[var(--text-primary)] max-w-lg mx-auto shadow-sm">
                  <div className="flex justify-between text-[var(--text-secondary)] mb-2 font-sans text-[11px] font-bold">
                    <span>CREATE SHIFT POST</span>
                    <span className="text-[var(--accent-primary)]">URGENT</span>
                  </div>
                  <p><strong className="text-[var(--text-primary)] font-sans">Role:</strong> Barista</p>
                  <p><strong className="text-[var(--text-primary)] font-sans">Time:</strong> 9:00 AM – 2:00 PM</p>
                  <p><strong className="text-[var(--text-primary)] font-sans">Rate:</strong> $22.00 / hr</p>
                </div>
                
                <button 
                  onClick={triggerDemo}
                  className="btn-primary px-6 py-3 text-sm font-semibold flex items-center justify-center gap-2 mx-auto"
                >
                  <Zap className="w-4 h-4 fill-white" /> Dispatch Shift Notice
                </button>
              </div>
            )}

            {demoState === 'matching' && (
              <div className="py-8 flex flex-col items-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)]/20 animate-ping flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-[var(--accent-primary)]" />
                </div>
                <h3 className="font-bold text-[var(--text-primary)] text-base">Notifying Available Nearby Baristas...</h3>
                <p className="text-xs text-[var(--text-secondary)]">First qualified worker to tap Accept locks the shift.</p>
              </div>
            )}

            {demoState === 'claimed' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-4 space-y-3">
                <div className="w-12 h-12 bg-[var(--success)]/20 text-[var(--success)] rounded-full flex items-center justify-center mx-auto border border-[var(--success)]/30">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[var(--text-primary)]">Shift Accepted & Confirmed</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Verified worker accepted the 9:00 AM shift. Crisis over.</p>
                </div>
                <button onClick={() => setDemoState('idle')} className="text-xs text-[var(--accent-primary)] font-semibold hover:underline mt-2">
                  Try Again
                </button>
              </motion.div>
            )}

          </div>

        </div>
      </section>

      {/* ── 3. THE PROBLEM ── */}
      <section className="max-w-[800px] mx-auto px-6 mb-24 text-center">
        <div className="premium-card p-8 sm:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-6">The scramble ends here.</h2>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed mb-6">
            Last-minute staff cancellations are one of the most common operational problems small businesses face. When a shift goes unfilled, you either operate short-staffed or scramble through group chats and phone calls with no guarantee of a result.
          </p>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed mb-6">
            Existing platforms — job boards, staffing agencies, and generic gig apps — are built for long-term hiring or unskilled tasks. None are designed specifically for skilled, same-day hourly shifts.
          </p>
          <p className="text-base text-[var(--text-primary)] font-semibold">
            There was no dedicated tool for this exact problem. So we built ShiftRush.
          </p>
        </div>
      </section>

      {/* ── 4. HOW IT WORKS ── */}
      <section className="max-w-[1100px] mx-auto px-6 py-16 border-t border-[var(--border)]">
        <div className="text-center mb-16">
          <span className="section-subtitle">Workflow</span>
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">Simple for businesses. Fast for workers.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Business Side */}
          <div className="premium-card p-8">
            <div className="w-10 h-10 rounded-xl bg-[var(--surface-sec)] text-[var(--accent-primary)] flex items-center justify-center font-bold text-lg mb-6 border border-[var(--border)]">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">For Businesses</h3>
            <ul className="space-y-4 text-sm text-[var(--text-secondary)]">
              <li className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] mt-2 shrink-0" />
                <span><strong className="text-[var(--text-primary)]">Post a shift in under 60 seconds:</strong> Set the role, required skills, exact time, and pay rate.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] mt-2 shrink-0" />
                <span><strong className="text-[var(--text-primary)]">Instant notification:</strong> Nearby workers holding the required skill receive an immediate notification.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] mt-2 shrink-0" />
                <span><strong className="text-[var(--text-primary)]">First to accept wins:</strong> You get instant confirmation as soon as a worker claims the shift.</span>
              </li>
            </ul>
          </div>

          {/* Worker Side */}
          <div className="premium-card p-8">
            <div className="w-10 h-10 rounded-xl bg-[var(--surface-sec)] text-[var(--accent-secondary)] flex items-center justify-center font-bold text-lg mb-6 border border-[var(--border)]">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">For Workers</h3>
            <ul className="space-y-4 text-sm text-[var(--text-secondary)]">
              <li className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-secondary)] mt-2 shrink-0" />
                <span><strong className="text-[var(--text-primary)]">Set your skills & preferences:</strong> Tell us your verifiable skills and minimum pay targets.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-secondary)] mt-2 shrink-0" />
                <span><strong className="text-[var(--text-primary)]">Get matched to local shifts:</strong> Receive alerts when relevant open shifts appear near you.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-secondary)] mt-2 shrink-0" />
                <span><strong className="text-[var(--text-primary)]">Tap Accept & get paid:</strong> Claim the shift, complete the work, and get paid directly.</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* ── 5. WHAT SHIFTRUSH IS AND IS NOT (HONESTY) ── */}
      <section className="max-w-[950px] mx-auto px-6 py-16">
        <div className="premium-card p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 text-center">What ShiftRush is (and what it isn't)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-[var(--surface-sec)] border border-[var(--border)]">
              <h3 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-[var(--success)]" /> ShiftRush IS
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                A fast, reliable way to fill skilled, same-day hourly shifts locally when an employee calls out sick or an unexpected surge occurs.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-[var(--surface-sec)] border border-[var(--border)]">
              <h3 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-2 mb-2">
                <span className="w-4 h-4 rounded-full bg-[var(--error)]/20 text-[var(--error)] flex items-center justify-center font-bold text-[10px]">✕</span> 
                ShiftRush IS NOT
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                A replacement for core full-time staff, a long-term job board, or a traditional staffing agency that charges massive markup fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. FOOTER CTA ── */}
      <section className="py-20 bg-[var(--surface)] border-t border-[var(--border)] text-center">
        <div className="max-w-[700px] mx-auto px-6">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">Ready to cover your next shift?</h2>
          <p className="text-base text-[var(--text-secondary)] mb-8">
            Don't let a last-minute cancellation derail your operations. Post your first shift today.
          </p>
          <button 
            onClick={() => { setRoleSelection('business'); onNav('register'); }} 
            className="btn-primary text-base px-8 py-3.5 shadow-md"
          >
            Post your first shift
          </button>
        </div>
      </section>

    </main>
  );
}


