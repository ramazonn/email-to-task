import { Logger } from '@nestjs/common';
import { RequestHandler } from 'express';

const logger = new Logger('MemoryDiagnostics');
const INTERVAL_MS = 60_000;
let interval: NodeJS.Timeout | null = null;

export const MemoryDiagnosticsMiddleware: RequestHandler = (_req, _res, next) => {
  if (!interval) {
    interval = setInterval(() => {
      const memory = process.memoryUsage();
      logger.debug(
        `rss=${memory.rss} heapUsed=${memory.heapUsed} heapTotal=${memory.heapTotal} external=${memory.external}`,
      );
    }, INTERVAL_MS);
    interval.unref();
  }

  next();
};
