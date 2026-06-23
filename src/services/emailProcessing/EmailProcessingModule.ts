import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DatabaseModule } from '../../database/DatabaseModule';
import { EMAIL_PROCESSING_QUEUE } from './constants';
import { EmailProcessingProcessor } from './processor';
import {
  OpenAiService,
  TaskCreationService,
  TenantResolverService,
} from './service';

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue({ name: EMAIL_PROCESSING_QUEUE }),
  ],
  providers: [
    EmailProcessingProcessor,
    TenantResolverService,
    OpenAiService,
    TaskCreationService,
  ],
})
export class EmailProcessingModule {}
