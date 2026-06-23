import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './filters';
import { ResponseInterceptor } from './interceptors';
import { ResponseService } from './services';

@Global()
@Module({
  providers: [
    ResponseService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  exports: [ResponseService],
})
export class CommonModule {}
