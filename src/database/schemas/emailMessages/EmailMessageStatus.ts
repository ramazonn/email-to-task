export enum EmailMessageStatus {
  RECEIVED = 'RECEIVED',
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  ACTIONABLE = 'ACTIONABLE',
  SKIPPED = 'SKIPPED',
  UNMATCHED = 'UNMATCHED',
  FAILED = 'FAILED',
}

export const TERMINAL_EMAIL_STATUSES: ReadonlySet<EmailMessageStatus> = new Set([
  EmailMessageStatus.ACTIONABLE,
  EmailMessageStatus.SKIPPED,
  EmailMessageStatus.UNMATCHED,
  EmailMessageStatus.FAILED,
]);
