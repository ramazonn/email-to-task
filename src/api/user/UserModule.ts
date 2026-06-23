import { Module } from '@nestjs/common';
import { BasicAuthGuard } from '../../common';
import { DatabaseModule } from '../../database/DatabaseModule';
import { UserController } from './controller';
import { UserService } from './service';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [UserService, BasicAuthGuard],
})
export class UserModule {}
