import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import express from 'express';
import helmet from 'helmet';
import { AppModule } from './AppModule';
import { OPERATIONS } from './common/constants/Operations';
import {
  CorrelationMiddleware,
  CorsMiddleware,
  LanguageMiddleware,
  MemoryDiagnosticsMiddleware,
  ModernMiddleware,
  RequestLoggerMiddleware,
} from './common/middlewares';
import { setupSwagger } from './config/SwaggerConfig';
import { OperationOriginEnum } from './infra/operations';
import { logger, OperationReporter } from './lib/logger';

export class Application {
  private _mongoUrl?: string;
  private _host = '0.0.0.0';
  private _port = 8000;

  private app?: NestExpressApplication;

  buildHost(host: string): Application {
    this._host = host;
    return this;
  }

  buildPort(port: number): Application {
    this._port = port;
    return this;
  }

  buildUri(mongoUrl: string): Application {
    this._mongoUrl = mongoUrl;
    return this;
  }

  async createNestApp(): Promise<NestExpressApplication> {
    if (!this.app) {
      this.app = await NestFactory.create<NestExpressApplication>(AppModule, {
        bodyParser: false,
      });
    }

    return this.app;
  }

  buildSwagger(): Application {
    if (!this.app) {
      throw new Error('Call createNestApp() before buildSwagger()');
    }

    const configService = this.app.get(ConfigService);
    setupSwagger(this.app, {
      nodeEnv: configService.get<string>('NODE_ENV', 'development'),
      swaggerUsername: configService.get<string>('SWAGGER_USERNAME'),
      swaggerPassword: configService.get<string>('SWAGGER_PASSWORD'),
    });

    return this;
  }

  configureMiddlewares(): Application {
    if (!this.app) {
      throw new Error('Call createNestApp() before configureMiddlewares()');
    }

    this.app.set('trust proxy', true);
    this.app.use(RequestLoggerMiddleware);
    this.app.use(LanguageMiddleware);
    this.app.use(CorrelationMiddleware);
    this.app.use(MemoryDiagnosticsMiddleware);
    this.app.use(CorsMiddleware);
    this.app.use(ModernMiddleware);
    this.app.use(helmet());
    this.app.use(express.json({ limit: '256kb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '256kb' }));

    this.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    return this;
  }

  async startServer(): Promise<Application> {
    if (!this.app) {
      throw new Error('Call createNestApp() before startServer()');
    }

    await this.app.listen(this._port, this._host);

    logger.info(`Server listening on ${this._host}:${this._port}`);
    OperationReporter.success(OPERATIONS.APPLICATION_START, OperationOriginEnum.UTIL, {
      host: this._host,
      port: this._port,
      nodeEnv: process.env.NODE_ENV ?? 'development',
    });

    return this;
  }

  connectMongo(): Application {
    if (this._mongoUrl) {
      process.env.MONGODB_URI = this._mongoUrl;
    }

    return this;
  }

  getNestApp(): NestExpressApplication {
    if (!this.app) {
      throw new Error('Nest application has not been created');
    }

    return this.app;
  }
}

export async function bootstrapApplication(): Promise<Application> {
  const application = new Application();

  application
    .buildHost(process.env.HOST ?? '0.0.0.0')
    .buildPort(Number(process.env.PORT ?? '8000'))
    .connectMongo();

  await application.createNestApp();
  application.configureMiddlewares().buildSwagger();
  await application.startServer();

  return application;
}
