import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CompanyDocument = HydratedDocument<CompanySchema>;

@Schema({ collection: 'companies', timestamps: true })
export class CompanySchema {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true, index: true })
  apiKey!: string;
}

export const CompanyMongooseSchema = SchemaFactory.createForClass(CompanySchema);
