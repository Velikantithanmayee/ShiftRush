import React, { useState } from 'react';
import { Plus, MapPin, Tag, Calendar as CalIcon, Clock, DollarSign, AlertTriangle, Shield, Check, Users, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function BusinessPostShift() {
  const [step, setStep] = useState<'form' | 'review' | 'processing' | 'success'>('form');
  
  const [role, setRole] = useState('Barista');
  const [payRate, setPayRate] = useState(22);
  const [urgency, setUrgency] = useState<'normal'|'urgent'|'critical'>('normal');
  const [workers, setWorkers] = useState(1);
  const [reliability, setReliability] = useState(90);

  const estimatedCost = payRate * 5 * workers; // assuming 5 hours for mock

  const handlePost = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
    }, 2000);
  };

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto pb-32">
      
      {step === 'form' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Post a Shift</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Fill gaps in under 60 seconds.</p>
          </div>

          <div className="premium-card p-5 space-y-5">
            {/* Location & Role */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Location
              </label>
              <select className="input-premium w-full bg-[var(--surface-sec)]">
                <option>Downtown Cafe (123 Main St)</option>
                <option>Uptown Roastery (456 Oak Ave)</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] flex items-center gap-2">
                <Tag className="w-3 h-3" /> Role & Skills
              </label>
              <input type="text" value={role} onChange={e=>setRole(e.target.value)} className="input-premium w-full" placeholder="e.g. Barista" />
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="badge bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">Espresso Machine</span>
                <span className="badge">Latte Art</span>
                <span className="badge">Cash Handling</span>
                <button className="badge border-dashed border-[var(--border)] hover:border-[var(--accent-primary)] text-[var(--text-secondary)]"><Plus className="w-3 h-3 inline mr-1" /> Add Skill</button>
              </div>
            </div>

            {/* Date & Time */}
            <div className="space-y-3 pt-2 border-t border-[var(--border)]">
              <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] flex items-center gap-2">
                <CalIcon className="w-3 h-3" /> Date & Time
              </label>
              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-lg border-2 border-[var(--accent-primary)] bg-[var(--accent-primary)]/5 font-bold text-[var(--text-primary)] text-sm">Today</button>
                <button className="flex-1 py-2 rounded-lg border border-[var(--border)] font-medium text-[var(--text-secondary)] text-sm">Tomorrow</button>
                <button className="flex-1 py-2 rounded-lg border border-[var(--border)] font-medium text-[var(--text-secondary)] text-sm">Pick Date</button>
              </div>
              <div className="flex gap-4 pt-2">
                <div className="flex-1 relative">
                  <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input type="time" defaultValue="09:00" className="input-premium pl-9 w-full" />
                </div>
                <div className="flex-1 relative">
                  <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input type="time" defaultValue="14:00" className="input-premium pl-9 w-full" />
                </div>
              </div>
            </div>

            {/* Pay & Workers */}
            <div className="space-y-3 pt-2 border-t border-[var(--border)]">
              <div className="flex gap-4">
                <div className="flex-1 space-y-3">
                  <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] flex items-center gap-2">
                    <DollarSign className="w-3 h-3" /> Hourly Pay
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] font-bold">$</span>
                    <input type="number" value={payRate} onChange={e=>setPayRate(Number(e.target.value))} className="input-premium pl-7 w-full font-bold text-lg" />
                  </div>
                  <p className="text-[10px] text-[var(--success)] font-semibold">Market avg: $21/hr</p>
                </div>
                <div className="flex-1 space-y-3">
                  <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] flex items-center gap-2">
                    <Users className="w-3 h-3" /> Workers Needed
                  </label>
                  <div className="flex items-center h-[46px] border border-[var(--border)] rounded-xl bg-[var(--surface-sec)] overflow-hidden">
                    <button onClick={() => setWorkers(w => Math.max(1, w-1))} className="px-4 font-bold text-[var(--text-secondary)] hover:bg-[var(--border)] transition-colors h-full">-</button>
                    <div className="flex-1 text-center font-bold text-[var(--text-primary)]">{workers}</div>
                    <button onClick={() => setWorkers(w => w+1)} className="px-4 font-bold text-[var(--text-secondary)] hover:bg-[var(--border)] transition-colors h-full">+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Urgency */}
            <div className="space-y-3 pt-2 border-t border-[var(--border)]">
              <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] flex items-center gap-2">
                <AlertTriangle className="w-3 h-3" /> Dispatch Urgency
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div onClick={() => setUrgency('normal')} className={`cursor-pointer rounded-xl p-3 border-2 transition-all text-center ${urgency === 'normal' ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5' : 'border-[var(--border)] opacity-60'}`}>
                  <p className="font-bold text-[var(--text-primary)] text-sm mb-1">Normal</p>
                  <p className="text-[10px] text-[var(--text-secondary)] leading-tight">Standard push alert to local matches.</p>
                </div>
                <div onClick={() => setUrgency('urgent')} className={`cursor-pointer rounded-xl p-3 border-2 transition-all text-center ${urgency === 'urgent' ? 'border-yellow-500 bg-yellow-500/5' : 'border-[var(--border)] opacity-60'}`}>
                  <p className="font-bold text-yellow-600 dark:text-yellow-500 text-sm mb-1">Urgent</p>
                  <p className="text-[10px] text-[var(--text-secondary)] leading-tight">Bypasses mute, texts top 20% matches.</p>
                </div>
                <div onClick={() => setUrgency('critical')} className={`cursor-pointer rounded-xl p-3 border-2 transition-all text-center ${urgency === 'critical' ? 'border-[var(--error)] bg-[var(--error)]/5' : 'border-[var(--border)] opacity-60'}`}>
                  <p className="font-bold text-[var(--error)] text-sm mb-1">Critical</p>
                  <p className="text-[10px] text-[var(--text-secondary)] leading-tight">Calls network out to 25 miles.</p>
                </div>
              </div>
            </div>

            {/* Reliability Filter */}
            <div className="space-y-3 pt-2 border-t border-[var(--border)]">
              <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] flex items-center justify-between">
                <span className="flex items-center gap-2"><Shield className="w-3 h-3" /> Min. Reliability Score</span>
                <span className="text-[var(--accent-primary)] text-sm">{reliability}+</span>
              </label>
              <input type="range" min="50" max="100" value={reliability} onChange={e=>setReliability(Number(e.target.value))} className="w-full accent-[var(--accent-primary)]" />
              <p className="text-[10px] text-[var(--text-secondary)]">Only workers with a score above {reliability} will see this shift.</p>
            </div>

            {/* Notes */}
            <div className="space-y-3 pt-2 border-t border-[var(--border)]">
              <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] flex items-center gap-2">
                <FileText className="w-3 h-3" /> Instructions
              </label>
              <textarea placeholder="e.g. Enter through the back door, ask for Tom." className="input-premium w-full text-sm" rows={2}></textarea>
            </div>

          </div>
        </motion.div>
      )}

      {/* Review State */}
      {step === 'review' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Review & Dispatch</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Please confirm shift details before broadcasting.</p>
          </div>

          <div className="premium-card p-6 border-2 border-[var(--accent-primary)]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">{workers > 1 ? `${workers}x ` : ''}{role}</h2>
                <p className="text-sm text-[var(--text-secondary)]">Downtown Cafe</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-2xl text-[var(--success)]">${payRate}</p>
                <p className="text-[10px] text-[var(--text-secondary)] uppercase">per hour</p>
              </div>
            </div>

            <div className="bg-[var(--surface-sec)] rounded-xl p-4 mb-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Date</span>
                <span className="font-bold text-[var(--text-primary)]">Today, Oct 24</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Time</span>
                <span className="font-bold text-[var(--text-primary)]">09:00 AM - 02:00 PM</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Urgency</span>
                <span className={`font-bold capitalize ${urgency === 'critical' ? 'text-[var(--error)]' : urgency === 'urgent' ? 'text-yellow-500' : 'text-[var(--accent-primary)]'}`}>{urgency} Dispatch</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Min Score</span>
                <span className="font-bold text-[var(--text-primary)] flex items-center gap-1"><Shield className="w-3 h-3 text-[var(--success)]" /> {reliability}+</span>
              </div>
            </div>

            <div className="border-t border-[var(--border)] pt-4 flex justify-between items-center">
              <div>
                <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Estimated Total</p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">Including platform fees</p>
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">${(estimatedCost * 1.1).toFixed(2)}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Processing State */}
      {step === 'processing' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 border-4 border-[var(--border)] rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[var(--accent-primary)] rounded-full border-t-transparent animate-spin"></div>
            <AlertTriangle className={`w-8 h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse ${urgency === 'critical' ? 'text-[var(--error)]' : 'text-[var(--accent-primary)]'}`} />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] text-center">Dispatching Shift...</h2>
          <p className="text-sm text-[var(--text-secondary)] text-center mt-2">Running matching algorithms and alerting nearby qualified workers.</p>
        </motion.div>
      )}

      {/* Success State */}
      {step === 'success' && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-24 h-24 bg-[var(--success)]/10 rounded-full flex items-center justify-center mb-6">
            <Check className="w-12 h-12 text-[var(--success)]" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Shift is Live!</h2>
          <p className="text-[var(--text-secondary)] mb-8 max-w-sm">We've notified 24 qualified workers within 5 miles. You'll be alerted the moment someone accepts.</p>
          
          <div className="flex flex-col w-full gap-3">
            <button onClick={() => setStep('form')} className="btn-primary py-3 font-bold">Post Another Shift</button>
            <button className="btn-secondary py-3 font-bold">View in Active Roster</button>
          </div>
        </motion.div>
      )}

      {/* Sticky Bottom Bar for Form/Review */}
      <AnimatePresence>
        {(step === 'form' || step === 'review') && (
          <motion.div 
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            className="fixed bottom-0 left-0 lg:left-72 right-0 bg-[var(--surface)] border-t border-[var(--border)] p-4 sm:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40"
          >
            <div className="max-w-2xl mx-auto flex gap-4">
              {step === 'review' && (
                <button onClick={() => setStep('form')} className="px-6 py-3 font-bold text-sm text-[var(--text-primary)] bg-[var(--surface-sec)] rounded-xl hover:bg-[var(--border)] transition-colors">
                  Back
                </button>
              )}
              <button 
                onClick={() => step === 'form' ? setStep('review') : handlePost()} 
                className="flex-1 py-3 font-bold text-sm text-white bg-[var(--accent-primary)] rounded-xl shadow-lg shadow-[var(--accent-primary)]/30 hover:opacity-90 transition-opacity"
              >
                {step === 'form' ? 'Review Details' : 'Broadcast Shift'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
