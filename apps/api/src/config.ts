import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/shiftrush?schema=public',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'shiftrush-access-secret-key-1029384756',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'shiftrush-refresh-secret-key-6547382910',
  JWT_ACCESS_EXPIRY: '15m' as const,
  JWT_REFRESH_EXPIRY: '7d' as const
};
