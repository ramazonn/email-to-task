import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EmailMessageStatus } from './EmailMessageStatus';

export type EmailMessageDocument = HydratedDocument<EmailMessageSchema>;

@Schema({ collection: 'email_messages', timestamps: true })
export class EmailMessageSchema {
  @Prop({ required: true, unique: true })
  providerMessageId!: string;

  @Prop({ required: true })
  from!: string;

  @Prop({ required: true })
  to!: string;

  @Prop()
  subject?: string;

  @Prop({ required: true })
  text!: string;

  @Prop()
  html?: string;

  @Prop({ required: true })
  receivedAt!: Date;

  @Prop({
    required: true,
    enum: EmailMessageStatus,
    type: String,
    default: EmailMessageStatus.RECEIVED,
    index: true,
  })
  status!: EmailMessageStatus;

  @Prop({ type: Types.ObjectId, ref: 'Company' })
  companyId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  resolvedUserId?: Types.ObjectId;

  @Prop({ type: Object })
  llmRawResult?: Record<string, unknown>;

  @Prop({ type: Types.ObjectId, ref: 'Task' })
  taskId?: Types.ObjectId;

  @Prop()
  error?: string;
}

export const EmailMessageMongooseSchema =
  SchemaFactory.createForClass(EmailMessageSchema);
