import { Model } from 'mongoose';
import {
  UserDocument,
  UserMongooseSchema,
  UserSchema,
} from '../schemas';
import { getModel } from './GetModel';

export const USER_MODEL = UserSchema.name;

export const UserModel = new Proxy({} as Model<UserDocument>, {
  get(_target, prop) {
    const model = getModel<UserDocument>(USER_MODEL);
    const value = Reflect.get(model, prop, model);
    return typeof value === 'function' ? value.bind(model) : value;
  },
});

export { UserSchema, UserMongooseSchema };
