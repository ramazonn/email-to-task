import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { resolveLanguage, SupportedLanguage } from '../i18n';
import { RequestWithLanguage } from '../types/RequestWithLanguage';

export const ResolvedLanguage = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SupportedLanguage => {
    const request = ctx.switchToHttp().getRequest<RequestWithLanguage>();
    return request.language ?? resolveLanguage(request.headers['accept-language']);
  },
);
