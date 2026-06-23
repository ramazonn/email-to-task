import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { OPERATIONS } from '../../../common/constants/Operations';
import { UserRepository } from '../../../domain';
import { OperationOriginEnum } from '../../../infra/operations';
import { OperationReporter } from '../../../lib/logger';

export interface TenantResolution {
  companyId: Types.ObjectId;
  userId: Types.ObjectId;
}

@Injectable()
export class TenantResolverService {
  constructor(private readonly userRepository: UserRepository) { }

  async resolve(recipientEmail: string): Promise<TenantResolution | null> {
    OperationReporter.received(OPERATIONS.RESOLVE_TENANT, OperationOriginEnum.SERVICE, {
      recipientEmail,
    });

    const user = await this.userRepository.findByEmail(recipientEmail);
    if (!user) {
      OperationReporter.warning(OPERATIONS.RESOLVE_TENANT, OperationOriginEnum.SERVICE, {
        recipientEmail,
        matched: false,
      });
      return null;
    }

    const resolution = {
      companyId: user.getCompanyId(),
      userId: user.getId(),
    };

    OperationReporter.success(OPERATIONS.RESOLVE_TENANT, OperationOriginEnum.SERVICE, {
      recipientEmail,
      matched: true,
      companyId: resolution.companyId.toString(),
      userId: resolution.userId.toString(),
    });

    return resolution;
  }
}
