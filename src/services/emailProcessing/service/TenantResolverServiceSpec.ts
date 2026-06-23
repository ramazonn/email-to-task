import { Types } from 'mongoose';
import { UserRepository } from '../../../domain';
import { TenantResolverService } from './TenantResolverService';

describe('TenantResolverService', () => {
  let findByEmail: jest.Mock;
  let service: TenantResolverService;

  beforeEach(() => {
    findByEmail = jest.fn();
    const userRepository = { findByEmail } as unknown as UserRepository;
    service = new TenantResolverService(userRepository);
  });

  it('returns tenant when user matches recipient email', async () => {
    const companyId = new Types.ObjectId();
    const userId = new Types.ObjectId();

    findByEmail.mockResolvedValue({
      getId: () => userId,
      getCompanyId: () => companyId,
    });

    await expect(service.resolve('alice@acme.example')).resolves.toEqual({
      companyId,
      userId,
    });
  });

  it('returns null when no user matches', async () => {
    findByEmail.mockResolvedValue(null);

    await expect(service.resolve('unknown@example.com')).resolves.toBeNull();
  });
});
