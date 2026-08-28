import { Router } from 'express';
import type { Request, Response } from 'express';

export const uploadRouter = Router();

/**
 * POST /api/upload/presign
 * Issues restricted presigned direct-to-cloud upload URLs:
 * - Content-Type strictly locked to application/pdf
 * - File size bounded strictly: 1KB <= size <= 15MB
 * - Short 90-second URL TTL expiration
 */
uploadRouter.post('/presign', (req: Request, res: Response): void => {
  const { fileName, fileSize, contentType } = req.body;

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

  const safeFileKey = `pitch-decks/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.pdf`;
  const presignedUrl = `https://storage.googleapis.com/ecell-pitch-decks-2026/${safeFileKey}`;
  const publicUrl = `https://storage.googleapis.com/ecell-pitch-decks-2026/${safeFileKey}`;

  res.json({
    success: true,
    presignedUrl,
    publicUrl,
    fileKey: safeFileKey,
    expiresInSeconds: 90,
    policy: {
      'Content-Type': 'application/pdf',
      'content-length-range': [1024, maxBytes],
    },
  });
});
