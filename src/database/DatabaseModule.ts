import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  COMPANY_MODEL,
  CompanyMongooseSchema,
  EMAIL_MESSAGE_MODEL,
  EmailMessageMongooseSchema,
  TASK_MODEL,
  TaskMongooseSchema,
  USER_MODEL,
  UserMongooseSchema,
} from './models';
import { MongooseConnectionInitializer } from './MongooseConnectionInitializer';
import {
  CompanyRepository,
  EmailMessageRepository,
  TaskRepository,
  UserRepository,
} from '../domain';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: COMPANY_MODEL, schema: CompanyMongooseSchema },
      { name: USER_MODEL, schema: UserMongooseSchema },
      { name: EMAIL_MESSAGE_MODEL, schema: EmailMessageMongooseSchema },
      { name: TASK_MODEL, schema: TaskMongooseSchema },
    ]),
  ],
  providers: [
    MongooseConnectionInitializer,
    CompanyRepository,
    UserRepository,
    EmailMessageRepository,
    TaskRepository,
  ],
  exports: [
    MongooseModule,
    CompanyRepository,
    UserRepository,
    EmailMessageRepository,
    TaskRepository,
  ],
})
export class DatabaseModule {}
