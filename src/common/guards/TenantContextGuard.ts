import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import {
  BadRequestError,
  MISSING_COMPANY_API_KEY_HEADER_MESSAGE,
  NotFoundError,
} from '../../infra';
import { CompanyRepository } from '../../domain';
import { TenantContext } from '../types';

@Injectable()
export class TenantContextGuard implements CanActivate {
  constructor(private readonly companyRepository: CompanyRepository) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      tenant?: TenantContext;
    }>();

    const rawCompanyApiKey = request.headers['x-company-api-key'];
    const companyApiKey = Array.isArray(rawCompanyApiKey)
      ? rawCompanyApiKey[0]
      : rawCompanyApiKey;

    if (!companyApiKey?.trim()) {
      throw new BadRequestError(MISSING_COMPANY_API_KEY_HEADER_MESSAGE);
    }

    const company = await this.companyRepository.findByApiKey(companyApiKey.trim());
    if (!company) {
      throw new NotFoundError('Company');
    }

    request.tenant = { companyId: company.getId() };
    return true;
  }
}
