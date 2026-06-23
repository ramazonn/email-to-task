import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantContext } from '../types';

export const ResolvedTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TenantContext => {
    const request = ctx.switchToHttp().getRequest<{ tenant: TenantContext }>();
    return request.tenant;
  },
);
