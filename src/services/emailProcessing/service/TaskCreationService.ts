import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { OPERATIONS } from '../../../common/constants/Operations';
import { EmailMessageStatus } from '../../../database';
import {
  EmailMessageEntity,
  EmailMessageRepository,
  TaskEntity,
  TaskRepository,
  UserRepository,
} from '../../../domain';
import { OperationOriginEnum } from '../../../infra/operations';
import { logger, OperationReporter } from '../../../lib/logger';
import { ExtractionResult } from '../schema';

@Injectable()
export class TaskCreationService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly userRepository: UserRepository,
    private readonly emailMessageRepository: EmailMessageRepository,
  ) { }

  async createFromExtraction(
    email: EmailMessageEntity,
    companyId: Types.ObjectId,
    extraction: ExtractionResult,
  ): Promise<Types.ObjectId> {
    const emailMessageId = email.getId().toString();
    const providerMessageId = email.getProviderMessageId();

    OperationReporter.received(OPERATIONS.CREATE_TASK_FROM_EMAIL, OperationOriginEnum.SERVICE, {
      emailMessageId,
      providerMessageId,
      companyId: companyId.toString(),
      isActionable: extraction.isActionable,
    });

    const existingTask = await this.taskRepository.findBySourceEmailMessageId(
      companyId,
      email.getId(),
    );
    if (existingTask) {
      OperationReporter.info(OPERATIONS.CREATE_TASK_FROM_EMAIL, OperationOriginEnum.SERVICE, {
        emailMessageId,
        providerMessageId,
        taskId: existingTask.getId().toString(),
        reason: 'task_already_exists_for_email',
      });
      return existingTask.getId();
    }

    const title =
      extraction.title?.trim() ||
      email.getSubject()?.trim() ||
      'Untitled task';
    const description =
      extraction.description?.trim() || email.getText().slice(0, 500).trim();

    let dueDate: Date | undefined;
    if (extraction.dueDate) {
      const parsed = new Date(extraction.dueDate);
      if (!Number.isNaN(parsed.getTime())) {
        dueDate = parsed;
      }
    }

    let assigneeUserId: Types.ObjectId | undefined;
    let assigneeEmailRaw: string | undefined;

    if (extraction.assigneeEmail) {
      const normalizedEmail = extraction.assigneeEmail.toLowerCase().trim();
      assigneeEmailRaw = normalizedEmail;

      const assignee = await this.userRepository.findByEmailInCompany(
        normalizedEmail,
        companyId,
      );

      if (assignee) {
        assigneeUserId = assignee.getId();
      } else {
        logger.warn(
          `Assignee email ${normalizedEmail} not found in company ${companyId.toString()}`,
        );
        OperationReporter.warning(
          OPERATIONS.CREATE_TASK_FROM_EMAIL,
          OperationOriginEnum.SERVICE,
          {
            emailMessageId,
            providerMessageId,
            assigneeEmail: normalizedEmail,
            reason: 'assignee_not_found_in_company',
          },
        );
      }
    }

    const taskEntity = new TaskEntity()
      .buildCompanyId(companyId)
      .buildTitle(title)
      .buildDescription(description)
      .buildDueDate(dueDate)
      .buildAssigneeUserId(assigneeUserId)
      .buildAssigneeEmailRaw(assigneeEmailRaw)
      .buildSourceEmailMessageId(email.getId());

    const task = await this.taskRepository.create(taskEntity);

    await this.emailMessageRepository.updateStatus(
      email.getId(),
      EmailMessageStatus.ACTIONABLE,
      { taskId: task.getId() },
    );

    OperationReporter.success(OPERATIONS.CREATE_TASK_FROM_EMAIL, OperationOriginEnum.SERVICE, {
      emailMessageId,
      providerMessageId,
      taskId: task.getId().toString(),
      companyId: companyId.toString(),
      title,
    });

    return task.getId();
  }
}
