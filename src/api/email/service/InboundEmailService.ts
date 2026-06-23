import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { MongoServerError } from 'mongodb';
import { OPERATIONS } from '../../../common/constants/Operations';
import { EmailMessageStatus } from '../../../database';
import { EmailMessageEntity, EmailMessageRepository } from '../../../domain';
import { OperationOriginEnum } from '../../../infra/operations';
import correlator from '../../../lib/correlator/correlator';
import { logger, OperationReporter } from '../../../lib/logger';
import {
  EMAIL_PROCESSING_QUEUE,
  EmailProcessingJobData,
  toEmailProcessingJobId,
} from '../../../services';
import { InboundEmailDto, InboundEmailResult } from '../dto';

@Injectable()
export class InboundEmailService {
  constructor(
    private readonly emailMessageRepository: EmailMessageRepository,
    @InjectQueue(EMAIL_PROCESSING_QUEUE)
    private readonly emailProcessingQueue: Queue<EmailProcessingJobData>,
  ) { }

  async receiveInbound(dto: InboundEmailDto): Promise<InboundEmailResult> {
    try {
      return await this.processInbound(dto);
    } catch (error) {
      logger.error(
        `Unexpected error processing inbound email providerMessageId=${dto.providerMessageId}`,
        {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
      );

      OperationReporter.error(OPERATIONS.RECEIVE_INBOUND_EMAIL, OperationOriginEnum.SERVICE, {
        providerMessageId: dto.providerMessageId,
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        id: null,
        status: 'internal_error',
        message: 'An unexpected error occurred while processing the inbound email.',
      };
    }
  }

  private async processInbound(dto: InboundEmailDto): Promise<InboundEmailResult> {
    OperationReporter.received(OPERATIONS.RECEIVE_INBOUND_EMAIL, OperationOriginEnum.SERVICE, {
      providerMessageId: dto.providerMessageId,
      from: dto.from,
      to: dto.to,
    });

    const existing = await this.emailMessageRepository.findByProviderMessageId(
      dto.providerMessageId,
    );

    if (existing) {
      logger.warn(
        `Inbound email already exists for providerMessageId=${dto.providerMessageId}; skipping persist and enqueue`,
      );

      const result: InboundEmailResult = {
        id: existing.getId().toString(),
        status: 'already_exists',
        message:
          'Inbound email with this providerMessageId already exists; no action taken.',
      };

      OperationReporter.warning(OPERATIONS.RECEIVE_INBOUND_EMAIL, OperationOriginEnum.SERVICE, {
        providerMessageId: dto.providerMessageId,
        emailMessageId: existing.getId().toString(),
        result,
      });

      return result;
    }

    const receivedAt = dto.receivedAt ? new Date(dto.receivedAt) : new Date();

    let emailMessage: EmailMessageEntity;

    try {
      emailMessage = await this.emailMessageRepository.create(
        new EmailMessageEntity()
          .buildProviderMessageId(dto.providerMessageId)
          .buildFrom(dto.from)
          .buildTo(dto.to.toLowerCase())
          .buildSubject(dto.subject)
          .buildText(dto.text)
          .buildHtml(dto.html)
          .buildReceivedAt(receivedAt),
      );
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        const raced = await this.emailMessageRepository.findByProviderMessageId(
          dto.providerMessageId,
        );

        if (raced) {
          logger.warn(
            `Concurrent duplicate providerMessageId=${dto.providerMessageId}; returning existing record`,
          );

          const result: InboundEmailResult = {
            id: raced.getId().toString(),
            status: 'race_condition',
            message:
              'Concurrent request detected for the same providerMessageId; existing record returned without re-enqueue.',
          };

          OperationReporter.warning(OPERATIONS.RECEIVE_INBOUND_EMAIL, OperationOriginEnum.SERVICE, {
            providerMessageId: dto.providerMessageId,
            emailMessageId: raced.getId().toString(),
            raceCondition: true,
            result,
          });

          return result;
        }
      }

      logger.error(
        `Failed to persist inbound email providerMessageId=${dto.providerMessageId}`,
        {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
      );

      OperationReporter.error(OPERATIONS.RECEIVE_INBOUND_EMAIL, OperationOriginEnum.SERVICE, {
        providerMessageId: dto.providerMessageId,
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        id: null,
        status: 'internal_error',
        message: 'Failed to persist inbound email.',
      };
    }

    try {
      await this.enqueueInboundProcessing(
        emailMessage.getId().toString(),
        dto.providerMessageId,
      );

      await this.emailMessageRepository.updateStatus(
        emailMessage.getId(),
        EmailMessageStatus.QUEUED,
      );
    } catch (error) {
      logger.error(
        `Failed to enqueue inbound email id=${emailMessage.getId()} providerMessageId=${dto.providerMessageId}`,
        {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
      );

      OperationReporter.error(OPERATIONS.QUEUE_INBOUND_EMAIL, OperationOriginEnum.SERVICE, {
        providerMessageId: dto.providerMessageId,
        emailMessageId: emailMessage.getId().toString(),
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        id: emailMessage.getId().toString(),
        status: 'internal_error',
        message: 'Email stored but failed to enqueue for processing.',
      };
    }

    const result: InboundEmailResult = {
      id: emailMessage.getId().toString(),
      status: 'queued',
      message: 'Inbound email accepted and queued for processing.',
    };

    OperationReporter.success(OPERATIONS.QUEUE_INBOUND_EMAIL, OperationOriginEnum.SERVICE, {
      providerMessageId: dto.providerMessageId,
      emailMessageId: emailMessage.getId().toString(),
      correlationId: correlator.getId(),
      result,
    });

    OperationReporter.success(OPERATIONS.RECEIVE_INBOUND_EMAIL, OperationOriginEnum.SERVICE, {
      providerMessageId: dto.providerMessageId,
      emailMessageId: emailMessage.getId().toString(),
      result,
    });

    return result;
  }

  private async enqueueInboundProcessing(
    emailMessageId: string,
    providerMessageId: string,
  ): Promise<void> {
    OperationReporter.received(OPERATIONS.QUEUE_INBOUND_EMAIL, OperationOriginEnum.SERVICE, {
      emailMessageId,
      providerMessageId,
      correlationId: correlator.getId(),
    });

    await this.emailProcessingQueue.add(
      'process-inbound-email',
      {
        emailMessageId,
        providerMessageId,
        correlationId: correlator.getId(),
      },
      {
        jobId: toEmailProcessingJobId(providerMessageId),
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      },
    );
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return error instanceof MongoServerError && error.code === 11000;
  }
}
