export interface PricingPrediction {
  payRate: number;
  historicalAverage: number;
  fillProbability: number; // 0 to 100
  estimatedFillTimeMinutes: number;
  scarcityFactor: number; // multiplier reflecting skill scarcity
}

export function predictFillStats(
  payRate: number,
  requiredSkills: string[],
  urgencyLevel: 'normal' | 'high' | 'critical'
): PricingPrediction {
  // Determine historical baseline based on skills complexity
  let historicalAverage = 20.0;
  if (requiredSkills.includes('forklift')) {
    historicalAverage = 26.0;
  } else if (requiredSkills.includes('barista') || requiredSkills.includes('warehouse')) {
    historicalAverage = 22.5;
  }

  // Scarcity factor based on skill requirements
  let scarcityFactor = 1.0;
  if (requiredSkills.includes('forklift')) {
    scarcityFactor = 0.75; // Harder to fill
  } else if (requiredSkills.includes('barista') && requiredSkills.includes('food_handler')) {
    scarcityFactor = 0.85; // Medium scarcity
  }

  // Calculate pay premium
  const payRatio = payRate / historicalAverage;

  // Base fill probability using pay premium (logistic-like heuristic)
  let fillProbability = 50.0;
  if (payRatio < 0.8) {
    fillProbability = 15.0 + (payRatio - 0.5) * 50; // Very low
  } else if (payRatio < 1.2) {
    fillProbability = 50.0 + (payRatio - 1.0) * 150; // Linear scale around the baseline
  } else {
    fillProbability = 80.0 + (payRatio - 1.2) * 50; // High premium
  }

  // Adjust for skill scarcity
  fillProbability *= scarcityFactor;

  // Adjust for Urgency (emergency shifts have a higher grab rate IF the premium is good, else lower)
  if (urgencyLevel === 'critical') {
    if (payRatio >= 1.15) {
      fillProbability += 10.0; // Urgent high-pay gets claimed immediately
    } else {
      fillProbability -= 15.0; // Urgent low-pay is rejected by workers
    }
  } else if (urgencyLevel === 'high') {
    if (payRatio >= 1.05) {
      fillProbability += 5.0;
    } else {
      fillProbability -= 5.0;
    }
  }

  // Bound probability between 5% and 99%
  fillProbability = Math.max(5, Math.min(99, fillProbability));
  fillProbability = Math.round(fillProbability);

  // Compute estimated fill time (in minutes) based on probability
  // Higher probability -> faster claim
  let estimatedFillTimeMinutes = 120;
  if (fillProbability >= 90) {
    estimatedFillTimeMinutes = Math.round(3 + (99 - fillProbability) * 0.5); // 3-8 minutes
  } else if (fillProbability >= 70) {
    estimatedFillTimeMinutes = Math.round(10 + (90 - fillProbability) * 1.5); // 10-40 minutes
  } else if (fillProbability >= 40) {
    estimatedFillTimeMinutes = Math.round(45 + (70 - fillProbability) * 3); // 45-135 minutes
  } else {
    estimatedFillTimeMinutes = Math.round(150 + (40 - fillProbability) * 6); // 150-390 minutes
  }

  return {
    payRate,
    historicalAverage,
    fillProbability,
    estimatedFillTimeMinutes,
    scarcityFactor
  };
}
