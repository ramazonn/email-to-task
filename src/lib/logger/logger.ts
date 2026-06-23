import { mkdirSync } from 'fs';
import path from 'path';
import winston, { Logger as WinstonLogger } from 'winston';
import { logConfig } from '../../config/LogConfig';
import { Operation } from '../../infra/operations';
import correlator from '../correlator/correlator';

export interface Logger
  extends Pick<
    WinstonLogger,
    'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly'
  > {
  operation(operation: Operation): void;
}

interface CreateLoggerOptions {
  level?: string;
  getCorrelationId: () => string | undefined;
  noCorrelationIdValue?: string;
}

function ensureLogDirectory(filePath: string): void {
  mkdirSync(path.dirname(filePath), { recursive: true });
}

function createLogger(opts: CreateLoggerOptions): Logger {
  const {
    level = 'info',
    getCorrelationId,
    noCorrelationIdValue = 'NO_CORRELATION_ID',
  } = opts;

  ensureLogDirectory(logConfig.appLogsPath);
  ensureLogDirectory(logConfig.operationLogsPath);

  const attachCorrelationId = winston.format((info) => {
    info.correlationId = getCorrelationId() || noCorrelationIdValue;
    return info;
  });

  const appFormat = winston.format.combine(
    winston.format((info) => {
      if (info.level !== 'operation') {
        return info;
      }
      return false;
    })(),
    attachCorrelationId(),
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  );

  const operationFormat = winston.format.combine(
    winston.format((info) => {
      if (info.level === 'operation') {
        return info;
      }
      return false;
    })(),
    attachCorrelationId(),
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  );

  const devAppPath = path.join(
    path.dirname(logConfig.appLogsPath),
    `dev.${path.basename(logConfig.appLogsPath)}`,
  );

  const devOperationPath = path.join(
    path.dirname(logConfig.operationLogsPath),
    `dev.${path.basename(logConfig.operationLogsPath)}`,
  );

  const transports: winston.transport[] = [
    new winston.transports.File({
      filename: logConfig.appLogsPath,
      format: appFormat,
    }),
    new winston.transports.File({
      filename: logConfig.operationLogsPath,
      level: 'operation',
      format: operationFormat,
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        attachCorrelationId(),
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      filename: devAppPath,
      format: winston.format.combine(
        winston.format((info) => {
          if (info.level !== 'operation') {
            return info;
          }
          return false;
        })(),
        attachCorrelationId(),
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json({ space: 4 }),
      ),
    }),
    new winston.transports.File({
      filename: devOperationPath,
      level: 'operation',
      format: winston.format.combine(
        winston.format((info) => {
          if (info.level === 'operation') {
            return info;
          }
          return false;
        })(),
        attachCorrelationId(),
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json({ space: 4 }),
      ),
    }),
  ];

  if (process.env.NODE_ENV === 'test') {
    transports.splice(0, 4);
  }

  const winstonLogger = winston.createLogger({
    levels: {
      error: 0,
      warn: 1,
      info: 2,
      verbose: 3,
      debug: 4,
      silly: 5,
      operation: 6,
    },
    level,
    transports,
    exitOnError: false,
  });

  const logger = winstonLogger as unknown as Logger;

  logger.operation = (operation: Operation): void => {
    winstonLogger.log('operation', {
      operation: operation.name,
      origin: operation.origin,
      condition: operation.condition,
      meta: operation.meta,
    });
  };

  return logger;
}

const logger = createLogger({
  getCorrelationId: correlator.getId,
});

export { logger };
