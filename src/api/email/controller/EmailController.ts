import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBasicAuth,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { BasicAuthGuard } from '../../../common';
import { InboundEmailDto } from '../dto';
import { InboundEmailService } from '../service/InboundEmailService';

@ApiTags('email')
@ApiSecurity('basicAuth')
@ApiBasicAuth('basicAuth')
@Controller('email')
export class EmailController {
  constructor(private readonly inboundEmailService: InboundEmailService) {}

  @Post('inbound/webhook')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(BasicAuthGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Receive an inbound email webhook payload' })
  @ApiAcceptedResponse({ description: 'Inbound email accepted for asynchronous processing' })
  inboundWebhook(@Body() dto: InboundEmailDto) {
    return this.inboundEmailService.receiveInbound(dto);
  }
}
