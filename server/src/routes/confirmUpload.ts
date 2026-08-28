import { Router } from 'express';
import type { Request, Response } from 'express';
import { pdfScanner } from '../services/pdfScanner.js';

export const confirmUploadRouter = Router();

/**
 * POST /api/upload/verify
 * Validates pitch deck binary bytes against magic-byte signature & AST exploit rules
 */
confirmUploadRouter.post('/verify', (req: Request, res: Response): void => {
  const { headerBase64, fileSize } = req.body;

  if (!headerBase64) {
    res.status(400).json({
      type: 'https://ecell.uietkuk.ac.in/errors/missing-file-header',
      title: 'Missing File Header',
      status: 400,
      detail: 'headerBase64 (first 1024 bytes of file in base64) is required for pre-validation.',
    });
    return;
  }

  const scanResult = pdfScanner.scanBase64Slice(headerBase64);

  if (!scanResult.valid) {
    res.status(400).json({
      type: 'https://ecell.uietkuk.ac.in/errors/malicious-file-rejected',
      title: 'Malicious or Invalid File Rejected',
      status: 400,
      detail: scanResult.error || 'The uploaded file failed security validation checks.',
      threats: scanResult.threatsDetected,
    });
    return;
  }

  res.json({
    success: true,
    verified: true,
    fileSize,
    magicHeader: scanResult.magicHeader,
    message: 'Pitch deck header signature verified clean (%PDF-).',
  });
});
