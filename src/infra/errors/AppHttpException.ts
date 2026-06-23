import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCodeEnum } from './ErrorCodeEnum';
import { MultilingualMessage } from './MultilingualMessage';

export interface AppExceptionResponse {
  code: ErrorCodeEnum;
  message: string;
  messages: MultilingualMessage;
}

export class AppHttpException extends HttpException {
  constructor(
    messages: MultilingualMessage,
    status: HttpStatus,
    code: ErrorCodeEnum,
    fallbackMessage?: string,
  ) {
    const response: AppExceptionResponse = {
      code,
      messages,
      message: fallbackMessage ?? messages.en,
    };

    super(response, status);
  }
}

export function isAppExceptionResponse(
  value: unknown,
): value is AppExceptionResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const payload = value as Record<string, unknown>;
  return (
    typeof payload.code === 'string' &&
    typeof payload.message === 'string' &&
    typeof payload.messages === 'object' &&
    payload.messages !== null
  );
}
