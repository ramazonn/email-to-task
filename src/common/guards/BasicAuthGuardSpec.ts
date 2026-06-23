import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedError } from '../../infra';
import { BasicAuthGuard } from './BasicAuthGuard';

describe('BasicAuthGuard', () => {
  const configService = {
    getOrThrow: jest.fn((key: string) => {
      if (key === 'WEBHOOK_BASIC_AUTH_USER') return 'webhook';
      if (key === 'WEBHOOK_BASIC_AUTH_PASS') return 'secret';
      throw new Error(`Missing ${key}`);
    }),
  } as unknown as ConfigService;

  const guard = new BasicAuthGuard(configService);

  const createContext = (authorization?: string): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization } }),
      }),
    }) as ExecutionContext;

  it('allows valid credentials', () => {
    const token = Buffer.from('webhook:secret').toString('base64');
    expect(guard.canActivate(createContext(`Basic ${token}`))).toBe(true);
  });

  it('rejects missing header', () => {
    expect(() => guard.canActivate(createContext())).toThrow(UnauthorizedError);
  });

  it('rejects invalid credentials', () => {
    const token = Buffer.from('webhook:wrong').toString('base64');
    expect(() => guard.canActivate(createContext(`Basic ${token}`))).toThrow(
      UnauthorizedError,
    );
  });
});
