import {
  OperationConditionEnum,
  OperationObject,
  OperationOriginEnum,
} from '../../infra/operations';
import { logger } from './logger';

export class OperationReporter {
  static received(
    name: string,
    origin: OperationOriginEnum,
    meta: Record<string, unknown> = {},
  ): void {
    logger.operation(
      OperationObject.create({
        name,
        origin,
        condition: OperationConditionEnum.RECEIVED_TO_PROCESS,
        meta,
      }),
    );
  }

  static success(
    name: string,
    origin: OperationOriginEnum,
    meta: Record<string, unknown> = {},
  ): void {
    logger.operation(
      OperationObject.create({
        name,
        origin,
        condition: OperationConditionEnum.PROCESSING_COMPLETED_WITH_SUCCESS,
        meta,
      }),
    );
  }

  static error(
    name: string,
    origin: OperationOriginEnum,
    meta: Record<string, unknown> = {},
  ): void {
    logger.operation(
      OperationObject.create({
        name,
        origin,
        condition: OperationConditionEnum.PROCESSING_COMPLETED_WITH_ERROR,
        meta,
      }),
    );
  }

  static warning(
    name: string,
    origin: OperationOriginEnum,
    meta: Record<string, unknown> = {},
  ): void {
    logger.operation(
      OperationObject.create({
        name,
        origin,
        condition: OperationConditionEnum.PROCESSING_COMPLETED_WITH_WARNING,
        meta,
      }),
    );
  }

  static info(
    name: string,
    origin: OperationOriginEnum,
    meta: Record<string, unknown> = {},
  ): void {
    logger.operation(
      OperationObject.create({
        name,
        origin,
        condition: OperationConditionEnum.INFO,
        meta,
      }),
    );
  }
}
