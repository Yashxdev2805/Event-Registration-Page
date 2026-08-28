import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  errors?: Record<string, string>;
  invalidParams?: Array<{ name: string; reason: string }>;
}

export function errorHandler() {
  return (err: any, req: Request, res: Response, _next: NextFunction): void => {
    // 1. Zod Validation Error (RFC 7807 422 Unprocessable Entity)
    if (err instanceof ZodError) {
      const fieldErrors: Record<string, string> = {};
      const invalidParams = err.issues.map((issue) => {
        const path = issue.path.join('.');
        fieldErrors[path] = issue.message;
        return {
          name: path,
          reason: issue.message,
        };
      });

      res.status(422).json({
        type: 'https://ecell.uietkuk.ac.in/errors/validation-error',
        title: 'Validation Failed',
        status: 422,
        detail: 'The provided registration data failed validation requirements.',
        instance: req.originalUrl,
        errors: fieldErrors,
        invalidParams,
      });
      return;
    }

    // 2. Syntax / JSON Parse Error
    if (err instanceof SyntaxError && 'body' in err) {
      res.status(400).json({
        type: 'https://ecell.uietkuk.ac.in/errors/invalid-json',
        title: 'Malformed JSON Payload',
        status: 400,
        detail: 'The request body could not be parsed as valid JSON.',
        instance: req.originalUrl,
      });
      return;
    }

    // 3. Payload Too Large
    if (err.type === 'entity.too.large') {
      res.status(413).json({
        type: 'https://ecell.uietkuk.ac.in/errors/payload-too-large',
        title: 'Payload Too Large',
        status: 413,
        detail: 'Request body exceeds the maximum permitted 16KB size limit.',
        instance: req.originalUrl,
      });
      return;
    }

    // 4. Default 500 Internal Server Error
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(500).json({
      type: 'https://ecell.uietkuk.ac.in/errors/internal-error',
      title: 'Internal Server Error',
      status: 500,
      detail: isProduction
        ? 'An unexpected error occurred while processing the request.'
        : err.message || 'Internal error',
      instance: req.originalUrl,
    });
  };
}
