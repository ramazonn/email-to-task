import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import basicAuth from 'express-basic-auth';
import { AppModule } from '../AppModule';

const SWAGGER_TITLE = 'Email-to-Task API';
const SWAGGER_DESCRIPTION = [
  'API for ingesting emails and managing tenant-scoped tasks.',
  '',
  '**Authorize once (top right):**',
  '1. `basicAuth` — WEBHOOK_BASIC_AUTH_USER / WEBHOOK_BASIC_AUTH_PASS (webhook, companies, users)',
  '2. `tenantCompanyApiKey` — company apiKey from seed (`company-1-api-key-test` for Company 1)',
].join('\n');
const SWAGGER_VERSION = '1.0.0';
const SWAGGER_ROUTE = 'docs';
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const SWAGGER_FILE = path.join(PUBLIC_DIR, 'swagger.json');

export function createSwaggerDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle(SWAGGER_TITLE)
    .setDescription(SWAGGER_DESCRIPTION)
    .setVersion(SWAGGER_VERSION)
    .addBasicAuth(
      {
        type: 'http',
        scheme: 'basic',
        description: 'Admin/webhook basic auth (WEBHOOK_BASIC_AUTH_USER/PASS)',
      },
      'basicAuth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'x-company-api-key',
        description: 'Tenant company API key (e.g. company-1-api-key-test after seed)',
      },
      'tenantCompanyApiKey',
    )
    .build();

  return SwaggerModule.createDocument(app, config);
}

export function dumpSwaggerJson(document: OpenAPIObject): string {
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  fs.writeFileSync(SWAGGER_FILE, JSON.stringify(document, null, 2), 'utf8');
  return SWAGGER_FILE;
}

export function setupSwagger(
  app: INestApplication,
  options: {
    nodeEnv: string;
    swaggerUsername?: string;
    swaggerPassword?: string;
  },
): OpenAPIObject {
  const document = createSwaggerDocument(app);
  dumpSwaggerJson(document);

  if (options.nodeEnv === 'production') {
    if (!options.swaggerUsername || !options.swaggerPassword) {
      throw new Error(
        'SWAGGER_USERNAME and SWAGGER_PASSWORD are required in production',
      );
    }

    app.use(
      [`/${SWAGGER_ROUTE}`, `/${SWAGGER_ROUTE}-json`],
      basicAuth({
        users: { [options.swaggerUsername]: options.swaggerPassword },
        challenge: true,
      }),
    );
  }

  SwaggerModule.setup(SWAGGER_ROUTE, app, document, {
    jsonDocumentUrl: `${SWAGGER_ROUTE}-json`,
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  return document;
}

export async function buildSwaggerFile(): Promise<string> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: false,
    bodyParser: false,
  });

  const document = createSwaggerDocument(app);
  const filePath = dumpSwaggerJson(document);
  await app.close();
  return filePath;
}

export { SWAGGER_FILE, SWAGGER_ROUTE };
