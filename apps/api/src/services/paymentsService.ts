import { prisma } from '../utils/db.js';

export interface PaymentTransaction {
  id: string;
  shiftId: string;
  role: string;
  amount: number;
  platformFee: number;
  status: 'pending' | 'succeeded' | 'failed';
  stripePaymentId: string;
  createdAt: Date;
}

/**
 * Simulates Stripe Connect Payment Intent Creation (Authorization Hold on Claim)
 */
export async function createClaimPaymentHold(shiftId: string, amount: number): Promise<string> {
  const stripePaymentId = `pi_${Math.random().toString(36).substring(2, 15)}`;
  
  // Register holding log in Payments database table
  await prisma.payment.create({
    data: {
      shiftId,
      amount,
      platformFee: parseFloat((amount * 0.12).toFixed(2)), // 12% Platform Fee
      status: 'pending',
      stripePaymentId
    }
  });

  console.log(`[StripeService] Created Payment Authorization Hold of $${amount} (Hold ID: ${stripePaymentId})`);
  return stripePaymentId;
}

/**
 * Capture Payment on Shift Completion
 */
export async function capturePaymentOnCompletion(shiftId: string): Promise<boolean> {
  try {
    const payment = await prisma.payment.findFirst({
      where: { shiftId, status: 'pending' }
    });

    if (!payment) {
      console.warn(`[StripeService] No pending payment found for shift ${shiftId}`);
      return false;
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'succeeded' }
    });

    console.log(`[StripeService] Successfully captured Stripe Payment ${payment.stripePaymentId} of $${payment.amount}`);
    return true;
  } catch (err) {
    console.error('[StripeService] Capture payment failed:', err);
    return false;
  }
}

/**
 * Refund/Void Payment on Shift Cancellation
 */
export async function voidPaymentOnCancellation(shiftId: string): Promise<boolean> {
  try {
    const payment = await prisma.payment.findFirst({
      where: { shiftId, status: 'pending' }
    });

    if (!payment) return false;

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'failed' }
    });

    console.log(`[StripeService] Voided pending hold ${payment.stripePaymentId} for cancelled shift ${shiftId}`);
    return true;
  } catch (err) {
    console.error('[StripeService] Void payment failed:', err);
    return false;
  }
}

/**
 * Fetch Payment Logs History for user dashboards
 */
export async function getUserPaymentsHistory(userId: string, role: 'worker' | 'business'): Promise<PaymentTransaction[]> {
  try {
    let queryOptions = {};

    if (role === 'business') {
      queryOptions = {
        where: {
          shift: { businessId: userId }
        },
        include: { shift: true }
      };
    } else {
      queryOptions = {
        where: {
          shift: { claimedByWorkerId: userId }
        },
        include: { shift: true }
      };
    }

    const records = await prisma.payment.findMany(queryOptions);

    return records.map((r: any) => ({
      id: r.id,
      shiftId: r.shiftId,
      role: r.shift.role,
      amount: r.amount,
      platformFee: r.platformFee,
      status: r.status.toLowerCase() as any,
      stripePaymentId: r.stripePaymentId || 'mock_id',
      createdAt: r.createdAt
    }));
  } catch (error) {
    console.error('[StripeService] Failed loading payments history:', error);
    return [];
  }
}
