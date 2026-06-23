import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BasicAuthGuard } from '../../common';
import { DatabaseModule } from '../../database/DatabaseModule';
import { EMAIL_PROCESSING_QUEUE } from '../../services';
import { EmailController } from './controller';
import { InboundEmailService } from './service';

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue({ name: EMAIL_PROCESSING_QUEUE }),
  ],
  controllers: [EmailController],
  providers: [InboundEmailService, BasicAuthGuard],
})
export class EmailModule {}
