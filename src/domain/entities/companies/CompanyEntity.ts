import { Types } from 'mongoose';
import { CompanySchema } from '../../../database';

export class CompanyEntity {
  protected _id?: Types.ObjectId;
  protected _name?: string;
  protected _apiKey?: string;
  protected _createdAt?: Date;
  protected _updatedAt?: Date;

  buildId(id: Types.ObjectId): this {
    this._id = id;
    return this;
  }

  buildName(name: string): this {
    this._name = name;
    return this;
  }

  buildApiKey(apiKey: string): this {
    this._apiKey = apiKey;
    return this;
  }

  buildCreatedAt(createdAt: Date): this {
    this._createdAt = createdAt;
    return this;
  }

  buildUpdatedAt(updatedAt: Date): this {
    this._updatedAt = updatedAt;
    return this;
  }

  getId(): Types.ObjectId {
    return this._id!;
  }

  getName(): string {
    return this._name!;
  }

  getApiKey(): string {
    return this._apiKey!;
  }

  getCreatedAt(): Date | undefined {
    return this._createdAt;
  }

  getUpdatedAt(): Date | undefined {
    return this._updatedAt;
  }

  convertToEntity(
    doc: (CompanySchema & { _id?: Types.ObjectId; createdAt?: Date; updatedAt?: Date }) | null,
  ): CompanyEntity | null {
    if (!doc) {
      return null;
    }

    return new CompanyEntity()
      .buildId(doc._id!)
      .buildName(doc.name)
      .buildApiKey(doc.apiKey)
      .buildCreatedAt(doc.createdAt!)
      .buildUpdatedAt(doc.updatedAt!);
  }

  convertToSchema(): Partial<CompanySchema> {
    return {
      name: this._name,
      apiKey: this._apiKey,
    };
  }
}
