export enum OperationOriginEnum {
  WORKER = 'WORKER',
  CONTROLLER = 'CONTROLLER',
  SERVICE = 'SERVICE',
  REPO = 'REPO',
  UNKNOWN = 'UNKNOWN',
  UTIL = 'UTIL',
  EXTERNAL = 'EXTERNAL',
}

export enum OperationConditionEnum {
  RECEIVED_TO_PROCESS = 'RECEIVED_TO_PROCESS',
  PROCESSING_COMPLETED_WITH_ERROR = 'PROCESSING_COMPLETED_WITH_ERROR',
  PROCESSING_COMPLETED_WITH_SUCCESS = 'PROCESSING_COMPLETED_WITH_SUCCESS',
  PROCESSING_COMPLETED_WITH_WARNING = 'PROCESSING_COMPLETED_WITH_WARNING',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

export interface Operation {
  name: string;
  origin: OperationOriginEnum;
  condition: OperationConditionEnum;
  meta: unknown;
}

export interface OperationParams {
  name: string;
  origin: OperationOriginEnum;
  condition: OperationConditionEnum;
  meta: unknown;
}

export class OperationObject implements Operation {
  public readonly name: string;
  public readonly origin: OperationOriginEnum;
  public readonly condition: OperationConditionEnum;
  public readonly meta: unknown;

  private constructor(
    name: string,
    origin: OperationOriginEnum,
    condition: OperationConditionEnum,
    meta: unknown,
  ) {
    this.name = name;
    this.origin = origin;
    this.condition = condition;
    this.meta = meta;
  }

  static create(params: OperationParams): OperationObject {
    return new OperationObject(
      params.name,
      params.origin,
      params.condition,
      params.meta,
    );
  }
}
