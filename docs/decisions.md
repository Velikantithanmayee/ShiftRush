# Architecture Decision Record (ADR) — Claim Engine Concurrency

## Context

When a shift is posted, it must be claimed by exactly one eligible worker. Since multiple workers can view and click "Accept Shift" at the exact same millisecond, the claiming process must prevent double-allocations (race conditions) while maintaining high throughput and low database contention.

---

## Decision: Postgres Optimistic Locking as Source of Truth with Redis Fast-Path Lock Optimization

We chose **PostgreSQL optimistic locking** as the absolute source of truth, optimized with **Redis distributed locks** as a high-throughput fast-path check.

### Why Postgres is the Source of Truth
1. **Consistency Guarantees**: PostgreSQL transactions and atomic row updates (using `WHERE status = 'open'`) guarantee ACID compliance. Even if the cache (Redis) fails, gets evicted, or experiences replication delay, the database will never allow two workers to claim the same shift.
2. **Atomic Write Query**:
   ```sql
   UPDATE "Shift" 
   SET status = 'claimed', "claimedByWorkerId" = $1, "claimedAt" = NOW()
   WHERE id = $2 AND status = 'open'
   RETURNING *;
   ```
   If this query updates `0` rows, the database confirms the shift was already claimed.

### Why We Use Redis as a Fast-Path Precheck
1. **Database Contention Protection**: If 1,000 workers click "Claim" simultaneously, hitting PostgreSQL with 1,000 writes will saturate connection pools and strain database CPU.
2. **Sub-millisecond Rejection**: A Redis lock check using `SET shift:{id}:lock {workerId} NX PX 5000` intercepts duplicate claims in memory (sub-millisecond speed) before hitting Postgres, rejecting losers with zero database query cost.

---

## Concurrency Test Design & Results

### Concurrency Setup
We designed an integration test at `apps/api/src/__tests__/claimConcurrency.test.ts` that:
1. Programmatically spins up the Express server.
2. Generates JWT access tokens for 50 distinct test worker accounts.
3. Submits 50 concurrent `POST /api/v1/shifts/:id/claim` requests simultaneously using parallel HTTP requests.
4. Asserts that **exactly 1 request** succeeds with `200 OK` (success: true) and **exactly 49 requests** fail with `409 Conflict` (success: false).

### Test Outputs
Running the simulation test produces the following metrics:
- **Total requests fired**: 50
- **Successes (Status 200)**: 1
- **Conflicts (Status 409)**: 49
- **Database consistency**: Verified. The shift's status transitions to `claimed` and is assigned to exactly one worker ID, with zero double-claims.

---

## Reliability Score System Settings & Weights

Recalculated upon shift closure:
- **Completion Rate (Weight: 50%)**: Multiplied by 50 to form baseline.
- **Cancellation Penalty**: Deducts `-15` points per cancellation (capped at `-40` points max deduction).
- **Average Rating (Weight: 30%)**: Scaled from 5-star ratings to a maximum of `30` points.
- **Volume Consistent Bonus**: Up to `+20` points (`+2` points per completed shift) to reward veteran workers.

**Priority notification rule**: Workers with reliability score >= 85 (Rush Priority tier) receive WebSocket matches instantly for critical shifts, giving them a `30-second` head start before standard workers (score < 85) are notified.

---

## Smart Pricing Slider Heuristics

Deterministic fill-rate metrics are generated on-the-fly:
- **Scarcity Factor**: Adjusts rates based on skill sets (e.g. `0.75` for `forklift`, `0.85` for `barista` scarcity).
- **Rate Ratio**: Computes standard index premium by dividing proposed rates by historical averages ($20/hr general base).
- **Fill Timing Estimation**: Timing decreases exponentially from 390 minutes (15% fill probability) down to 3 minutes (99% fill probability).

---

## Shift Chains (Forwarding) Hop Limits

- **Constraint**: Forwarding operations are capped at exactly **1 hop**.
- **Rationale**: Endless chaining causes business disruption and worker reliability tracing deterioration. A worker forwarding a shift spawns a new shift, receives a Sourcing Credit (+1pt) to bypass cancellation penalties, and lets the matching pipeline re-source the job fresh.

