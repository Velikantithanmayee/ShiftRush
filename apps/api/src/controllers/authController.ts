import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/db.js';
import { SignupSchema, LoginSchema, UserPayload } from '@shiftrush/shared-types';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

export async function signup(req: Request, res: Response) {
  const result = SignupSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.flatten() });
  }

  const { email: rawEmail, password, name, role, skills, hourlyRateMin, hourlyRateMax, latitude, longitude } = result.data;
  const email = rawEmail.toLowerCase().trim();

  try {
    // Check if user already exists in either table
    const existingBusiness = await prisma.business.findUnique({ where: { email } });
    const existingWorker = await prisma.worker.findUnique({ where: { email } });
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });

    if (existingBusiness || existingWorker || existingAdmin) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let userPayload: UserPayload;

    if (role === 'business') {
      const business = await prisma.business.create({
        data: {
          name,
          email,
          passwordHash,
          latitude: latitude !== undefined ? latitude : null,
          longitude: longitude !== undefined ? longitude : null
        }
      });

      userPayload = {
        id: business.id,
        name: business.name,
        email: business.email,
        role: 'business'
      };
    } else if (role === 'worker') {
      const worker = await prisma.worker.create({
        data: {
          name,
          email,
          passwordHash,
          skills: JSON.stringify(skills || []),
          hourlyRateMin: hourlyRateMin || 0,
          hourlyRateMax: hourlyRateMax || 0,
          latitude: latitude !== undefined ? latitude : null,
          longitude: longitude !== undefined ? longitude : null,
          verifiedBadges: JSON.stringify(['food_handler'])
        }
      });

      userPayload = {
        id: worker.id,
        name: worker.name,
        email: worker.email,
        role: 'worker'
      };
    } else if (role === 'admin') {
      const admin = await prisma.admin.create({
        data: {
          name,
          email,
          passwordHash
        }
      });

      userPayload = {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: 'admin'
      };
    } else {
      return res.status(400).json({ error: 'Unsupported role type' });
    }

    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    return res.status(201).json({
      accessToken,
      refreshToken,
      user: userPayload
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function login(req: Request, res: Response) {
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.flatten() });
  }

  const { email: rawEmail, password } = result.data;
  const email = rawEmail.toLowerCase().trim();

  try {
    // Attempt lookup in business, worker, and admin tables
    const business = await prisma.business.findUnique({ where: { email } });
    const worker = await prisma.worker.findUnique({ where: { email } });
    const admin = await prisma.admin.findUnique({ where: { email } });

    let userPayload: UserPayload | null = null;
    let dbPasswordHash = '';

    if (business) {
      userPayload = { id: business.id, name: business.name, email: business.email, role: 'business' };
      dbPasswordHash = business.passwordHash;
    } else if (worker) {
      userPayload = { id: worker.id, name: worker.name, email: worker.email, role: 'worker' };
      dbPasswordHash = worker.passwordHash;
    } else if (admin) {
      userPayload = { id: admin.id, name: admin.name, email: admin.email, role: 'admin' };
      dbPasswordHash = admin.passwordHash;
    }

    if (!userPayload || !(await bcrypt.compare(password, dbPasswordHash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    return res.json({
      accessToken,
      refreshToken,
      user: userPayload
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    
    // Check if user still exists
    let userExists = false;
    if (decoded.role === 'business') {
      const b = await prisma.business.findUnique({ where: { id: decoded.id } });
      userExists = !!b;
    } else if (decoded.role === 'worker') {
      const w = await prisma.worker.findUnique({ where: { id: decoded.id } });
      userExists = !!w;
    } else if (decoded.role === 'admin') {
      const a = await prisma.admin.findUnique({ where: { id: decoded.id } });
      userExists = !!a;
    }

    if (!userExists) {
      return res.status(403).json({ error: 'User no longer exists or role mismatch' });
    }

    const userPayload: UserPayload = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role
    };

    const newAccessToken = generateAccessToken(userPayload);
    const newRefreshToken = generateRefreshToken(userPayload);

    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: userPayload
    });
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
}
