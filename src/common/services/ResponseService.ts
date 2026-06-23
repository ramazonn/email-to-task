import { Injectable } from '@nestjs/common';
import {
  ErrorCodeEnum,
  HTTP_STATUS_TO_ERROR_CODE,
  isAppExceptionResponse,
  isMultilingualMessage,
  UNEXPECTED_ERROR_MESSAGE,
} from '../../infra';
import { resolveMessage, SupportedLanguage } from '../i18n';
import {
  ApiErrorPayload,
  ApiErrorResponse,
  ApiSuccessResponse,
} from '../types';

@Injectable()
export class ResponseService {
  success<T extends Record<string, unknown>>(
    data: T,
    statusCode = 200,
  ): ApiSuccessResponse<T> {
    return {
      error: null,
      statusCode,
      data,
    };
  }

  error(
    clientMessage: string,
    code: ErrorCodeEnum | string,
    statusCode: number,
  ): ApiErrorResponse {
    return {
      error: {
        clientMessage,
        code,
      },
      statusCode,
    };
  }

  isApiEnvelope(data: unknown): boolean {
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    const payload = data as Record<string, unknown>;
    return 'statusCode' in payload && 'error' in payload && 'data' in payload;
  }

  toErrorPayload(
    message: unknown,
    statusCode: number,
    language: SupportedLanguage = SupportedLanguage.EN,
  ): ApiErrorPayload {
    return {
      clientMessage: this.extractClientMessage(message, language),
      code: this.resolveErrorCode(message, statusCode),
    };
  }

  private extractClientMessage(
    message: unknown,
    language: SupportedLanguage,
  ): string {
    if (typeof message === 'string') {
      return message;
    }

    if (typeof message === 'object' && message !== null) {
      const payload = message as Record<string, unknown>;

      if (isAppExceptionResponse(payload)) {
        return resolveMessage(payload.messages, language);
      }

      if (isMultilingualMessage(payload.messages)) {
        return resolveMessage(payload.messages, language);
      }

      if (typeof payload.message === 'string') {
        return payload.message;
      }

      if (Array.isArray(payload.message)) {
        return payload.message.map(String).join(', ');
      }

      if (typeof payload.error === 'string') {
        return payload.error;
      }
    }

    return resolveMessage(UNEXPECTED_ERROR_MESSAGE, language);
  }

  private resolveErrorCode(message: unknown, statusCode: number): string {
    if (typeof message === 'object' && message !== null) {
      const payload = message as Record<string, unknown>;
      if (typeof payload.code === 'string') {
        return payload.code;
      }
    }

    if (statusCode === 400 && this.hasValidationMessages(message)) {
      return ErrorCodeEnum.VALIDATION_ERROR;
    }

    return HTTP_STATUS_TO_ERROR_CODE[statusCode] ?? ErrorCodeEnum.INTERNAL_SERVER_ERROR;
  }

  private hasValidationMessages(message: unknown): boolean {
    return (
      typeof message === 'object' &&
      message !== null &&
      Array.isArray((message as Record<string, unknown>).message)
    );
  }
}
