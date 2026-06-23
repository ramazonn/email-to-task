import { FilterQuery, Types } from 'mongoose';
import {
  BaseCRUDRepositoryInterface,
  PaginationInterface,
  RequirementError,
} from '../../../infra';

export abstract class BaseCRUDRepository<T, K>
  implements BaseCRUDRepositoryInterface<T>
{
  abstract create(arg: T): Promise<T>;
  abstract update(arg: T): Promise<T>;
  abstract getById(id: Types.ObjectId): Promise<T | null>;
  abstract list(
    pagination?: PaginationInterface,
    filter?: FilterQuery<unknown>,
    sort?: Record<string, 1 | -1>,
  ): Promise<T[]>;

  protected checkRequiredFields(fields: string[], obj: T): void {
    for (const field of fields) {
      if ((obj as Record<string, unknown>)[field] === null ||
        (obj as Record<string, unknown>)[field] === undefined) {
        throw new RequirementError(field);
      }
    }
  }

  protected multipleConverter(
    modelItems: K[],
    entityCreator: {
      new (): { convertToEntity(doc: K | null): T | null };
    },
  ): T[] {
    const entities: T[] = [];
    for (const item of modelItems) {
      const entityObject = new entityCreator().convertToEntity(item);
      if (entityObject) {
        entities.push(entityObject);
      }
    }
    return entities;
  }
}
