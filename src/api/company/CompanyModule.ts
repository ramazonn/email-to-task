import { Module } from '@nestjs/common';
import { BasicAuthGuard } from '../../common';
import { DatabaseModule } from '../../database/DatabaseModule';
import { CompanyController } from './controller';
import { CompanyService } from './service';

@Module({
  imports: [DatabaseModule],
  controllers: [CompanyController],
  providers: [CompanyService, BasicAuthGuard],
})
export class CompanyModule {}
