import { Request, Response } from 'express';
import { prisma } from '../utils/db.js';
import { CreateShiftSchema } from '@shiftrush/shared-types';
import { enqueueShiftMatching, shiftNotifications } from '../services/queueService.js';
import { acquireClaimLock, releaseClaimLock, checkAndRegisterIdempotency, cacheIdempotencyResponse } from '../services/redisService.js';
import { haversineDistance } from '../services/geoService.js';
import { predictFillStats } from '../services/pricingService.js';
import { recalculateWorkerReliability } from '../services/reliabilityService.js';
import { io } from '../index.js';

export async function createShift(req: Request, res: Response) {
  const result = CreateShiftSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.flatten() });
  }

  const { role, requiredSkills, startTime, endTime, payRate, latitude, longitude, urgencyLevel, city, area, address, pinCode, radius } = result.data;
  const businessId = (req as any).user.id;

  try {
    const shift = await prisma.shift.create({
      data: {
        businessId,
        role,
        requiredSkills: JSON.stringify(requiredSkills || []),
        startTime,
        endTime,
        payRate,
        urgencyLevel,
        city,
        area,
        address,
        pinCode,
        radius,
        latitude: latitude !== undefined ? latitude : null,
        longitude: longitude !== undefined ? longitude : null
      }
    });

    // Trigger matching pipeline in background
    enqueueShiftMatching({
      shiftId: shift.id,
      lat: latitude,
      lng: longitude,
      requiredSkills
    });

    let parsedSkills: string[] = [];
    try {
      parsedSkills = typeof shift.requiredSkills === 'string' ? JSON.parse(shift.requiredSkills) : shift.requiredSkills;
    } catch {
      parsedSkills = [];
    }

    io.to(`business:${businessId}`).emit('shift:new', { 
      shift: { ...shift, requiredSkills: parsedSkills } 
    });

    return res.status(201).json({
      ...shift,
      requiredSkills: parsedSkills
    });
  } catch (error) {
    console.error('Create shift error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getNearbyShifts(req: Request, res: Response) {
  const latStr = req.query.lat as string;
  const lngStr = req.query.lng as string;
  
  if (!latStr || !lngStr) {
    return res.status(400).json({ error: 'Latitude (lat) and longitude (lng) are required' });
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  try {
    // Under SQLite, we fall back to haversine memory checking automatically by going straight to catch or simulating it
    throw new Error('SQLite database fallback');
  } catch (err) {
    // Fallback: standard prisma query (works on SQLite!)
    const openShifts = await prisma.shift.findMany({
      where: { status: 'open' },
      include: { business: { select: { name: true } } }
    });

    const mappedShifts = openShifts.map((s) => {
      let shiftSkills: string[] = [];
      try {
        shiftSkills = typeof s.requiredSkills === 'string' ? JSON.parse(s.requiredSkills) : s.requiredSkills;
      } catch {
        shiftSkills = [];
      }

      const shiftLat = s.latitude !== null && s.latitude !== undefined ? s.latitude : 37.7749;
      const shiftLng = s.longitude !== null && s.longitude !== undefined ? s.longitude : -122.4194;
      const distanceMeters = haversineDistance(lat, lng, shiftLat, shiftLng);

      return {
        id: s.id,
        role: s.role,
        requiredSkills: shiftSkills,
        startTime: s.startTime,
        endTime: s.endTime,
        payRate: s.payRate,
        status: s.status,
        urgencyLevel: s.urgencyLevel,
        businessId: s.businessId,
        businessName: s.business.name,
        distanceMeters
      };
    });

    // Sort by Urgency first, then proximity, then pay
    mappedShifts.sort((a, b) => {
      const urgencyScore: Record<string, number> = { critical: 3, high: 2, normal: 1 };
      const urgencyDiff = (urgencyScore[b.urgencyLevel] || 1) - (urgencyScore[a.urgencyLevel] || 1);
      if (urgencyDiff !== 0) return urgencyDiff;
      return a.distanceMeters - b.distanceMeters;
    });

    return res.json(mappedShifts);
  }
}

export async function claimShift(req: Request, res: Response) {
  const shiftId = req.params.id;
  const workerId = (req as any).user.id;
  const workerName = (req as any).user.name;
  
  // Enforce idempotency to prevent double-claiming due to client double-tap
  const idempotencyKey = req.headers['x-idempotency-key'] as string;
  if (idempotencyKey) {
    const { isDuplicate, cachedResponse } = await checkAndRegisterIdempotency(idempotencyKey);
    if (isDuplicate) {
      console.log(`[ClaimEngine] Duplicate request matching idempotency key ${idempotencyKey}`);
      return res.status(200).json(cachedResponse);
    }
  }

  // Pre-claim validation: is worker eligible?
  const worker = await prisma.worker.findUnique({
    where: { id: workerId }
  });

  if (!worker || !worker.isAvailable) {
    const responsePayload = { success: false, error: 'Worker is unavailable or account doesn\'t exist' };
    if (idempotencyKey) cacheIdempotencyResponse(idempotencyKey, responsePayload);
    await prisma.shiftClaimLog.create({
      data: { shiftId, workerId, result: 'ineligible' }
    });
    return res.status(403).json(responsePayload);
  }

  // Secondary optimization: Fast-path lock precheck
  const lockAcquired = await acquireClaimLock(shiftId, workerId);
  if (!lockAcquired) {
    const responsePayload = { success: false, error: 'Shift was already claimed' };
    if (idempotencyKey) cacheIdempotencyResponse(idempotencyKey, responsePayload);
    await prisma.shiftClaimLog.create({
      data: { shiftId, workerId, result: 'lost_race' }
    });
    return res.status(409).json(responsePayload);
  }

  try {
    // Primary mechanism: Atomic update verification (concurrency-safe on all databases)
    const updated = await prisma.shift.updateMany({
      where: {
        id: shiftId,
        status: 'open'
      },
      data: {
        status: 'claimed',
        claimedByWorkerId: workerId,
        claimedAt: new Date()
      }
    });

    if (updated.count === 0) {
      releaseClaimLock(shiftId, workerId);
      const responsePayload = { success: false, error: 'Shift was already claimed' };
      if (idempotencyKey) cacheIdempotencyResponse(idempotencyKey, responsePayload);
      
      await prisma.shiftClaimLog.create({
        data: { shiftId, workerId, result: 'lost_race' }
      });
      return res.status(409).json(responsePayload);
    }

    const claimedShift = await prisma.shift.findUnique({
      where: { id: shiftId }
    });

    if (!claimedShift) {
      throw new Error('Shift not found after claiming');
    }

    // Log victory
    await prisma.shiftClaimLog.create({
      data: { shiftId, workerId, result: 'won' }
    });

    const responsePayload = { 
      success: true, 
      shift: {
        id: claimedShift.id,
        role: claimedShift.role,
        status: claimedShift.status,
        claimedByWorkerId: claimedShift.claimedByWorkerId,
        claimedAt: claimedShift.claimedAt
      }
    };
    
    if (idempotencyKey) cacheIdempotencyResponse(idempotencyKey, responsePayload);

    // WebSocket fan-out updates:
    // 1. Notify the business dashboard
    io.to(`business:${claimedShift.businessId}`).emit('shift:claimed', {
      shiftId,
      workerId,
      workerName
    });

    // 2. Broadcast shift claimed to delete it from other feeds
    io.emit('shift:claimed_global', { shiftId });

    return res.status(200).json(responsePayload);
  } catch (err) {
    console.error('[ClaimEngine] Lock claim transaction failed:', err);
    releaseClaimLock(shiftId, workerId);
    return res.status(500).json({ error: 'Internal claim transaction failure' });
  }
}

export async function getBusinessDashboard(req: Request, res: Response) {
  const businessId = (req as any).user.id;

  try {
    const shifts = await prisma.shift.findMany({
      where: { businessId },
      include: {
        claimedByWorker: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate metrics
    const totalShifts = shifts.length;
    const filledShifts = shifts.filter(s => s.status === 'claimed' || s.status === 'completed').length;
    const fillRate = totalShifts > 0 ? (filledShifts / totalShifts) * 100 : 0;
    
    // Average fill speed
    const claimedShifts = shifts.filter(s => s.claimedAt && s.createdAt);
    let avgTimeToFillMinutes = 0;
    if (claimedShifts.length > 0) {
      const totalTimeDiff = claimedShifts.reduce((acc, s) => {
        const diffMs = new Date(s.claimedAt!).getTime() - new Date(s.createdAt).getTime();
        return acc + diffMs;
      }, 0);
      avgTimeToFillMinutes = (totalTimeDiff / claimedShifts.length) / 60000;
    }

    // Attach current live notifications count and parse requiredSkills
    const mappedShifts = shifts.map(s => {
      let shiftSkills: string[] = [];
      try {
        shiftSkills = typeof s.requiredSkills === 'string' ? JSON.parse(s.requiredSkills) : s.requiredSkills;
      } catch {
        shiftSkills = [];
      }
      return {
        ...s,
        requiredSkills: shiftSkills,
        notifiedCount: shiftNotifications.get(s.id)?.length || 0
      };
    });

    return res.json({
      metrics: {
        totalShifts,
        fillRate: parseFloat(fillRate.toFixed(1)),
        avgTimeToFillMinutes: parseFloat(avgTimeToFillMinutes.toFixed(1))
      },
      shifts: mappedShifts
    });
  } catch (error) {
    console.error('Get business dashboard metrics failed:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function predictShiftFill(req: Request, res: Response) {
  const shiftId = req.params.id;
  const payRateStr = req.query.payRate as string;

  if (!payRateStr) {
    return res.status(400).json({ error: 'payRate query parameter is required' });
  }

  const payRate = parseFloat(payRateStr);

  try {
    const shift = await prisma.shift.findUnique({
      where: { id: shiftId }
    });

    if (!shift) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    let shiftSkills: string[] = [];
    try {
      shiftSkills = typeof shift.requiredSkills === 'string' ? JSON.parse(shift.requiredSkills) : shift.requiredSkills;
    } catch {
      shiftSkills = [];
    }

    const prediction = predictFillStats(payRate, shiftSkills, shift.urgencyLevel as "critical" | "normal" | "high");
    return res.json(prediction);
  } catch (error) {
    console.error('Predict fill rate failed:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function predictNewShiftFill(req: Request, res: Response) {
  const payRateStr = req.query.payRate as string;
  const skillsStr = req.query.skills as string;
  const urgency = (req.query.urgency as any) || 'normal';

  if (!payRateStr) {
    return res.status(400).json({ error: 'payRate is required' });
  }

  const payRate = parseFloat(payRateStr);
  const requiredSkills = skillsStr ? skillsStr.split(',') : [];

  try {
    const prediction = predictFillStats(payRate, requiredSkills, urgency);
    return res.json(prediction);
  } catch (error) {
    console.error('Predict new fill rate failed:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function forwardShift(req: Request, res: Response) {
  const shiftId = req.params.id;
  const workerId = (req as any).user.id;

  try {
    const shift = await prisma.shift.findUnique({
      where: { id: shiftId }
    });

    if (!shift) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    if (shift.status !== 'claimed' || shift.claimedByWorkerId !== workerId) {
      return res.status(400).json({ error: 'You can only forward shifts you currently claim' });
    }

    // 1-Hop Constraint check
    const parentForwardRelation = await prisma.shiftForward.findFirst({
      where: { originalShiftId: shiftId }
    });

    if (parentForwardRelation) {
      return res.status(403).json({ error: 'Forwarding is capped at exactly one hop to avoid endless chains' });
    }

    // Perform forwarding transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark original shift as forwarded
      await tx.shift.update({
        where: { id: shiftId },
        data: { status: 'forwarded' }
      });

      // 2. Spawn a new identical shift, marked as open
      const newShift = await tx.shift.create({
        data: {
          businessId: shift.businessId,
          role: `${shift.role} (Forwarded)`,
          requiredSkills: shift.requiredSkills,
          startTime: shift.startTime,
          endTime: shift.endTime,
          payRate: shift.payRate,
          urgencyLevel: 'high',
          status: 'open',
          latitude: shift.latitude,
          longitude: shift.longitude
        }
      });

      // 3. Log the shift forward relation
      const forwardLog = await tx.shiftForward.create({
        data: {
          originalShiftId: shiftId,
          fromWorkerId: workerId,
          toWorkerId: 'pending_matching',
          status: 'pending'
        }
      });

      return { newShift, forwardLog };
    });

    let shiftSkills: string[] = [];
    try {
      shiftSkills = typeof shift.requiredSkills === 'string' ? JSON.parse(shift.requiredSkills) : shift.requiredSkills;
    } catch {
      shiftSkills = [];
    }

    // Re-run the matching pipeline for the newly created open shift
    enqueueShiftMatching({
      shiftId: result.newShift.id,
      lat: shift.latitude !== null && shift.latitude !== undefined ? shift.latitude : 37.7749,
      lng: shift.longitude !== null && shift.longitude !== undefined ? shift.longitude : -122.4194,
      requiredSkills: shiftSkills
    });

    // Update reliability score for forwarding worker
    await recalculateWorkerReliability(workerId);

    // Notify business about forwarding
    io.to(`business:${shift.businessId}`).emit('shift:forwarded', {
      originalShiftId: shiftId,
      newShiftId: result.newShift.id,
      fromWorkerName: (req as any).user.name
    });

    return res.status(200).json({
      message: 'Shift forwarded successfully. Matching engine re-initialized.',
      newShiftId: result.newShift.id
    });
  } catch (error) {
    console.error('Forward shift failed:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getBusinessPayments(req: Request, res: Response) {
  const businessId = (req as any).user.id;
  if (!businessId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { getUserPaymentsHistory } = await import('../services/paymentsService.js');
    const payments = await getUserPaymentsHistory(businessId, 'business');
    return res.json(payments);
  } catch (error) {
    console.error('Failed loading business payments:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getTemplates(req: Request, res: Response) {
  const businessId = (req as any).user.id;
  try {
    const templates = await prisma.shiftTemplate.findMany({ where: { businessId } });
    const parsed = templates.map(t => {
      let requiredSkills: string[] = [];
      try {
        requiredSkills = typeof t.requiredSkills === 'string' ? JSON.parse(t.requiredSkills) : t.requiredSkills;
      } catch {
        requiredSkills = [];
      }
      return {
        ...t,
        requiredSkills
      };
    });
    return res.json(parsed);
  } catch (error) {
    return res.status(500).json({ error: 'Failed loading templates' });
  }
}

export async function createTemplate(req: Request, res: Response) {
  const businessId = (req as any).user.id;
  const { name, role, requiredSkills, payRate, urgencyLevel } = req.body;
  try {
    const t = await prisma.shiftTemplate.create({
      data: {
        businessId,
        name,
        role,
        requiredSkills: JSON.stringify(requiredSkills || []),
        payRate: Number(payRate),
        urgencyLevel: urgencyLevel || 'normal'
      }
    });
    return res.status(201).json(t);
  } catch (error) {
    return res.status(500).json({ error: 'Failed creating template' });
  }
}

export async function getFavorites(req: Request, res: Response) {
  const businessId = (req as any).user.id;
  try {
    const favs = await prisma.favoriteWorker.findMany({
      where: { businessId },
      include: { worker: true }
    });
    const workers = favs.map(f => {
      let skills: string[] = [];
      try {
        skills = typeof f.worker.skills === 'string' ? JSON.parse(f.worker.skills) : f.worker.skills;
      } catch {
        skills = [];
      }
      return {
        id: f.worker.id,
        name: f.worker.name,
        email: f.worker.email,
        skills,
        reliabilityScore: f.worker.reliabilityScore
      };
    });
    return res.json(workers);
  } catch (error) {
    return res.status(500).json({ error: 'Failed loading favorites' });
  }
}

export async function addFavorite(req: Request, res: Response) {
  const businessId = (req as any).user.id;
  const { workerId } = req.body;
  try {
    const fav = await prisma.favoriteWorker.create({
      data: { businessId, workerId }
    });
    return res.status(201).json(fav);
  } catch (error) {
    return res.status(500).json({ error: 'Failed saving favorite worker link' });
  }
}

export async function getShiftAiMatches(req: Request, res: Response) {
  const shiftId = req.params.id;
  try {
    const shift = await prisma.shift.findUnique({ where: { id: shiftId } });
    if (!shift) return res.status(404).json({ error: 'Shift not found' });
    
    let reqSkills: string[] = [];
    try {
      reqSkills = typeof shift.requiredSkills === 'string' ? JSON.parse(shift.requiredSkills) : shift.requiredSkills;
    } catch {
      reqSkills = [];
    }

    const { findNearbyAvailableWorkers } = await import('../services/geoService.js');
    const { rankWorkersList } = await import('../services/aiMatchingService.js');
    
    const workers = await findNearbyAvailableWorkers(37.7749, -122.4194, reqSkills);
    const ranked = rankWorkersList(workers, reqSkills);

    return res.json(ranked);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed calculating AI rankings' });
  }
}

export async function editShift(req: Request, res: Response) {
  const shiftId = req.params.id;
  const businessId = (req as any).user.id;
  const { payRate, urgencyLevel, role } = req.body;
  
  try {
    const shift = await prisma.shift.findUnique({ where: { id: shiftId } });
    if (!shift || shift.businessId !== businessId) return res.status(403).json({ error: 'Not authorized' });
    if (shift.status !== 'open') return res.status(400).json({ error: 'Cannot edit claimed/completed shifts' });

    const updated = await prisma.shift.update({
      where: { id: shiftId },
      data: { 
        ...(payRate && { payRate: Number(payRate) }), 
        ...(urgencyLevel && { urgencyLevel }),
        ...(role && { role })
      }
    });

    io.emit('shift:updated', { shiftId, payRate, urgencyLevel, role });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: 'Update failed' });
  }
}

export async function cancelShift(req: Request, res: Response) {
  const shiftId = req.params.id;
  const businessId = (req as any).user.id;
  
  try {
    const shift = await prisma.shift.findUnique({ where: { id: shiftId } });
    if (!shift || shift.businessId !== businessId) return res.status(403).json({ error: 'Not authorized' });
    if (shift.status === 'completed') return res.status(400).json({ error: 'Cannot cancel completed shifts' });

    await prisma.shift.update({
      where: { id: shiftId },
      data: { status: 'cancelled' }
    });

    io.emit('shift:cancelled', { shiftId });
    if (shift.claimedByWorkerId) {
      io.to(`worker:${shift.claimedByWorkerId}`).emit('notification', { message: `Shift ${shift.role} was cancelled by the facility.` });
    }

    return res.json({ message: 'Shift cancelled' });
  } catch (err) {
    return res.status(500).json({ error: 'Cancel failed' });
  }
}
