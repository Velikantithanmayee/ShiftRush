import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { UserPayload } from '@shiftrush/shared-types';

export function generateAccessToken(payload: UserPayload): string {
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRY
  });
}

export function generateRefreshToken(payload: UserPayload): string {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRY
  });
}

export function verifyAccessToken(token: string): UserPayload {
  return jwt.verify(token, config.JWT_ACCESS_SECRET) as UserPayload;
}

export function verifyRefreshToken(token: string): UserPayload {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as UserPayload;
}
