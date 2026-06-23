import { Types } from 'mongoose';
import { TaskModel, TaskStatus } from '../../../database';
import { TaskRepository } from './TaskRepository';

jest.mock('../../../database/models/TaskModel', () => ({
  TaskModel: {
    findOne: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

describe('TaskRepository', () => {
  let repository: TaskRepository;

  beforeEach(() => {
    repository = new TaskRepository();
    jest.clearAllMocks();
  });

  it('scopes findByIdForCompany by companyId', async () => {
    const companyId = new Types.ObjectId();
    const taskId = new Types.ObjectId();

    (TaskModel.findOne as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await repository.findByIdForCompany(taskId, companyId);

    expect(TaskModel.findOne).toHaveBeenCalledWith({ _id: taskId, companyId });
  });

  it('scopes listByCompany by companyId', async () => {
    const companyId = new Types.ObjectId();

    (TaskModel.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
    });
    (TaskModel.countDocuments as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue(0),
    });

    await repository.listByCompany({
      companyId,
      status: TaskStatus.PENDING_REVIEW,
      page: 1,
      limit: 10,
    });

    expect(TaskModel.find).toHaveBeenCalledWith({
      companyId,
      status: TaskStatus.PENDING_REVIEW,
    });
    expect(TaskModel.countDocuments).toHaveBeenCalledWith({
      companyId,
      status: TaskStatus.PENDING_REVIEW,
    });
  });
});
