import { HttpStatus } from '@nestjs/common';
import { AppHttpException } from './AppHttpException';
import { ErrorCodeEnum } from './ErrorCodeEnum';
import { MultilingualMessage } from './MultilingualMessage';

export class BadRequestError extends AppHttpException {
  constructor(
    messages: MultilingualMessage,
    code: ErrorCodeEnum = ErrorCodeEnum.BAD_REQUEST,
    fallbackMessage?: string,
  ) {
    super(messages, HttpStatus.BAD_REQUEST, code, fallbackMessage);
  }
}
