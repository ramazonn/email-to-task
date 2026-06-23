import { Model } from 'mongoose';
import {
  TaskDocument,
  TaskMongooseSchema,
  TaskSchema,
} from '../schemas';
import { getModel } from './GetModel';

export const TASK_MODEL = TaskSchema.name;

export const TaskModel = new Proxy({} as Model<TaskDocument>, {
  get(_target, prop) {
    const model = getModel<TaskDocument>(TASK_MODEL);
    const value = Reflect.get(model, prop, model);
    return typeof value === 'function' ? value.bind(model) : value;
  },
});

export { TaskSchema, TaskMongooseSchema };
