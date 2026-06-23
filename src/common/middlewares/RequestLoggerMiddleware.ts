import { RequestHandler } from 'express';
import { logger } from '../../lib/logger';

export const RequestLoggerMiddleware: RequestHandler = (req, res, next) => {
  const startedAt = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    logger.info(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`,
      {
        correlationId: req.headers['x-correlation-id'],
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        durationMs,
      },
    );
  });

  next();
};
