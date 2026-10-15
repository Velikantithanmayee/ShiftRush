import { Router, Response } from 'express';
import { prisma } from '../utils/db.js';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// ----------------- Waitlist -----------------
// Public waitlist registration
router.post('/waitlist', async (req, res) => {
  try {
    const { email: rawEmail, role } = req.body;
    if (!rawEmail || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }
    const email = rawEmail.toLowerCase().trim();

    const existing = await prisma.waitlist.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email is already registered on the waitlist' });
    }

    const entry = await prisma.waitlist.create({
      data: { email, role }
    });
    return res.status(201).json(entry);
  } catch (error) {
    console.error('Waitlist registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin-only waitlist listing
router.get(
  '/waitlist',
  authenticateToken,
  authorizeRoles('admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const entries = await prisma.waitlist.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return res.json(entries);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// ----------------- Feedback Board & Voting -----------------
// List all feedback items
router.get(
  '/feedback',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const feedbacks = await prisma.feedback.findMany({
        include: {
          votesList: true
        },
        orderBy: { votes: 'desc' }
      });
      return res.json(feedbacks);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Create feedback suggestion
router.post(
  '/feedback',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { title, content, category } = req.body;
      if (!title || !content || !category) {
        return res.status(400).json({ error: 'Title, content, and category are required' });
      }

      const feedback = await prisma.feedback.create({
        data: {
          title,
          content,
          category,
          votes: 1
        }
      });

      // Automatically vote for own suggestion
      if (req.user?.id) {
        await prisma.vote.create({
          data: {
            feedbackId: feedback.id,
            userId: req.user.id
          }
        });
      }

      return res.status(201).json(feedback);
    } catch (error) {
      console.error('Feedback creation error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Vote for feedback
router.post(
  '/feedback/:id/vote',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const feedbackId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const existingVote = await prisma.vote.findUnique({
        where: {
          feedbackId_userId: {
            feedbackId,
            userId
          }
        }
      });

      if (existingVote) {
        // Undo vote (toggle)
        await prisma.vote.delete({
          where: {
            feedbackId_userId: {
              feedbackId,
              userId
            }
          }
        });

        const feedback = await prisma.feedback.update({
          where: { id: feedbackId },
          data: {
            votes: { decrement: 1 }
          }
        });

        return res.json({ voted: false, feedback });
      }

      // Add vote
      await prisma.vote.create({
        data: {
          feedbackId,
          userId
        }
      });

      const feedback = await prisma.feedback.update({
        where: { id: feedbackId },
        data: {
          votes: { increment: 1 }
        }
      });

      return res.json({ voted: true, feedback });
    } catch (error) {
      console.error('Feedback voting error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// ----------------- Public Roadmap -----------------
router.get('/roadmap', async (req, res) => {
  try {
    const items = await prisma.roadmapItem.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json(items);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ----------------- Public Changelog -----------------
router.get('/changelog', async (req, res) => {
  try {
    const items = await prisma.changelog.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json(items);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ----------------- Admin Analytics & Fraud -----------------
router.get(
  '/dashboard',
  authenticateToken,
  authorizeRoles('admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const workers = await prisma.worker.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          reliabilityScore: true,
          isAvailable: true,
          createdAt: true
        }
      });

      const businesses = await prisma.business.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        }
      });

      const shifts = await prisma.shift.findMany({
        select: {
          id: true,
          role: true,
          status: true,
          payRate: true,
          createdAt: true
        }
      });

      // Compute analytics
      const totalShifts = shifts.length;
      const claimedShifts = shifts.filter(s => s.status === 'claimed').length;
      const completedShifts = shifts.filter(s => s.status === 'completed').length;
      const openShifts = shifts.filter(s => s.status === 'open').length;
      
      const avgReliability = workers.length > 0 
        ? workers.reduce((sum, w) => sum + w.reliabilityScore, 0) / workers.length
        : 100;

      return res.json({
        workers,
        businesses,
        analytics: {
          totalShifts,
          claimedShifts,
          completedShifts,
          openShifts,
          avgReliability: parseFloat(avgReliability.toFixed(1))
        }
      });
    } catch (error) {
      console.error('Admin dashboard error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.get(
  '/fraud-alerts',
  authenticateToken,
  authorizeRoles('admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const flags = await prisma.fraudFlag.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return res.json(flags);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);
export default router;
