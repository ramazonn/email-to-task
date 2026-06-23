import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { TenantContext } from '../../../common';
import { NotFoundError } from '../../../infra';
import { TaskStatus } from '../../../database';
import { TaskEntity, TaskRepository } from '../../../domain';
import { ListTasksQueryDto, ReviewDecision, ReviewTaskDto } from '../dto';

@Injectable()
export class TaskService {
  constructor(private readonly taskRepository: TaskRepository) {}

  async listTasks(tenant: TenantContext, query: ListTasksQueryDto) {
    const result = await this.taskRepository.listByCompany({
      companyId: tenant.companyId,
      status: query.status,
      page: query.page,
      limit: query.limit,
    });

    return {
      items: result.items.map((task) => this.formatResponse(task)),
      page: query.page,
      limit: query.limit,
      total: result.total,
    };
  }

  async reviewTask(
    tenant: TenantContext,
    taskId: string,
    dto: ReviewTaskDto,
    reviewedBy?: string,
  ) {
    if (!Types.ObjectId.isValid(taskId)) {
      throw new NotFoundError('Task');
    }

    const existing = await this.taskRepository.findByIdForCompany(
      taskId,
      tenant.companyId,
    );

    if (!existing) {
      throw new NotFoundError('Task');
    }

    const status =
      dto.decision === ReviewDecision.ACCEPT
        ? TaskStatus.ACCEPTED
        : TaskStatus.REJECTED;

    const updated = await this.taskRepository.updateReview(
      existing.getId(),
      tenant.companyId,
      status,
      reviewedBy,
    );

    if (!updated) {
      throw new NotFoundError('Task');
    }

    return this.formatResponse(updated);
  }

  private formatResponse(task: TaskEntity) {
    return {
      _id: task.getId(),
      companyId: task.getCompanyId(),
      title: task.getTitle(),
      description: task.getDescription(),
      dueDate: task.getDueDate(),
      assigneeUserId: task.getAssigneeUserId(),
      assigneeEmailRaw: task.getAssigneeEmailRaw(),
      status: task.getStatus(),
      sourceEmailMessageId: task.getSourceEmailMessageId(),
      reviewedAt: task.getReviewedAt(),
      reviewedBy: task.getReviewedBy(),
      createdAt: task.getCreatedAt(),
      updatedAt: task.getUpdatedAt(),
    };
  }
}
