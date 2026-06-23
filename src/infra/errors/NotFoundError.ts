import { HttpStatus } from '@nestjs/common';
import { AppHttpException } from './AppHttpException';
import { ErrorCodeEnum } from './ErrorCodeEnum';

export class NotFoundError extends AppHttpException {
  constructor(
    target: string,
    code: ErrorCodeEnum = ErrorCodeEnum.NOT_FOUND,
    message?: string,
  ) {
    super(
      {
        en: message ?? `${target} not found`,
        ru: `${target} не найден`,
        uz: `${target} topilmadi`,
      },
      HttpStatus.NOT_FOUND,
      code,
      message ?? `${target} not found`,
    );
  }
}
