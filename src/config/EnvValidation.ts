import { plainToInstance } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  validateSync,
  ValidateIf,
} from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  @IsOptional()
  NODE_ENV: string = 'development';

  @IsString()
  @IsOptional()
  HOST: string = '0.0.0.0';

  @IsString()
  @IsNotEmpty()
  MONGODB_URI!: string;

  @IsString()
  @IsNotEmpty()
  REDIS_HOST!: string;

  @IsNumberString()
  @IsNotEmpty()
  REDIS_PORT!: string;

  @IsString()
  @IsNotEmpty()
  OPENAI_API_KEY!: string;

  @IsString()
  @IsNotEmpty()
  OPENAI_MODEL!: string;

  @IsString()
  @IsNotEmpty()
  WEBHOOK_BASIC_AUTH_USER!: string;

  @IsString()
  @IsNotEmpty()
  WEBHOOK_BASIC_AUTH_PASS!: string;

  @IsNumberString()
  @IsNotEmpty()
  PORT!: string;

  @IsString()
  @IsOptional()
  APP_LOGS_PATH: string = 'logs/app.log';

  @IsString()
  @IsOptional()
  OPERATION_LOGS_PATH: string = 'logs/operation.log';

  @ValidateIf((env: EnvironmentVariables) => env.NODE_ENV === 'production')
  @IsString()
  @IsNotEmpty()
  SWAGGER_USERNAME?: string;

  @ValidateIf((env: EnvironmentVariables) => env.NODE_ENV === 'production')
  @IsString()
  @IsNotEmpty()
  SWAGGER_PASSWORD?: string;
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    const messages = errors
      .flatMap((error) => Object.values(error.constraints ?? {}))
      .join('; ');
    throw new Error(`Environment validation failed: ${messages}`);
  }

  return validated;
}
