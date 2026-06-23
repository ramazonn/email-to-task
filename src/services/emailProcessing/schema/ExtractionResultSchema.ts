import { z } from 'zod';

export const ExtractionResultSchema = z.object({
  isActionable: z.boolean(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  dueDate: z.string().nullable(),
  assigneeEmail: z.string().nullable(),
});

export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;

export class ContentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContentValidationError';
  }
}

export class LlmRefusalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LlmRefusalError';
  }
}
