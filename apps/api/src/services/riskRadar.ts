import { prisma } from '../utils/db.js';

export interface RiskRadarReport {
  shiftId: string;
  workerId: string;
  riskScore: number; // 0 to 100
  riskCategory: 'Low' | 'Medium' | 'High';
  triggerBackupAlert: boolean;
}

/**
 * Computes a probabilistic No-Show Risk Score utilizing a logistic regression heuristic.
 * z = beta_0 + beta_1 * noShowRate + beta_2 * timeToStartHours + beta_3 * distanceKm
 * probability = 1 / (1 + e^-z)
 */
export async function calculateNoShowRisk(shiftId: string, workerId: string): Promise<RiskRadarReport> {
  try {
    const worker = await prisma.worker.findUnique({
      where: { id: workerId },
      include: { shifts: true }
    });

    const shift = await prisma.shift.findUnique({
      where: { id: shiftId }
    });

    if (!worker || !shift) {
      return { shiftId, workerId, riskScore: 10.0, riskCategory: 'Low', triggerBackupAlert: false };
    }

    // 1. Worker Historical No-Show Rate
    const pastShifts = worker.shifts.filter((s) => s.status === 'completed' || s.status === 'cancelled');
    const totalPastCount = pastShifts.length;
    const cancelledCount = pastShifts.filter((s) => s.status === 'cancelled').length;
    const noShowRate = totalPastCount > 0 ? cancelledCount / totalPastCount : 0.0;

    // 2. Time between Claimed and Shift Start (in hours)
    const hoursToStart = Math.max(
      0.1,
      (new Date(shift.startTime).getTime() - Date.now()) / 3600000
    );

    // 3. Proximity Zone (Fuzzed proxy distance, e.g. 5km average baseline)
    const distanceKm = 4.5;

    // Logistic regression coefficient matching
    // beta_0 = -1.8 (baseline offset)
    // beta_1 = 6.0 (heavy penalty for high no-shows)
    // beta_2 = -0.04 (longer time window reduces immediate no-show risk)
    // beta_3 = 0.08 (longer commute distance increases risk slightly)
    const z = -1.8 + 6.0 * noShowRate - 0.04 * hoursToStart + 0.08 * distanceKm;
    const probability = 1 / (1 + Math.exp(-z));
    
    const riskScore = parseFloat((probability * 100).toFixed(1));

    let riskCategory: 'Low' | 'Medium' | 'High' = 'Low';
    if (riskScore >= 65.0) {
      riskCategory = 'High';
    } else if (riskScore >= 30.0) {
      riskCategory = 'Medium';
    }

    // Proactively suggest backup queueing if category is High
    const triggerBackupAlert = riskCategory === 'High';

    // Store log in NoShowFlag audit table
    await prisma.noShowFlag.create({
      data: {
        shiftId,
        workerId,
        riskScore
      }
    });

    console.log(`[RiskRadar] Computed shift ${shiftId} claim risk for worker ${workerId}: ${riskScore}% (${riskCategory})`);

    return {
      shiftId,
      workerId,
      riskScore,
      riskCategory,
      triggerBackupAlert
    };
  } catch (error) {
    console.error('[RiskRadar] Calculation error:', error);
    return { shiftId, workerId, riskScore: 20.0, riskCategory: 'Low', triggerBackupAlert: false };
  }
}
