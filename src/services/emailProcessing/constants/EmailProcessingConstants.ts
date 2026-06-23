export const EMAIL_PROCESSING_QUEUE = 'email-processing';

const EMAIL_PROCESSING_JOB_ID_PREFIX = 'inbound-';

/**
 * BullMQ custom job IDs must not be pure integers and must not contain `:`.
 * Mongo still dedupes on raw providerMessageId; this only shapes the queue key.
 */
export function toEmailProcessingJobId(providerMessageId: string): string {
  const safeId = providerMessageId.replace(/:/g, '_');
  return `${EMAIL_PROCESSING_JOB_ID_PREFIX}${safeId}`;
}

export interface EmailProcessingJobData {
  emailMessageId: string;
  providerMessageId: string;
  correlationId?: string;
}
