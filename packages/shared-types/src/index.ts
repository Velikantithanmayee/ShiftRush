import { z } from 'zod';

export type UserRole = 'business' | 'worker' | 'admin';

export type ShiftStatus = 'open' | 'claimed' | 'completed' | 'cancelled' | 'forwarded';

export type ShiftUrgency = 'normal' | 'high' | 'critical';

export type ClaimResult = 'won' | 'lost_race' | 'ineligible';

export interface UserPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserPayload;
}

export const SignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['business', 'worker', 'admin']),
  skills: z.array(z.string()).optional(),
  hourlyRateMin: z.number().optional(),
  hourlyRateMax: z.number().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const CreateShiftSchema = z.object({
  role: z.string().min(2, 'Role is required'),
  requiredSkills: z.array(z.string()).min(1, 'At least one skill is required'),
  startTime: z.string().or(z.date()).transform((val) => new Date(val)),
  endTime: z.string().or(z.date()).transform((val) => new Date(val)),
  payRate: z.number().positive('Pay rate must be positive'),
  city: z.string().min(1, 'City is required'),
  area: z.string().min(1, 'Area is required'),
  address: z.string().min(1, 'Address is required'),
  pinCode: z.string().min(1, 'Pin Code is required'),
  radius: z.number().positive('Radius must be positive').default(10.0),
  latitude: z.number(),
  longitude: z.number(),
  urgencyLevel: z.enum(['normal', 'high', 'critical']).default('normal')
});

export type SignupInput = z.infer<typeof SignupSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateShiftInput = z.infer<typeof CreateShiftSchema>;
