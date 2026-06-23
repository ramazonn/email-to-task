export type InboundEmailResultStatus =
  | 'queued'
  | 'already_exists'
  | 'race_condition'
  | 'internal_error';

export interface InboundEmailResult {
  id: string | null;
  status: InboundEmailResultStatus;
  message: string;
}
