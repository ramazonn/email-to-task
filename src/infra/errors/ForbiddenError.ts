import { HttpStatus } from '@nestjs/common';
import { AppHttpException } from './AppHttpException';
import { ErrorCodeEnum } from './ErrorCodeEnum';
import { MultilingualMessage } from './MultilingualMessage';

export class ForbiddenError extends AppHttpException {
  constructor(
    messages: MultilingualMessage,
    code: ErrorCodeEnum = ErrorCodeEnum.FORBIDDEN,
    fallbackMessage?: string,
  ) {
    super(messages, HttpStatus.FORBIDDEN, code, fallbackMessage);
  }
}
