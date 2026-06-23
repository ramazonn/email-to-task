export interface BaseEntityInterface<T, K> {
  convertToEntity(arg: K | null): T | null;
  convertToSchema(): K;
}
