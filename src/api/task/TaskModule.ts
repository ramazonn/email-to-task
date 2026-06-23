import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/DatabaseModule';
import { TenantContextGuard } from '../../common';
import { TaskController } from './controller';
import { TaskService } from './service';

@Module({
  imports: [DatabaseModule],
  controllers: [TaskController],
  providers: [TaskService, TenantContextGuard],
})
export class TaskModule {}
