import { Worker } from '@prisma/client';

export interface RankedWorker {
  id: string;
  name: string;
  email: string;
  reliabilityScore: number;
  matchScore: number; // 0 to 100
  reasoning: string;
}

/**
 * Calculates a match score (0-100) using skill alignment vector similarity weighted by the reliability score.
 */
export function rankWorkerForShift(
  workerSkills: string[],
  requiredSkills: string[],
  reliabilityScore: number
): { matchScore: number; reasoning: string } {
  if (requiredSkills.length === 0) {
    return {
      matchScore: Math.round(reliabilityScore),
      reasoning: `Match based purely on reliability of ${reliabilityScore} as no specific skills are required.`
    };
  }

  // Count overlap
  const intersection = workerSkills.filter(s => requiredSkills.includes(s));
  const skillMatchRatio = intersection.length / requiredSkills.length; // 0.0 to 1.0

  // Standard calculation: 60% skills alignment + 40% reliability rating
  const score = (skillMatchRatio * 60) + ((reliabilityScore / 100) * 40);
  const matchScore = Math.max(0, Math.min(100, Math.round(score)));

  let reasoning = `Matched ${intersection.length}/${requiredSkills.length} required skills. `;
  if (reliabilityScore >= 95) {
    reasoning += 'Reliability is exemplary (Top Tier).';
  } else if (reliabilityScore >= 85) {
    reasoning += 'Reliability is consistent.';
  } else {
    reasoning += 'Reliability warning flag.';
  }

  return { matchScore, reasoning };
}

export function rankWorkersList(
  workers: any[],
  requiredSkills: string[]
): RankedWorker[] {
  return workers.map(w => {
    let workerSkills: string[] = [];
    try {
      workerSkills = typeof w.skills === 'string' ? JSON.parse(w.skills) : w.skills;
    } catch {
      workerSkills = [];
    }

    const { matchScore, reasoning } = rankWorkerForShift(workerSkills, requiredSkills, w.reliabilityScore);
    return {
      id: w.id,
      name: w.name,
      email: w.email,
      reliabilityScore: w.reliabilityScore,
      matchScore,
      reasoning
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}
