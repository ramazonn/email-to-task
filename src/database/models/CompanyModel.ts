import { Model } from 'mongoose';
import {
  CompanyDocument,
  CompanyMongooseSchema,
  CompanySchema,
} from '../schemas';
import { getModel } from './GetModel';

export const COMPANY_MODEL = CompanySchema.name;

export const CompanyModel = new Proxy({} as Model<CompanyDocument>, {
  get(_target, prop) {
    const model = getModel<CompanyDocument>(COMPANY_MODEL);
    const value = Reflect.get(model, prop, model);
    return typeof value === 'function' ? value.bind(model) : value;
  },
});

export { CompanySchema, CompanyMongooseSchema };
