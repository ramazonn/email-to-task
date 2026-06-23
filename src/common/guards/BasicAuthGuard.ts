import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';
import { Request } from 'express';
import {
  INVALID_AUTHORIZATION_CREDENTIALS_MESSAGE,
  INVALID_AUTHORIZATION_HEADER_MESSAGE,
  INVALID_CREDENTIALS_MESSAGE,
  MISSING_AUTHORIZATION_HEADER_MESSAGE,
  UnauthorizedError,
} from '../../infra';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const header = request.headers.authorization;

    if (!header?.startsWith('Basic ')) {
      throw new UnauthorizedError(MISSING_AUTHORIZATION_HEADER_MESSAGE);
    }

    const encoded = header.slice('Basic '.length).trim();
    let decoded: string;

    try {
      decoded = Buffer.from(encoded, 'base64').toString('utf8');
    } catch {
      throw new UnauthorizedError(INVALID_AUTHORIZATION_HEADER_MESSAGE);
    }

    const separatorIndex = decoded.indexOf(':');
    if (separatorIndex === -1) {
      throw new UnauthorizedError(INVALID_AUTHORIZATION_CREDENTIALS_MESSAGE);
    }

    const username = decoded.slice(0, separatorIndex);
    const password = decoded.slice(separatorIndex + 1);

    const expectedUser = this.configService.getOrThrow<string>(
      'WEBHOOK_BASIC_AUTH_USER',
    );
    const expectedPass = this.configService.getOrThrow<string>(
      'WEBHOOK_BASIC_AUTH_PASS',
    );

    const userMatch = this.timingSafeCompare(username, expectedUser);
    const passMatch = this.timingSafeCompare(password, expectedPass);

    if (!userMatch || !passMatch) {
      throw new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE);
    }

    return true;
  }

  private timingSafeCompare(provided: string, expected: string): boolean {
    const providedBuffer = Buffer.from(provided);
    const expectedBuffer = Buffer.from(expected);

    if (providedBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(providedBuffer, expectedBuffer);
  }
}
