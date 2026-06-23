import { FilterQuery, Types } from 'mongoose';
import { PaginationInterface } from '../../PaginationInterface';

export interface BaseRepositoryInterface<K> {
  getById(id: Types.ObjectId): Promise<K | null>;
  list(
    pagination?: PaginationInterface,
    filter?: FilterQuery<unknown>,
    sort?: Record<string, 1 | -1>,
  ): Promise<K[]>;
}
