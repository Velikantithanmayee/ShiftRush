import { prisma } from '../utils/db.js';

export async function recalculateWorkerReliability(workerId: string) {
  try {
    const worker = await prisma.worker.findUnique({
      where: { id: workerId }
    });

    if (!worker) return;

    // Fetch worker shifts directly
    const shiftsClaimed = await prisma.shift.findMany({
      where: { claimedByWorkerId: workerId }
    });
    const totalClaimedCount = shiftsClaimed.length;

    if (totalClaimedCount === 0) {
      // New account base score
      await updateWorkerScore(workerId, 100.0, 0, 'Initial platform rating');
      return;
    }

    const completedShifts = shiftsClaimed.filter((s) => s.status === 'completed');
    const cancelledShifts = shiftsClaimed.filter((s) => s.status === 'cancelled');

    // 1. Completion Rate (Weight: 50% -> 50 points max)
    const completionRate = completedShifts.length / totalClaimedCount;
    const completionScore = completionRate * 50;

    // 2. Cancellation Penalty (Penalty: -15 points per cancellation, max penalty 40 points)
    const cancellationPenalty = Math.min(cancelledShifts.length * 15, 40);

    // 3. Ratings (Weight: 30% -> 30 points max)
    const ratings = await prisma.rating.findMany({
      where: { ratedUserId: workerId }
    });

    let ratingScore = 30; // Default max if no ratings
    if (ratings.length > 0) {
      const avgRating = ratings.reduce((acc: number, r: any) => acc + r.score, 0) / ratings.length;
      ratingScore = (avgRating / 5) * 30;
    }

    // 4. Volume / Consistency Bonus (Up to +20 points for consistent shift volume)
    const volumeBonus = Math.min(completedShifts.length * 2, 20);

    // Final Score Calculation (capped between 0 and 100)
    let newScore = completionScore - cancellationPenalty + ratingScore + volumeBonus;
    newScore = Math.max(0, Math.min(100, newScore));
    newScore = parseFloat(newScore.toFixed(1));

    const scoreDiff = newScore - worker.reliabilityScore;
    if (Math.abs(scoreDiff) >= 0.1) {
      let reason = `Recalculation: completed ${completedShifts.length}/${totalClaimedCount} shifts.`;
      if (cancelledShifts.length > 0) {
        reason += ` Cancellations: ${cancelledShifts.length} (-${cancellationPenalty}pts).`;
      }
      if (volumeBonus > 0) {
        reason += ` Consistency bonus: +${volumeBonus}pts.`;
      }

      await updateWorkerScore(workerId, newScore, scoreDiff, reason);
    }
  } catch (err) {
    console.error(`Failed to recalculate reliability score for worker ${workerId}:`, err);
  }
}

async function updateWorkerScore(workerId: string, score: number, change: number, reason: string) {
  await prisma.$transaction([
    prisma.worker.update({
      where: { id: workerId },
      data: { reliabilityScore: score }
    }),
    prisma.reliabilityScoreLog.create({
      data: {
        workerId,
        score,
        change,
        reason
      }
    })
  ]);
  console.log(`[ReliabilityService] Worker ${workerId} score updated to ${score}. Reason: ${reason}`);
}
