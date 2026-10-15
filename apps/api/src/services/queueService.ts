import { io } from '../index.js';
import { prisma } from '../utils/db.js';
import { findNearbyAvailableWorkers } from './geoService.js';

// In-memory registry to track notifications sent to workers for analytics/UI counters
export const shiftNotifications = new Map<string, string[]>(); // shiftId -> array of workerIds

export interface ShiftMatchingJob {
  shiftId: string;
  lat: number;
  lng: number;
  requiredSkills: string[];
}

export async function processShiftMatching(job: ShiftMatchingJob) {
  const { shiftId, lat, lng, requiredSkills } = job;
  console.log(`[QueueService] Processing matching for shift ${shiftId}`);

  try {
    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
      include: { business: true }
    });

    if (!shift || shift.status !== 'open') {
      console.log(`[QueueService] Shift ${shiftId} is no longer open. Skipping match.`);
      return;
    }

    // Match workers (dynamically sized radius, max 50km if null)
    const shiftRadiusMeters = (shift.radius || 10.0) * 1000;
    const matchedWorkers = await findNearbyAvailableWorkers(lat, lng, requiredSkills, shiftRadiusMeters, shift.area);
    const workerIds = matchedWorkers.map((w) => w.id);

    // Save notified list in registry
    shiftNotifications.set(shiftId, workerIds);

    console.log(`[QueueService] Found ${workerIds.length} workers to notify for shift ${shiftId}`);

    // Broadcast live notified counter update to the posting business
    io.to(`business:${shift.businessId}`).emit('shift:notified_update', {
      shiftId,
      notifiedCount: workerIds.length
    });

    // Notify workers based on priority tiering for Critical shifts
    const priorityWorkers = matchedWorkers.filter(w => w.reliabilityScore >= 85);
    const standardWorkers = matchedWorkers.filter(w => w.reliabilityScore < 85);

    const notifyWorker = (worker: typeof matchedWorkers[0]) => {
      const socketChannel = `worker:${worker.id}`;
      io.to(socketChannel).emit('shift:new', {
        shift: {
          id: shift.id,
          role: shift.role,
          payRate: shift.payRate,
          requiredSkills: shift.requiredSkills,
          startTime: shift.startTime,
          endTime: shift.endTime,
          urgencyLevel: shift.urgencyLevel,
          distanceMeters: worker.distanceMeters,
          businessName: shift.business.name,
          city: shift.city,
          area: shift.area
        }
      });
      console.log(`[QueueService] Dispatched new shift notification to worker ${worker.id}`);
    };

    if (shift.urgencyLevel === 'critical') {
      console.log(`[QueueService] Critical urgency: notifying ${priorityWorkers.length} priority workers instantly.`);
      priorityWorkers.forEach(notifyWorker);

      if (standardWorkers.length > 0) {
        console.log(`[QueueService] Scheduling ${standardWorkers.length} standard workers notifications with 30s delay.`);
        setTimeout(async () => {
          try {
            const currentShift = await prisma.shift.findUnique({ where: { id: shiftId } });
            if (currentShift && currentShift.status === 'open') {
              console.log(`[QueueService] 30s delay elapsed: notifying standard workers.`);
              standardWorkers.forEach(notifyWorker);
            }
          } catch (e) {
            console.error('Delayed notifications check failed:', e);
          }
        }, 30000);
      }
    } else {
      matchedWorkers.forEach(notifyWorker);
    }
  } catch (error) {
    console.error(`[QueueService] Error processing matching for shift ${shiftId}:`, error);
  }
}

// Service helper to enqueue tasks
export function enqueueShiftMatching(job: ShiftMatchingJob) {
  console.log(`[QueueService] Enqueueing shift matching job for ${job.shiftId}`);

  // In production, we'd add to BullMQ: `await matchingQueue.add('match', job)`
  // For local run/test speed and zero external dependencies: we run it in a setTimeout
  // to run asynchronously in the background (~500ms delay) without blocking the response.
  setTimeout(async () => {
    await processShiftMatching(job);
  }, 500);
}
