import React, { useEffect, useState } from 'react';
import { DollarSign, Download, CreditCard, ChevronRight, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import { PaymentTransaction } from '../../types';

interface WorkerEarningsProps {
  paymentsList: PaymentTransaction[];
}

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = value / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return <>{displayValue.toFixed(2)}</>;
}

export function WorkerEarnings({ paymentsList }: WorkerEarningsProps) {
  const totalEarnings = paymentsList.reduce((acc, p) => acc + (p.status === 'succeeded' ? p.amount : 0), 0);
  const pendingEarnings = paymentsList.reduce((acc, p) => acc + (p.status === 'pending' ? p.amount : 0), 0);

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      
      {/* Header */}
      <div className="bg-[var(--surface)]/90 backdrop-blur-lg border-b border-[var(--border)] pt-4 px-4 pb-4 sticky top-0 z-30">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Earnings</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 flex flex-col gap-6">
        
        {/* Stripe Connect Banner (Mock) */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight mb-1">Connect Payout Account</h3>
              <p className="text-sm text-indigo-100 mb-4 leading-relaxed max-w-[250px]">Link your bank via Stripe Connect to receive instant payouts after your shifts.</p>
              <button className="bg-white text-indigo-600 font-bold px-4 py-2 rounded-lg text-sm shadow-md hover:bg-indigo-50 transition-colors">
                Setup Instant Payouts
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="premium-card p-5"
          >
            <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-wider font-semibold">Available</span>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">
              $<AnimatedNumber value={totalEarnings} />
            </p>
            <button className="mt-3 text-xs font-bold text-[var(--accent-primary)] flex items-center gap-1">
              Cash Out Now <ChevronRight className="w-3 h-3" />
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="premium-card p-5"
          >
            <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-wider font-semibold">Pending</span>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">
              $<AnimatedNumber value={pendingEarnings} />
            </p>
            <p className="mt-3 text-xs text-[var(--text-secondary)]">Clearing in 24h</p>
          </motion.div>
        </div>

        {/* Transaction History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Recent Activity</h3>
            <button className="text-xs text-[var(--text-secondary)] flex items-center gap-1 hover:text-[var(--text-primary)]">
              <Download className="w-3.5 h-3.5" /> Statement
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {paymentsList.map(payment => (
              <div key={payment.id} className="premium-card p-4 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    payment.status === 'succeeded' ? 'bg-[var(--success)]/10 text-[var(--success)]' : 
                    payment.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-[var(--error)]/10 text-[var(--error)]'
                  }`}>
                    {payment.status === 'succeeded' && <DollarSign className="w-5 h-5" />}
                    {payment.status === 'pending' && <Clock className="w-5 h-5" />}
                    {payment.status === 'failed' && <AlertCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-[var(--text-primary)] text-sm">{payment.role}</p>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{new Date(payment.createdAt).toLocaleDateString()} • {payment.status}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${payment.status === 'succeeded' ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                    +${payment.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
            {paymentsList.length === 0 && (
              <div className="p-8 text-center bg-[var(--surface-sec)] rounded-2xl border border-[var(--border)]">
                <p className="text-[var(--text-primary)] font-medium text-sm">No recent transactions.</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Complete your first shift to see earnings here.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
