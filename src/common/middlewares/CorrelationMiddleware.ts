import { randomUUID } from 'crypto';
import { RequestHandler } from 'express';
import correlator from '../../lib/correlator/correlator';

export const CorrelationMiddleware: RequestHandler = (req, res, next) => {
  try {
    correlator.bindEmitter(req);
    correlator.bindEmitter(res);
    correlator.bindEmitter(req.socket);

    const incoming = req.headers['x-correlation-id'];
    const correlationId =
      typeof incoming === 'string' && incoming.length > 0
        ? incoming
        : randomUUID();

    req.headers['x-correlation-id'] = correlationId;

    correlator.withId(() => {
      res.setHeader('x-correlation-id', correlator.getId() ?? correlationId);
      next();
    }, correlationId);
  } catch {
    res.sendStatus(500);
  }
};
