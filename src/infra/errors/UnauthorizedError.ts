import { HttpStatus } from '@nestjs/common';
import { AppHttpException } from './AppHttpException';
import { ErrorCodeEnum } from './ErrorCodeEnum';
import { MultilingualMessage } from './MultilingualMessage';

export class UnauthorizedError extends AppHttpException {
  constructor(
    messages: MultilingualMessage,
    code: ErrorCodeEnum = ErrorCodeEnum.UNAUTHORIZED,
    fallbackMessage?: string,
  ) {
    super(messages, HttpStatus.UNAUTHORIZED, code, fallbackMessage);
  }
}
