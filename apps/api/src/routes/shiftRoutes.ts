import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { 
  createShift, getNearbyShifts, claimShift, getBusinessDashboard, 
  predictShiftFill, predictNewShiftFill, forwardShift, getBusinessPayments,
  getTemplates, createTemplate, getFavorites, addFavorite, getShiftAiMatches,
  editShift, cancelShift
} from '../controllers/shiftController.js';

const router = Router();

// Protect all routes with JWT auth
router.use(authenticateToken);

// Business endpoints
router.post('/', authorizeRoles('business'), createShift);
router.patch('/:id', authorizeRoles('business'), editShift);
router.post('/:id/cancel', authorizeRoles('business'), cancelShift);
router.get('/dashboard', authorizeRoles('business'), getBusinessDashboard);
router.get('/dashboard/payments', authorizeRoles('business'), getBusinessPayments);
router.get('/payments', authorizeRoles('business'), getBusinessPayments);
router.get('/predict-fill', authorizeRoles('business'), predictNewShiftFill);
router.get('/:id/predict-fill', authorizeRoles('business'), predictShiftFill);

// Templates & Favorites (Business)
router.get('/templates', authorizeRoles('business'), getTemplates);
router.post('/templates', authorizeRoles('business'), createTemplate);
router.get('/favorites', authorizeRoles('business'), getFavorites);
router.post('/favorites', authorizeRoles('business'), addFavorite);
router.get('/:id/ai-matches', authorizeRoles('business'), getShiftAiMatches);

// Worker endpoints
router.get('/nearby', authorizeRoles('worker'), getNearbyShifts);
router.post('/:id/claim', authorizeRoles('worker'), claimShift);
router.post('/:id/forward', authorizeRoles('worker'), forwardShift);

export default router;
