import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from '../service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check (MongoDB + Redis)' })
  @ApiOkResponse({ description: 'Dependency connectivity status' })
  check() {
    return this.healthService.check();
  }
}
