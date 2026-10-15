import { Response } from 'express';
import { prisma } from '../utils/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getReliabilityBreakdown(req: AuthenticatedRequest, res: Response) {
  const workerId = req.user?.id;
  if (!workerId || req.user?.role !== 'worker') {
    return res.status(403).json({ error: 'Access forbidden: worker account required' });
  }

  try {
    const worker = await prisma.worker.findUnique({
      where: { id: workerId },
      include: {
        shifts: true,
        scoreLogs: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    const shiftsClaimed = worker.shifts.filter(
      (s) => s.status === 'completed' || s.status === 'cancelled' || s.status === 'claimed'
    );
    const totalClaimedCount = shiftsClaimed.length;
    const completedShifts = shiftsClaimed.filter((s) => s.status === 'completed');
    const cancelledShifts = shiftsClaimed.filter((s) => s.status === 'cancelled');

    const completionRate = totalClaimedCount > 0 ? (completedShifts.length / totalClaimedCount) * 100 : 100;

    return res.json({
      reliabilityScore: worker.reliabilityScore,
      breakdown: {
        completionRate: parseFloat(completionRate.toFixed(1)),
        totalClaimed: totalClaimedCount,
        completed: completedShifts.length,
        cancelled: cancelledShifts.length,
        summary: `Completion rate: ${completionRate.toFixed(0)}% (${completionRate >= 90 ? '+' : '-'}), ${
          cancelledShifts.length
        } cancellation(s) logged.`
      },
      history: worker.scoreLogs
    });
  } catch (error) {
    console.error('Failed to load reliability breakdown:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getWorkerPayments(req: AuthenticatedRequest, res: Response) {
  const workerId = req.user?.id;
  if (!workerId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { getUserPaymentsHistory } = await import('../services/paymentsService.js');
    const payments = await getUserPaymentsHistory(workerId, 'worker');
    return res.json(payments);
  } catch (error) {
    console.error('Failed loading worker payments:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getWorkerEarnings(req: AuthenticatedRequest, res: Response) {
  const workerId = req.user?.id;
  if (!workerId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const payments = await prisma.payment.findMany({
      where: {
        shift: {
          claimedByWorkerId: workerId
        }
      },
      include: {
        shift: true
      }
    });

    const totalEarnings = payments.reduce((sum, p) => sum + (p.amount - p.platformFee), 0);
    const completedCount = payments.filter(p => p.status === 'succeeded').length;

    return res.json({
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      completedShifts: completedCount,
      history: payments.map(p => ({
        id: p.id,
        role: p.shift.role,
        amount: parseFloat((p.amount - p.platformFee).toFixed(2)),
        platformFee: parseFloat(p.platformFee.toFixed(2)),
        status: p.status,
        date: p.createdAt
      }))
    });
  } catch (error) {
    console.error('Failed loading worker earnings:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateWorkerAvailability(req: AuthenticatedRequest, res: Response) {
  const workerId = req.user?.id;
  const { availabilitySlots } = req.body; // Expect JSON array string or raw array

  if (!workerId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const slotsString = typeof availabilitySlots === 'string' ? availabilitySlots : JSON.stringify(availabilitySlots || []);
    
    await prisma.worker.update({
      where: { id: workerId },
      data: { availabilitySlots: slotsString }
    });

    return res.json({ success: true, message: 'Availability slots updated successfully' });
  } catch (error) {
    console.error('Failed updating worker availability:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
