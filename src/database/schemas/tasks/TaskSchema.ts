import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TaskStatus } from './TaskStatus';

export type TaskDocument = HydratedDocument<TaskSchema>;

@Schema({ collection: 'tasks', timestamps: true })
export class TaskSchema {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  companyId!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop()
  dueDate?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assigneeUserId?: Types.ObjectId;

  @Prop()
  assigneeEmailRaw?: string;

  @Prop({
    required: true,
    enum: TaskStatus,
    type: String,
    default: TaskStatus.PENDING_REVIEW,
  })
  status!: TaskStatus;

  @Prop({ type: Types.ObjectId, ref: 'EmailMessage', required: true })
  sourceEmailMessageId!: Types.ObjectId;

  @Prop()
  reviewedAt?: Date;

  @Prop()
  reviewedBy?: string;
}

export const TaskMongooseSchema = SchemaFactory.createForClass(TaskSchema);
TaskMongooseSchema.index({ companyId: 1, status: 1, createdAt: -1 });
TaskMongooseSchema.index(
  { companyId: 1, sourceEmailMessageId: 1 },
  { unique: true },
);
