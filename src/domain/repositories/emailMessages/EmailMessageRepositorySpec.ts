import { Types } from 'mongoose';
import { EmailMessageModel, EmailMessageStatus } from '../../../database';
import { EmailMessageRepository } from './EmailMessageRepository';

jest.mock('../../../database/models/EmailMessageModel', () => ({
  EmailMessageModel: {
    create: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

describe('EmailMessageRepository', () => {
  let repository: EmailMessageRepository;

  beforeEach(() => {
    repository = new EmailMessageRepository();
    jest.clearAllMocks();
  });

  it('scopes findByIdForCompany by companyId', async () => {
    const companyId = new Types.ObjectId();
    const emailId = new Types.ObjectId();

    (EmailMessageModel.findOne as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await repository.findByIdForCompany(emailId, companyId);

    expect(EmailMessageModel.findOne).toHaveBeenCalledWith({
      _id: emailId,
      companyId,
    });
  });

  it('updates status via findByIdAndUpdate', async () => {
    const emailId = new Types.ObjectId();

    (EmailMessageModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await repository.updateStatus(emailId, EmailMessageStatus.QUEUED);

    expect(EmailMessageModel.findByIdAndUpdate).toHaveBeenCalledWith(
      emailId,
      { status: EmailMessageStatus.QUEUED },
      { new: true },
    );
  });
});
