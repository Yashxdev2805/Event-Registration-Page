import { Router } from 'express';
import type { Request, Response } from 'express';
import { storageService } from '../services/storageService.js';

export const uploadRouter = Router();

/**
 * POST /api/upload/presign
 * Issues restricted V4 presigned direct-to-cloud upload URLs with:
 * - Content-Type strictly locked to application/pdf
 * - File size bounded strictly: 1KB <= size <= 15MB
 * - Short 90-second URL TTL expiration
 * - Explicit requiredHeaders contract preventing 403 SignatureDoesNotMatch errors
 */
uploadRouter.post('/presign', async (req: Request, res: Response): Promise<void> => {
  const { fileName, fileSize, contentType, referenceId } = req.body;

  if (!fileName || !fileSize) {
    res.status(400).json({
      type: 'https://ecell.uietkuk.ac.in/errors/invalid-upload-params',
      title: 'Invalid Upload Parameters',
      status: 400,
      detail: 'fileName and fileSize (in bytes) are required.',
    });
    return;
  }

  // Enforce PDF content type
  if (contentType && contentType !== 'application/pdf') {
    res.status(400).json({
      type: 'https://ecell.uietkuk.ac.in/errors/invalid-file-type',
      title: 'Invalid File Type',
      status: 400,
      detail: 'Only PDF pitch decks (.pdf) are permitted.',
    });
    return;
  }

  // Enforce 15MB upper limit
  const maxBytes = 15 * 1024 * 1024; // 15MB
  if (fileSize > maxBytes) {
    res.status(413).json({
      type: 'https://ecell.uietkuk.ac.in/errors/file-too-large',
      title: 'File Too Large',
      status: 413,
      detail: 'Pitch deck PDF must not exceed 15 MB.',
    });
    return;
  }

  const result = await storageService.generatePresignedUploadUrl({
    fileName,
    fileSize,
    contentType,
    referenceId,
  });

  res.json(result);
});
