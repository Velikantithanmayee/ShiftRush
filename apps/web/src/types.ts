export type UserRole = 'worker' | 'business' | 'admin';
export type TabId = 'home' | 'feed' | 'my-shifts' | 'earnings' | 'profile' | 'reliability' | 'notifications' | 'shifts' | 'payments' | 'verification' | 'templates' | 'calendar' | 'favorites' | 'roadmap' | 'changelog' | 'analytics' | 'fraud' | 'passport' | 'post-shift' | 'check-in' | 'worker-pool' | 'team';
export type Page = 'landing' | 'login' | 'register' | 'forgot_password' | 'dashboard';

export interface SessionUser { id: string; name: string; email: string; role: UserRole; }
export interface Session { token: string; user: SessionUser; }

export interface Shift {
  id: string; role: string; requiredSkills: string[]; startTime: string; endTime: string;
  payRate: number;
  latitude: number | null;
  longitude: number | null;
  city?: string | null;
  area?: string | null;
  address?: string | null;
  pinCode?: string | null;
  radius?: number;
  status: 'open' | 'claimed' | 'completed' | 'cancelled' | 'forwarded';
  businessName: string;
  claimedByWorkerId: string | null; distanceMeters?: number; claimedByWorkerName?: string;
  matchScore?: number; fillProbability?: number;
}
export interface WorkerDot { id: string; x: number; y: number; }
export interface PaymentTransaction {
  id: string; role: string; amount: number; platformFee: number;
  status: 'succeeded' | 'pending' | 'failed'; stripePaymentId: string; createdAt: string;
}
export interface ShiftTemplate { id: string; name: string; role: string; requiredSkills: string[]; payRate: number; urgencyLevel: 'normal' | 'high' | 'critical'; }
export interface FraudAlert { id: string; targetId: string; targetType: string; reason: string; severity: 'low' | 'medium' | 'high'; resolved: boolean; createdAt: string; }
export interface RankedWorker { id: string; name: string; email: string; reliabilityScore: number; matchScore: number; reasoning: string; }
export interface Notification { id: string; message: string; read: boolean; timestamp: string; type: 'info' | 'success' | 'warning' | 'error'; }
