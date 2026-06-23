import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { INTERNAL_SERVER_ERROR_MESSAGE } from '../../infra';
import { resolveMessage, SupportedLanguage } from '../i18n';
import { ResponseService } from '../services';
import { RequestWithLanguage } from '../types';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  private readonly responseService = new ResponseService();

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithLanguage>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : resolveMessage(INTERNAL_SERVER_ERROR_MESSAGE, this.resolveRequestLanguage(request));

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const language = this.resolveRequestLanguage(request);
    const errorPayload = this.responseService.toErrorPayload(
      message,
      status,
      language,
    );

    response.status(status).json(
      this.responseService.error(
        errorPayload.clientMessage,
        errorPayload.code,
        status,
      ),
    );
  }

  private resolveRequestLanguage(request: RequestWithLanguage): SupportedLanguage {
    return request.language ?? SupportedLanguage.EN;
  }
}
