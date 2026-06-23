import { RequestHandler } from 'express';

const DEFAULT_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000'];

export function createCorsMiddleware(allowedOrigins = DEFAULT_ORIGINS): RequestHandler {
  return (req, res, next) => {
    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    }

    res.setHeader(
      'Access-Control-Allow-Headers',
      'Authorization, Content-Type, x-company-api-key, x-correlation-id',
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  };
}

export const CorsMiddleware = createCorsMiddleware();
