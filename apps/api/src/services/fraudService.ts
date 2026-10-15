import { prisma } from '../utils/db.js';

/**
 * Scans worker activities to detect anomalous patterns and automatically log fraud alerts.
 */
export async function auditWorkerActivity(workerId: string): Promise<boolean> {
  try {
    const logs = await prisma.shiftClaimLog.findMany({
      where: { workerId },
      orderBy: { attemptedAt: 'desc' },
      take: 10
    });

    // 1. Detect rapid cancellations (more than 2 cancellations in last 48 hours)
    const cancelledCount = logs.filter(l => l.result === 'cancelled' || l.result === 'lost_race').length; // Check cancellation patterns
    
    // Check actual cancelled shifts in shift relation
    const cancelledShifts = await prisma.shift.count({
      where: {
        claimedByWorkerId: workerId,
        status: 'cancelled',
        claimedAt: {
          gte: new Date(Date.now() - 48 * 60 * 60 * 1000) // 48 hours
        }
      }
    });

    if (cancelledShifts >= 3) {
      await prisma.fraudFlag.create({
        data: {
          targetId: workerId,
          targetType: 'worker',
          reason: `High cancellation frequency: worker cancelled ${cancelledShifts} shifts in the last 48 hours. Potential platform manipulation.`,
          severity: 'high'
        }
      });
      return true;
    }

    // 2. Mock location spoofing detection
    // In a production app we'd compare IP geocodes against mobile coordinate telemetry.
    return false;
  } catch (err) {
    console.error('[FraudService] Failed auditing worker activity:', err);
    return false;
  }
}
