// Simple Redis-emulated cache and lock registry for local setup
// Stores lockKey -> workerId
const inMemoryLocks = new Map<string, string>();
const inMemoryIdempotencyKeys = new Map<string, any>();

/**
 * Attempts to acquire a sub-millisecond fast-path lock for a worker claiming a shift.
 * Mimics: SET shift:{id}:lock {workerId} NX PX 5000
 */
export async function acquireClaimLock(shiftId: string, workerId: string): Promise<boolean> {
  const lockKey = `shift:${shiftId}:lock`;
  
  // In production, we'd use redis client:
  // const result = await redis.set(lockKey, workerId, 'NX', 'PX', 5000);
  // return result === 'OK';
  
  const existingLockOwner = inMemoryLocks.get(lockKey);
  if (existingLockOwner) {
    // Lock is already held by someone else (or the same worker)
    return existingLockOwner === workerId;
  }

  // Acquire lock
  inMemoryLocks.set(lockKey, workerId);

  // Release lock automatically after 5 seconds to prevent deadlocks
  setTimeout(() => {
    if (inMemoryLocks.get(lockKey) === workerId) {
      inMemoryLocks.delete(lockKey);
    }
  }, 5000);

  return true;
}

export function releaseClaimLock(shiftId: string, workerId: string) {
  const lockKey = `shift:${shiftId}:lock`;
  if (inMemoryLocks.get(lockKey) === workerId) {
    inMemoryLocks.delete(lockKey);
  }
}

/**
 * Checks and registers an idempotency key to prevent double claiming on retries.
 */
export async function checkAndRegisterIdempotency(key: string, responsePayload?: any): Promise<{ isDuplicate: boolean; cachedResponse?: any }> {
  if (inMemoryIdempotencyKeys.has(key)) {
    return {
      isDuplicate: true,
      cachedResponse: inMemoryIdempotencyKeys.get(key)
    };
  }
  return { isDuplicate: false };
}

export function cacheIdempotencyResponse(key: string, responsePayload: any) {
  inMemoryIdempotencyKeys.set(key, responsePayload);
  
  // Clear after 1 hour
  setTimeout(() => {
    inMemoryIdempotencyKeys.delete(key);
  }, 3600000);
}
