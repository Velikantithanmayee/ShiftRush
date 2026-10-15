import { Response } from 'express';
import { prisma } from '../utils/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getPresignedUploadUrl(req: AuthenticatedRequest, res: Response) {
  const workerId = req.user?.id;
  if (!workerId || req.user?.role !== 'worker') {
    return res.status(403).json({ error: 'Access forbidden: worker credentials required' });
  }

  const { fileName, fileType } = req.body;
  if (!fileName || !fileType) {
    return res.status(400).json({ error: 'fileName and fileType parameters are required' });
  }

  // Simulate signed S3 url generation
  const mockS3Key = `uploads/verification/${workerId}/${Date.now()}_${fileName}`;
  const mockSignedUrl = `https://shiftrush-assets-mock.s3.amazonaws.com/${mockS3Key}?AWSAccessKeyId=mockKey&Expires=3600&Signature=mockSignature`;

  console.log(`[S3Service] Generated pre-signed URL for worker ${workerId} target key: ${mockS3Key}`);

  return res.json({
    uploadUrl: mockSignedUrl,
    fileKey: mockS3Key
  });
}

export async function submitVerificationDoc(req: AuthenticatedRequest, res: Response) {
  const workerId = req.user?.id;
  const { fileKey, skillBadge } = req.body;

  if (!workerId || !fileKey || !skillBadge) {
    return res.status(400).json({ error: 'fileKey and skillBadge are required' });
  }

  try {
    // Add verification log details
    console.log(`[VerificationQueue] Sourcing doc audit check for worker ${workerId}. Skill target: ${skillBadge}`);
    
    // Simulate auto-admin-approval for local testing ease after 2 seconds
    setTimeout(async () => {
      try {
        const worker = await prisma.worker.findUnique({ where: { id: workerId } });
        if (worker) {
          let badges: string[] = [];
          try {
            badges = typeof worker.verifiedBadges === 'string' ? JSON.parse(worker.verifiedBadges) : worker.verifiedBadges;
          } catch {
            badges = [];
          }
          if (!badges.includes(skillBadge)) {
            badges.push(skillBadge);
            await prisma.worker.update({
              where: { id: workerId },
              data: {
                verifiedBadges: JSON.stringify(badges)
              }
            });
            console.log(`[VerificationQueue] Approved badge '${skillBadge}' for worker ${workerId}`);
          }
        }
      } catch (err) {
        console.error('Auto-badge approval callback failed:', err);
      }
    }, 2000);

    return res.json({
      success: true,
      message: 'Verification document submitted successfully. Processing audit check...'
    });
  } catch (error) {
    console.error('Submit verification doc failed:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
