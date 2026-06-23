import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Types } from 'mongoose';
import { OPERATIONS } from '../../../common/constants/Operations';
import {
  EmailMessageStatus,
  TERMINAL_EMAIL_STATUSES,
} from '../../../database';
import { EmailMessageEntity, EmailMessageRepository } from '../../../domain';
import { OperationOriginEnum } from '../../../infra/operations';
import correlator from '../../../lib/correlator/correlator';
import { logger, OperationReporter } from '../../../lib/logger';
import {
  EMAIL_PROCESSING_QUEUE,
  EmailProcessingJobData,
} from '../constants';
import {
  ContentValidationError,
  LlmRefusalError,
} from '../schema';
import {
  OpenAiService,
  TaskCreationService,
  TenantResolverService,
} from '../service';

@Processor(EMAIL_PROCESSING_QUEUE, { concurrency: 5 })
export class EmailProcessingProcessor extends WorkerHost {
  constructor(
    private readonly emailMessageRepository: EmailMessageRepository,
    private readonly tenantResolverService: TenantResolverService,
    private readonly openAiService: OpenAiService,
    private readonly taskCreationService: TaskCreationService,
  ) {
    super();
  }

  async process(job: Job<EmailProcessingJobData>): Promise<void> {
    return correlator.runWithId(
      job.data.correlationId ?? job.data.emailMessageId,
      () => this.processEmail(job),
    );
  }

  private async processEmail(job: Job<EmailProcessingJobData>): Promise<void> {
    const { emailMessageId, providerMessageId } = job.data;

    OperationReporter.received(OPERATIONS.PROCESS_INBOUND_EMAIL, OperationOriginEnum.WORKER, {
      emailMessageId,
      providerMessageId,
      jobId: job.id,
      attempt: job.attemptsMade + 1,
    });

    const email = await this.emailMessageRepository.getById(
      new Types.ObjectId(emailMessageId),
    );

    if (!email) {
      logger.warn(`EmailMessage ${emailMessageId} not found`);
      OperationReporter.error(OPERATIONS.PROCESS_INBOUND_EMAIL, OperationOriginEnum.WORKER, {
        emailMessageId,
        providerMessageId,
        error: 'EmailMessage not found',
      });
      return;
    }

    if (TERMINAL_EMAIL_STATUSES.has(email.getStatus())) {
      logger.info(
        `EmailMessage ${email.getId().toString()} already terminal (${email.getStatus()}); skipping`,
      );
      OperationReporter.info(OPERATIONS.PROCESS_INBOUND_EMAIL, OperationOriginEnum.WORKER, {
        emailMessageId,
        providerMessageId,
        emailStatus: email.getStatus(),
        skipped: true,
        reason: 'already_terminal',
      });
      return;
    }

    await this.transition(email, EmailMessageStatus.PROCESSING);

    const tenant = await this.tenantResolverService.resolve(email.getTo());
    logger.info(`Tenant resolved: ${tenant?.companyId.toString()}`);
    if (!tenant) {
      await this.transition(email, EmailMessageStatus.UNMATCHED);
      OperationReporter.warning(OPERATIONS.PROCESS_INBOUND_EMAIL, OperationOriginEnum.WORKER, {
        emailMessageId,
        providerMessageId,
        to: email.getTo(),
        emailStatus: EmailMessageStatus.UNMATCHED,
        reason: 'tenant_not_found',
      });
      return;
    }

    await this.emailMessageRepository.updateStatus(email.getId(), EmailMessageStatus.PROCESSING, {
      companyId: tenant.companyId,
      resolvedUserId: tenant.userId,
    });

    try {
      const { extraction, raw } = await this.openAiService.classifyEmail(email);

      await this.emailMessageRepository.updateStatus(email.getId(), EmailMessageStatus.PROCESSING, {
        llmRawResult: raw,
      });

      if (!extraction.isActionable) {
        await this.transition(email, EmailMessageStatus.SKIPPED);
        OperationReporter.success(OPERATIONS.PROCESS_INBOUND_EMAIL, OperationOriginEnum.WORKER, {
          emailMessageId,
          providerMessageId,
          emailStatus: EmailMessageStatus.SKIPPED,
          isActionable: false,
        });
        return;
      }

      const taskId = await this.taskCreationService.createFromExtraction(
        email,
        tenant.companyId,
        extraction,
      );

      OperationReporter.success(OPERATIONS.PROCESS_INBOUND_EMAIL, OperationOriginEnum.WORKER, {
        emailMessageId,
        providerMessageId,
        emailStatus: EmailMessageStatus.ACTIONABLE,
        taskId: taskId.toString(),
        companyId: tenant.companyId.toString(),
      });
    } catch (error) {
      if (this.isContentFailure(error)) {
        const message = error instanceof Error ? error.message : 'Unknown content failure';
        logger.warn(`Content failure for email ${email.getId().toString()}: ${message}`);
        await this.emailMessageRepository.updateStatus(email.getId(), EmailMessageStatus.FAILED, {
          error: message,
        });

        OperationReporter.error(OPERATIONS.PROCESS_INBOUND_EMAIL, OperationOriginEnum.WORKER, {
          emailMessageId,
          providerMessageId,
          emailStatus: EmailMessageStatus.FAILED,
          error: message,
          reason: 'content_failure',
        });
        return;
      }

      OperationReporter.error(OPERATIONS.PROCESS_INBOUND_EMAIL, OperationOriginEnum.WORKER, {
        emailMessageId,
        providerMessageId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<EmailProcessingJobData> | undefined, error: Error): Promise<void> {
    if (!job) {
      return;
    }

    const attempts = job.opts.attempts ?? 1;
    if (job.attemptsMade < attempts) {
      return;
    }

    const email = await this.emailMessageRepository.getById(
      new Types.ObjectId(job.data.emailMessageId),
    );
    if (!email || TERMINAL_EMAIL_STATUSES.has(email.getStatus())) {
      return;
    }

    logger.error(
      `Email processing exhausted retries for ${job.data.emailMessageId}: ${error.message}`,
      { stack: error.stack },
    );

    await this.emailMessageRepository.updateStatus(email.getId(), EmailMessageStatus.FAILED, {
      error: error.message,
    });

    OperationReporter.error(OPERATIONS.PROCESS_INBOUND_EMAIL, OperationOriginEnum.WORKER, {
      emailMessageId: job.data.emailMessageId,
      providerMessageId: job.data.providerMessageId,
      emailStatus: EmailMessageStatus.FAILED,
      error: error.message,
      reason: 'retries_exhausted',
    });
  }

  private async transition(
    email: EmailMessageEntity,
    status: EmailMessageStatus,
  ): Promise<void> {
    logger.info(`EmailMessage ${email.getId().toString()} -> ${status}`);
    await this.emailMessageRepository.updateStatus(email.getId(), status);
  }

  private isContentFailure(error: unknown): boolean {
    return (
      error instanceof ContentValidationError || error instanceof LlmRefusalError
    );
  }
}
