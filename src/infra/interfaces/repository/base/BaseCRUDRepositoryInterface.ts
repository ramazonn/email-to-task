import { BaseRepositoryInterface } from './BaseRepositoryInterface';

export interface BaseCRUDRepositoryInterface<K>
  extends BaseRepositoryInterface<K> {
  create(arg: K): Promise<K>;
  update(arg: K): Promise<K>;
}
