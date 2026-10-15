import { prisma } from '../utils/db.js';

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // meters
}

export interface WorkerWithDistance {
  id: string;
  name: string;
  email: string;
  skills: string[];
  reliabilityScore: number;
  distanceMeters: number;
}

export async function findNearbyAvailableWorkers(
  lat: number,
  lng: number,
  requiredSkills: string[],
  radiusMeters: number = 10000,
  shiftArea?: string | null
): Promise<WorkerWithDistance[]> {
  try {
    // Try primary PostGIS query first (will fall back on SQLite automatically)
    const workers: any[] = await prisma.$queryRaw`
      SELECT id, name, email, skills, "reliabilityScore",
             ST_X("currentLocation"::geometry) as lng, 
             ST_Y("currentLocation"::geometry) as lat
      FROM "Worker"
      WHERE "isAvailable" = true
        AND ST_DWithin("currentLocation", ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radiusMeters})
    `;

    // Filter by skills if required
    return workers
      .filter((w) => {
        let workerSkills: string[] = [];
        try {
          workerSkills = typeof w.skills === 'string' ? JSON.parse(w.skills) : w.skills;
        } catch {
          workerSkills = Array.isArray(w.skills) ? w.skills : [];
        }
        if (requiredSkills.length === 0) return true;
        return requiredSkills.every((skill) => workerSkills.includes(skill));
      })
      .map((w) => {
        let workerSkills: string[] = [];
        try {
          workerSkills = typeof w.skills === 'string' ? JSON.parse(w.skills) : w.skills;
        } catch {
          workerSkills = Array.isArray(w.skills) ? w.skills : [];
        }
        return {
          id: w.id,
          name: w.name,
          email: w.email,
          skills: workerSkills,
          reliabilityScore: w.reliabilityScore,
          distanceMeters: haversineDistance(lat, lng, w.lat, w.lng)
        };
      });
  } catch (err) {
    // Fallback: load all available workers and filter in-memory (works on SQLite!)
    const allAvailableWorkers = await prisma.worker.findMany({
      where: { isAvailable: true }
    });

    const matchedWorkers: WorkerWithDistance[] = [];

    for (const w of allAvailableWorkers) {
      let workerSkills: string[] = [];
      try {
        workerSkills = typeof w.skills === 'string' ? JSON.parse(w.skills) : w.skills;
      } catch {
        workerSkills = [];
      }

      const hasSkills = requiredSkills.length === 0 || requiredSkills.every((skill) => workerSkills.includes(skill));
      if (hasSkills) {
        const workerLat = w.latitude !== null && w.latitude !== undefined ? w.latitude : 37.7749;
        const workerLng = w.longitude !== null && w.longitude !== undefined ? w.longitude : -122.4194;
        const distance = haversineDistance(lat, lng, workerLat, workerLng);

        // Convert worker's maxTravelDistance (km) to meters
        const maxWorkerDistanceMeters = (w.maxTravelDistance || 20) * 1000;

        let areaMatches = true;
        if (shiftArea) {
          try {
            const prefs = typeof w.preferredWorkAreas === 'string' ? JSON.parse(w.preferredWorkAreas) : w.preferredWorkAreas;
            if (Array.isArray(prefs) && prefs.length > 0) {
              areaMatches = prefs.includes(shiftArea);
            }
          } catch {
            // Ignore parse errors, allow if empty
          }
        }

        if (distance <= radiusMeters && distance <= maxWorkerDistanceMeters && areaMatches) {
          matchedWorkers.push({
            id: w.id,
            name: w.name,
            email: w.email,
            skills: workerSkills,
            reliabilityScore: w.reliabilityScore,
            distanceMeters: distance
          });
        }
      }
    }

    return matchedWorkers;
  }
}
