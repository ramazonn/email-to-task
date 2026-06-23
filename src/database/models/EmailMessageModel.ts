import { Model } from 'mongoose';
import {
  EmailMessageDocument,
  EmailMessageMongooseSchema,
  EmailMessageSchema,
} from '../schemas';
import { getModel } from './GetModel';

export const EMAIL_MESSAGE_MODEL = EmailMessageSchema.name;

export const EmailMessageModel = new Proxy({} as Model<EmailMessageDocument>, {
  get(_target, prop) {
    const model = getModel<EmailMessageDocument>(EMAIL_MESSAGE_MODEL);
    const value = Reflect.get(model, prop, model);
    return typeof value === 'function' ? value.bind(model) : value;
  },
});

export { EmailMessageSchema, EmailMessageMongooseSchema };
