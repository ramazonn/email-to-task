import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<UserSchema>;

@Schema({ collection: 'users', timestamps: true })
export class UserSchema {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  companyId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ type: [String], required: true })
  emails!: string[];
}

export const UserMongooseSchema = SchemaFactory.createForClass(UserSchema);
UserMongooseSchema.index({ emails: 1 }, { unique: true });
