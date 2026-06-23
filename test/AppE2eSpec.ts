import { getQueueToken } from '@nestjs/bullmq';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule } from '@nestjs/throttler';
import { MongoClient, ObjectId } from 'mongodb';
import request from 'supertest';
import { App } from 'supertest/types';
import { validateEnv } from '../src/config';
import { CommonModule } from '../src/common';
import { LanguageMiddleware } from '../src/common/middlewares';
import { DatabaseModule } from '../src/database/DatabaseModule';
import { EmailModule, TaskModule } from '../src/api';
import { EMAIL_PROCESSING_QUEUE } from '../src/services';
import { TaskStatus } from '../src/database';

describe('Email-to-Task API (e2e)', () => {
  let app: INestApplication<App>;
  let mongoClient: MongoClient;
  let queueAdd: jest.Mock;

  let acmeCompanyId: string;
  let globexCompanyId: string;
  let acmeCompanyApiKey: string;

  const dbName = `email_task_e2e_${Date.now()}`;
  const mongoUri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/email-task-pipeline';

  beforeAll(async () => {
    process.env.REDIS_HOST = process.env.REDIS_HOST ?? 'localhost';
    process.env.REDIS_PORT = process.env.REDIS_PORT ?? '6379';
    process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? 'test-key';
    process.env.OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
    process.env.WEBHOOK_BASIC_AUTH_USER = 'webhook';
    process.env.WEBHOOK_BASIC_AUTH_PASS = 'secret';
    process.env.PORT = '3000';
    process.env.MONGODB_URI = `${mongoUri.replace(/\/[^/]*$/, '')}/${dbName}`;

    queueAdd = jest.fn().mockResolvedValue({ id: 'job-1' });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
        MongooseModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            uri: configService.getOrThrow<string>('MONGODB_URI'),
          }),
        }),
        BullModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            connection: {
              host: configService.getOrThrow<string>('REDIS_HOST'),
              port: Number(configService.getOrThrow<string>('REDIS_PORT')),
            },
          }),
        }),
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
        CommonModule,
        DatabaseModule,
        EmailModule,
        TaskModule,
      ],
    })
      .overrideProvider(getQueueToken(EMAIL_PROCESSING_QUEUE))
      .useValue({ add: queueAdd })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.use(LanguageMiddleware);
    await app.init();

    mongoClient = new MongoClient(process.env.MONGODB_URI);
    await mongoClient.connect();
    const db = mongoClient.db();

    const acmeInsert = await db.collection('companies').insertOne({
      name: 'Acme Corp',
      apiKey: 'acme-test-api-key',
    });
    const globexInsert = await db.collection('companies').insertOne({
      name: 'Globex Inc',
      apiKey: 'globex-test-api-key',
    });
    acmeCompanyId = acmeInsert.insertedId.toString();
    globexCompanyId = globexInsert.insertedId.toString();
    acmeCompanyApiKey = 'acme-test-api-key';

    await db.collection('users').insertOne({
      companyId: acmeInsert.insertedId,
      name: 'Alice',
      emails: ['alice@acme.example'],
    });
  });

  afterAll(async () => {
    if (mongoClient) {
      await mongoClient.db().dropDatabase();
      await mongoClient.close();
    }
    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    queueAdd.mockClear();
    const db = mongoClient.db();
    await db.collection('email_messages').deleteMany({});
    await db.collection('tasks').deleteMany({});
  });

  const authHeader = `Basic ${Buffer.from('webhook:secret').toString('base64')}`;

  it('webhook idempotency: duplicate providerMessageId does not re-enqueue', async () => {
    const payload = {
      providerMessageId: 'dup-1',
      from: 'client@example.com',
      to: 'alice@acme.example',
      subject: 'Please follow up',
      text: 'Can you call me tomorrow?',
    };

    const first = await request(app.getHttpServer())
      .post('/email/inbound/webhook')
      .set('Authorization', authHeader)
      .send(payload)
      .expect(202);

    const second = await request(app.getHttpServer())
      .post('/email/inbound/webhook')
      .set('Authorization', authHeader)
      .send(payload)
      .expect(202);

    expect(first.body.data.id).toBe(second.body.data.id);
    expect(first.body.data.status).toBe('queued');
    expect(second.body.data.status).toBe('already_exists');
    expect(second.body.data.message).toContain('already exists');
    expect(first.body.error).toBeNull();
    expect(second.body.error).toBeNull();
    expect(first.body.statusCode).toBe(202);
    expect(second.body.statusCode).toBe(202);

    const count = await mongoClient
      .db()
      .collection('email_messages')
      .countDocuments({ providerMessageId: 'dup-1' });

    expect(count).toBe(1);
    expect(queueAdd).toHaveBeenCalledTimes(1);
  });

  it('GET /tasks returns only the calling tenant tasks', async () => {
    const emailId = new ObjectId();
    const db = mongoClient.db();

    await db.collection('tasks').insertOne({
      companyId: new ObjectId(acmeCompanyId),
      title: 'Acme task',
      description: 'desc',
      status: TaskStatus.PENDING_REVIEW,
      sourceEmailMessageId: emailId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await db.collection('tasks').insertOne({
      companyId: new ObjectId(globexCompanyId),
      title: 'Globex task',
      description: 'desc',
      status: TaskStatus.PENDING_REVIEW,
      sourceEmailMessageId: emailId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app.getHttpServer())
      .get('/tasks')
      .set('x-company-api-key', acmeCompanyApiKey)
      .expect(200);

    expect(response.body.error).toBeNull();
    expect(response.body.statusCode).toBe(200);
    expect(response.body.data.total).toBe(1);
    expect(response.body.data.items[0].title).toBe('Acme task');
  });

  it('POST /tasks/:id/review returns 404 for cross-tenant task id', async () => {
    const emailId = new ObjectId();
    const db = mongoClient.db();

    const globexTask = await db.collection('tasks').insertOne({
      companyId: new ObjectId(globexCompanyId),
      title: 'Globex task',
      description: 'desc',
      status: TaskStatus.PENDING_REVIEW,
      sourceEmailMessageId: emailId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app.getHttpServer())
      .post(`/tasks/${globexTask.insertedId.toString()}/review`)
      .set('Authorization', `Bearer ${acmeCompanyApiKey}`)
      .send({ decision: 'accept' })
      .expect(404);

    expect(response.body.error).toEqual({
      clientMessage: 'Task not found',
      code: 'NOT_FOUND',
    });
    expect(response.body.statusCode).toBe(404);
  });

  it('POST /tasks/:id/review returns localized 404 message for ru', async () => {
    const emailId = new ObjectId();
    const db = mongoClient.db();

    const globexTask = await db.collection('tasks').insertOne({
      companyId: new ObjectId(globexCompanyId),
      title: 'Globex task',
      description: 'desc',
      status: TaskStatus.PENDING_REVIEW,
      sourceEmailMessageId: emailId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app.getHttpServer())
      .post(`/tasks/${globexTask.insertedId.toString()}/review`)
      .set('Authorization', `Bearer ${acmeCompanyApiKey}`)
      .set('Accept-Language', 'ru')
      .send({ decision: 'accept' })
      .expect(404);

    expect(response.body.error.clientMessage).toBe('Task не найден');
  });
});
