import { ExtractionResultSchema } from './ExtractionResultSchema';

describe('ExtractionResultSchema', () => {
  it('accepts valid extraction output', () => {
    const result = ExtractionResultSchema.safeParse({
      isActionable: true,
      title: 'Follow up',
      description: 'Call the client',
      dueDate: '2026-07-01',
      assigneeEmail: 'bob@acme.example',
    });

    expect(result.success).toBe(true);
  });

  it('rejects missing nullable fields under strict mode', () => {
    const result = ExtractionResultSchema.safeParse({
      isActionable: false,
      title: 'Follow up',
      description: 'Call the client',
    });

    expect(result.success).toBe(false);
  });

  it('rejects malformed values', () => {
    const result = ExtractionResultSchema.safeParse({
      isActionable: 'yes',
      title: null,
      description: null,
      dueDate: null,
      assigneeEmail: null,
    });

    expect(result.success).toBe(false);
  });
});
