import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import {
  ResolvedTenant,
  TenantContext,
  TenantContextGuard,
} from '../../../common';
import { ListTasksQueryDto, ReviewTaskDto } from '../dto';
import { TaskService } from '../service';

@ApiTags('tasks')
@ApiSecurity('tenantCompanyApiKey')
@Controller('tasks')
@UseGuards(TenantContextGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @ApiOperation({ summary: 'List tasks for the calling tenant' })
  @ApiOkResponse({ description: 'Paginated tenant task list' })
  listTasks(
    @ResolvedTenant() tenant: TenantContext,
    @Query() query: ListTasksQueryDto,
  ) {
    return this.taskService.listTasks(tenant, query);
  }

  @Post(':id/review')
  @ApiOperation({ summary: 'Accept or reject a pending task' })
  @ApiOkResponse({ description: 'Updated task' })
  reviewTask(
    @ResolvedTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() dto: ReviewTaskDto,
  ) {
    return this.taskService.reviewTask(tenant, id, dto);
  }
}
