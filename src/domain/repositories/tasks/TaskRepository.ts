import { Injectable } from '@nestjs/common';
import { FilterQuery, Types } from 'mongoose';
import { TaskModel, TaskSchema, TaskStatus } from '../../../database';
import { BaseCRUDRepositoryInterface } from '../../../infra';
import { TaskEntity } from '../../entities';
import { BaseCRUDRepository } from '../base';

export interface ListTasksFilter {
  companyId: Types.ObjectId;
  status?: TaskStatus;
  page: number;
  limit: number;
}

export interface TaskRepositoryInterface
  extends BaseCRUDRepositoryInterface<TaskEntity> {
  countDocumentsByFilter(filter: object): Promise<number>;
  deleteById(id: Types.ObjectId): Promise<boolean>;
  findOneRaw(filter: FilterQuery<TaskSchema>): Promise<TaskSchema | null>;
  findByIdForCompany(
    id: string | Types.ObjectId,
    companyId: Types.ObjectId,
  ): Promise<TaskEntity | null>;
  findBySourceEmailMessageId(
    companyId: Types.ObjectId,
    sourceEmailMessageId: Types.ObjectId,
  ): Promise<TaskEntity | null>;
  listByCompany(filter: ListTasksFilter): Promise<{
    items: TaskEntity[];
    total: number;
  }>;
  updateReview(
    id: Types.ObjectId,
    companyId: Types.ObjectId,
    status: TaskStatus.ACCEPTED | TaskStatus.REJECTED,
    reviewedBy?: string,
  ): Promise<TaskEntity | null>;
}

@Injectable()
export class TaskRepository
  extends BaseCRUDRepository<TaskEntity, TaskSchema>
  implements TaskRepositoryInterface
{
  async create(_task: TaskEntity): Promise<TaskEntity> {
    this.checkRequiredFields(
      ['_companyId', '_title', '_description', '_sourceEmailMessageId'],
      _task,
    );

    const taskToCreate = {
      ..._task.convertToSchema(),
      status: TaskStatus.PENDING_REVIEW,
    };
    const created = await TaskModel.create(taskToCreate);
    return new TaskEntity().convertToEntity(created)!;
  }

  async getById(_id: Types.ObjectId): Promise<TaskEntity | null> {
    const found = await TaskModel.findOne({ _id }).exec();
    return new TaskEntity().convertToEntity(found);
  }

  async list(
    pagination?: { page?: number; size?: number },
    filter: FilterQuery<TaskSchema> = {},
    sort: Record<string, 1 | -1> = { createdAt: -1 },
  ): Promise<TaskEntity[]> {
    const page = pagination?.page ?? 1;
    const size = pagination?.size ?? 20;

    const tasks = await TaskModel.find(filter)
      .limit(size)
      .skip((page - 1) * size)
      .sort(sort)
      .exec();

    return this.multipleConverter(tasks, TaskEntity);
  }

  async update(_task: TaskEntity): Promise<TaskEntity> {
    this.checkRequiredFields(
      ['_id', '_companyId', '_title', '_description', '_sourceEmailMessageId', '_status'],
      _task,
    );

    const taskToUpdate = _task.convertToSchema();
    const updated = await TaskModel.findOneAndUpdate(
      { _id: _task.getId() },
      { $set: taskToUpdate },
      { new: true },
    ).exec();

    return new TaskEntity().convertToEntity(updated)!;
  }

  async countDocumentsByFilter(filter: object): Promise<number> {
    return TaskModel.countDocuments(filter).exec();
  }

  async deleteById(id: Types.ObjectId): Promise<boolean> {
    const deleted = await TaskModel.deleteOne({ _id: id }).exec();
    return deleted.deletedCount === 1;
  }

  async findOneRaw(filter: FilterQuery<TaskSchema>): Promise<TaskSchema | null> {
    return TaskModel.findOne(filter).lean().exec() as Promise<TaskSchema | null>;
  }

  async findByIdForCompany(
    id: string | Types.ObjectId,
    companyId: Types.ObjectId,
  ): Promise<TaskEntity | null> {
    const found = await TaskModel.findOne({ _id: id, companyId }).exec();
    return new TaskEntity().convertToEntity(found);
  }

  async findBySourceEmailMessageId(
    companyId: Types.ObjectId,
    sourceEmailMessageId: Types.ObjectId,
  ): Promise<TaskEntity | null> {
    const found = await TaskModel.findOne({ companyId, sourceEmailMessageId }).exec();
    return new TaskEntity().convertToEntity(found);
  }

  async listByCompany(filter: ListTasksFilter): Promise<{
    items: TaskEntity[];
    total: number;
  }> {
    const query: FilterQuery<TaskSchema> = { companyId: filter.companyId };
    if (filter.status) {
      query.status = filter.status;
    }

    const skip = (filter.page - 1) * filter.limit;

    const [docs, total] = await Promise.all([
      TaskModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(filter.limit)
        .exec(),
      TaskModel.countDocuments(query).exec(),
    ]);

    return {
      items: this.multipleConverter(docs, TaskEntity),
      total,
    };
  }

  async updateReview(
    id: Types.ObjectId,
    companyId: Types.ObjectId,
    status: TaskStatus.ACCEPTED | TaskStatus.REJECTED,
    reviewedBy?: string,
  ): Promise<TaskEntity | null> {
    const updated = await TaskModel.findOneAndUpdate(
      { _id: id, companyId, status: TaskStatus.PENDING_REVIEW },
      {
        status,
        reviewedAt: new Date(),
        reviewedBy,
      },
      { new: true },
    ).exec();

    return new TaskEntity().convertToEntity(updated);
  }
}
