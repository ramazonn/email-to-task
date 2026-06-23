import { toEmailProcessingJobId } from './EmailProcessingConstants';

describe('toEmailProcessingJobId', () => {
  it('prefixes numeric providerMessageId so BullMQ accepts it', () => {
    expect(toEmailProcessingJobId('12345')).toBe('inbound-12345');
  });

  it('does not use colons in the job id', () => {
    expect(toEmailProcessingJobId('string1234567')).toBe('inbound-string1234567');
    expect(toEmailProcessingJobId('msg:part:extra')).toBe('inbound-msg_part_extra');
  });
});
