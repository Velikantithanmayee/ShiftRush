import React, { useState } from 'react';
import { CreditCard, DollarSign, Download, AlertTriangle } from 'lucide-react';
import { Shift } from '../../types';

interface BusinessEarningsProps {
  shifts: Shift[];
}

export function BusinessEarnings({ shifts }: BusinessEarningsProps) {
  const [stripeConnected, setStripeConnected] = useState(false);
  
  const completedShifts = shifts.filter(s => s.status === 'completed');
  const totalSpend = completedShifts.reduce((sum, s) => sum + s.payRate * 4, 0); // approx 4h shift
  const totalFees = totalSpend * 0.1;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto pb-32">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Billing & Payments</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Manage payment methods, invoices, and worker payouts.</p>
        </div>
        {!stripeConnected ? (
          <button onClick={() => setStripeConnected(true)} className="bg-[#635BFF] text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(99,91,255,0.3)]">
            <CreditCard className="w-5 h-5" /> Connect Stripe
          </button>
        ) : (
          <button onClick={() => setStripeConnected(false)} className="bg-[var(--surface-sec)] text-[var(--text-primary)] border border-[var(--border)] px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[var(--border)] transition-colors text-sm">
            Manage Billing Settings
          </button>
        )}
      </div>

      {!stripeConnected && (
        <div className="mb-8 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--text-primary)] text-lg">Payment Method Required</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1 mb-3 max-w-xl">You must connect a payment method before worker payouts can be processed. We use Stripe to securely process worker payouts and platform fees.</p>
            <button onClick={() => setStripeConnected(true)} className="text-sm font-bold text-[#635BFF] hover:underline">Connect Stripe Now &rarr;</button>
          </div>
        </div>
      )}

      {/* Spend Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="premium-card p-6">
          <div className="w-10 h-10 rounded-full bg-[var(--surface-sec)] text-[var(--text-primary)] flex items-center justify-center mb-4 border border-[var(--border)]">
            <DollarSign className="w-5 h-5" />
          </div>
          <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Total Spend (This Week)</p>
          <div className="flex items-end gap-3 mt-1">
            <p className="text-4xl font-bold text-[var(--text-primary)]">${totalSpend.toFixed(2)}</p>
          </div>
        </div>
        <div className="premium-card p-6">
          <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Total Spend (This Month)</p>
          <div className="flex items-end gap-3 mt-1 mb-4">
            <p className="text-3xl font-bold text-[var(--text-primary)]">${totalSpend.toFixed(2)}</p>
          </div>
          <p className="text-[10px] text-[var(--text-secondary)]">Calculated from completed shifts</p>
        </div>
        <div className="premium-card p-6 flex flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider mb-2">Platform Fees (YTD)</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">${totalFees.toFixed(2)}</p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Flat fee on completed payouts</p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[var(--text-primary)] text-lg">Recent Payout Transactions</h2>
        </div>
        
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="p-8 text-center">
            <CreditCard className="w-10 h-10 text-[var(--text-secondary)] mx-auto mb-3 opacity-40" />
            <h4 className="font-bold text-[var(--text-primary)] text-base mb-1">No transaction receipts yet</h4>
            <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto">
              Completed shifts and payout receipts will automatically record here.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
