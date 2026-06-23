import { HttpStatus } from '@nestjs/common';
import { AppHttpException } from './AppHttpException';
import { ErrorCodeEnum } from './ErrorCodeEnum';
import { MultilingualMessage } from './MultilingualMessage';

export class ConflictError extends AppHttpException {
  constructor(
    messages: MultilingualMessage,
    code: ErrorCodeEnum = ErrorCodeEnum.CONFLICT,
    fallbackMessage?: string,
  ) {
    super(messages, HttpStatus.CONFLICT, code, fallbackMessage);
  }
}
