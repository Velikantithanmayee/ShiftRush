# ShiftRush 🚀

ShiftRush is a real-time, on-demand staffing marketplace designed for instant shift-posting, matching, and safe claims under high concurrency. Built as a fullstack TypeScript monorepo, ShiftRush is engineered with modern architecture and premium design principles to wow users and ensure production reliability.

## 🏗️ Architecture & Core Components

ShiftRush is structured as a monorepo containing:
- **`apps/web`**: Single Page Application built with **React**, **Vite**, **TypeScript**, and **Lucide Icons**. Styled with high-contrast premium theme-driven custom CSS with dark mode support.
- **`apps/api`**: **Express.js** REST and WebSocket API built with **Prisma ORM** and SQLite.
- **`packages/shared-types`**: Shared TypeScript types and interfaces between client and server.
- **`packages/load-test`**: Concurrency load test scripts powered by **Artillery**.

---

## 💎 Features & Technical Achievements

### 1. Concurrency-Safe Claim Engine (Phase 2)
The core value proposition of ShiftRush is a race-safe shift claiming algorithm. Under high concurrent load, multiple workers attempting to claim the same shift are handled cleanly:
- **Optimistic Locking**: Leverages versioning on shift models to prevent double-claiming.
- **Queue Matchmaking**: Rapid notification dispatch matching required skills and vicinity.

### 2. Reliability Score & Rush Priority (Phase 3)
Workers and businesses receive a calculated **Reliability Score (0–100)**:
- Weighted by shift completion rates, punctuality, cancellations, and reviews.
- **Rush Priority**: High-reliability workers receive early matching notifications (30-second priority window) for critical shifts before they are visible to lower-scored workers.

### 3. Smart Fill-Rate Pricing (Phase 3)
A real-time predictive pricing slider:
- Estimates fill probabilities (5% to 99%) and expected fill times dynamically.
- Considers pay differential compared to average market rates for the specific role, skill scarcity, urgency level, and time of day.

### 4. Shift Chains & Forwarding (Phase 3)
Allows workers to forward shifts to other qualified peers rather than cancelling:
- Capped at a 1-hop limit.
- Grants **Sourcing Credits** that improve the forwarding worker's reliability score and bypasses cancellation penalties.

### 5. Live Ops Map (Phase 3)
A dynamic real-time visualization of available shifts and nearby workers:
- Sleek, linear-style sweeping radar grid implemented in SVG.
- Geofuzzed worker coordinates for privacy preservation.

### 6. Stripe Connect Payments (Phase 4)
- Automated escrow holding on shift claim.
- Final capture and payouts scheduled to workers' connected Stripe Express accounts on shift completion (incorporating a configurable platform fee).

### 7. Skill Verification Badge System (Phase 4)
- Pre-signed S3 URL file uploading for credentialing documents.
- Admin approval panel that awards verified badges instantly.

### 8. No-Show Risk Radar (Phase 4)
- A heuristic regression model evaluating the likelihood of a worker no-show.
- Categorizes claimed shifts into Low, Medium, and High risk, prompting automatic backup dispatcher queues if risk levels spike.

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation

1. Clone the repository and navigate to the directory:
   ```bash
   cd SHIFTRUSH
   ```

2. Install dependencies:
   ```bash
   npm.cmd install
   ```

3. Initialize Database & Seed:
   ```bash
   npm.cmd run db:setup
   ```

4. Run local development environment:
   ```bash
   npm.cmd run dev
   ```

5. Build the monorepo for production:
   ```bash
   npm.cmd run build
   ```

---

## 📊 Verification & Performance Metrics
Detailed load test parameters and performance statistics can be reviewed in [/docs/load-test-results.md](file:///c:/Users/velik/OneDrive/Attachments/Desktop/SHIFTRUSH/docs/load-test-results.md).
Architectural decisions and weights are documented in [/docs/decisions.md](file:///c:/Users/velik/OneDrive/Attachments/Desktop/SHIFTRUSH/docs/decisions.md).
