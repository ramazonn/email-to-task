import { Types } from 'mongoose';
import { TaskSchema, TaskStatus } from '../../../database';

export class TaskEntity {
  protected _id?: Types.ObjectId;
  protected _companyId?: Types.ObjectId;
  protected _title?: string;
  protected _description?: string;
  protected _dueDate?: Date;
  protected _assigneeUserId?: Types.ObjectId;
  protected _assigneeEmailRaw?: string;
  protected _status?: TaskStatus;
  protected _sourceEmailMessageId?: Types.ObjectId;
  protected _reviewedAt?: Date;
  protected _reviewedBy?: string;
  protected _createdAt?: Date;
  protected _updatedAt?: Date;

  buildId(id: Types.ObjectId): this {
    this._id = id;
    return this;
  }

  buildCompanyId(companyId: Types.ObjectId): this {
    this._companyId = companyId;
    return this;
  }

  buildTitle(title: string): this {
    this._title = title;
    return this;
  }

  buildDescription(description: string): this {
    this._description = description;
    return this;
  }

  buildDueDate(dueDate?: Date): this {
    this._dueDate = dueDate;
    return this;
  }

  buildAssigneeUserId(assigneeUserId?: Types.ObjectId): this {
    this._assigneeUserId = assigneeUserId;
    return this;
  }

  buildAssigneeEmailRaw(assigneeEmailRaw?: string): this {
    this._assigneeEmailRaw = assigneeEmailRaw;
    return this;
  }

  buildStatus(status: TaskStatus): this {
    this._status = status;
    return this;
  }

  buildSourceEmailMessageId(sourceEmailMessageId: Types.ObjectId): this {
    this._sourceEmailMessageId = sourceEmailMessageId;
    return this;
  }

  buildReviewedAt(reviewedAt?: Date): this {
    this._reviewedAt = reviewedAt;
    return this;
  }

  buildReviewedBy(reviewedBy?: string): this {
    this._reviewedBy = reviewedBy;
    return this;
  }

  buildCreatedAt(createdAt: Date): this {
    this._createdAt = createdAt;
    return this;
  }

  buildUpdatedAt(updatedAt: Date): this {
    this._updatedAt = updatedAt;
    return this;
  }

  getId(): Types.ObjectId {
    return this._id!;
  }

  getCompanyId(): Types.ObjectId {
    return this._companyId!;
  }

  getTitle(): string {
    return this._title!;
  }

  getDescription(): string {
    return this._description!;
  }

  getDueDate(): Date | undefined {
    return this._dueDate;
  }

  getAssigneeUserId(): Types.ObjectId | undefined {
    return this._assigneeUserId;
  }

  getAssigneeEmailRaw(): string | undefined {
    return this._assigneeEmailRaw;
  }

  getStatus(): TaskStatus {
    return this._status!;
  }

  getSourceEmailMessageId(): Types.ObjectId {
    return this._sourceEmailMessageId!;
  }

  getReviewedAt(): Date | undefined {
    return this._reviewedAt;
  }

  getReviewedBy(): string | undefined {
    return this._reviewedBy;
  }

  getCreatedAt(): Date | undefined {
    return this._createdAt;
  }

  getUpdatedAt(): Date | undefined {
    return this._updatedAt;
  }

  convertToEntity(
    doc: TaskSchema & {
      _id?: Types.ObjectId;
      createdAt?: Date;
      updatedAt?: Date;
    } | null,
  ): TaskEntity | null {
    if (!doc) {
      return null;
    }

    return new TaskEntity()
      .buildId(doc._id!)
      .buildCompanyId(doc.companyId)
      .buildTitle(doc.title)
      .buildDescription(doc.description)
      .buildDueDate(doc.dueDate)
      .buildAssigneeUserId(doc.assigneeUserId)
      .buildAssigneeEmailRaw(doc.assigneeEmailRaw)
      .buildStatus(doc.status)
      .buildSourceEmailMessageId(doc.sourceEmailMessageId)
      .buildReviewedAt(doc.reviewedAt)
      .buildReviewedBy(doc.reviewedBy)
      .buildCreatedAt(doc.createdAt!)
      .buildUpdatedAt(doc.updatedAt!);
  }

  convertToSchema(): Partial<TaskSchema> {
    return {
      companyId: this._companyId,
      title: this._title,
      description: this._description,
      dueDate: this._dueDate,
      assigneeUserId: this._assigneeUserId,
      assigneeEmailRaw: this._assigneeEmailRaw,
      status: this._status,
      sourceEmailMessageId: this._sourceEmailMessageId,
      reviewedAt: this._reviewedAt,
      reviewedBy: this._reviewedBy,
    };
  }
}
