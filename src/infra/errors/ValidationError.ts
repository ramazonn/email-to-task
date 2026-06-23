import { HttpStatus } from '@nestjs/common';
import { AppHttpException } from './AppHttpException';
import { ErrorCodeEnum } from './ErrorCodeEnum';
import { MultilingualMessage } from './MultilingualMessage';

export class ValidationError extends AppHttpException {
  constructor(
    messages: MultilingualMessage,
    code: ErrorCodeEnum = ErrorCodeEnum.VALIDATION_ERROR,
    fallbackMessage?: string,
  ) {
    super(messages, HttpStatus.BAD_REQUEST, code, fallbackMessage);
  }
}
