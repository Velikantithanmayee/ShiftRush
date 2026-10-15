import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { 
  getReliabilityBreakdown, 
  getWorkerPayments, 
  getWorkerEarnings, 
  updateWorkerAvailability 
} from '../controllers/workerController.js';
import { getPresignedUploadUrl, submitVerificationDoc } from '../controllers/uploadController.js';

const router = Router();

router.use(authenticateToken);
router.get('/me/reliability-breakdown', authorizeRoles('worker'), getReliabilityBreakdown);
router.get('/me/payments', authorizeRoles('worker'), getWorkerPayments);
router.get('/payments', authorizeRoles('worker'), getWorkerPayments);
router.get('/me/earnings', authorizeRoles('worker'), getWorkerEarnings);
router.patch('/me/availability', authorizeRoles('worker'), updateWorkerAvailability);
router.post('/presigned-url', authorizeRoles('worker'), getPresignedUploadUrl);
router.post('/verify-badge', authorizeRoles('worker'), submitVerificationDoc);

export default router;
