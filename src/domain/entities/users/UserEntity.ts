import { Types } from 'mongoose';
import { UserSchema } from '../../../database';

export class UserEntity {
  protected _id?: Types.ObjectId;
  protected _companyId?: Types.ObjectId;
  protected _name?: string;
  protected _emails?: string[];
  protected _createdAt?: Date;
  protected _updatedAt?: Date;

  buildId(id: Types.ObjectId): this {
    this._id = id;
    return this;
  }

  buildCompanyId(companyId: Types.ObjectId): this {
    this._companyId = companyId;
    return this;
  }

  buildName(name: string): this {
    this._name = name;
    return this;
  }

  buildEmails(emails: string[]): this {
    this._emails = emails;
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

  getCompanyId(): Types.ObjectId {
    return this._companyId!;
  }

  getName(): string {
    return this._name!;
  }

  getEmails(): string[] {
    return this._emails ?? [];
  }

  getCreatedAt(): Date | undefined {
    return this._createdAt;
  }

  getUpdatedAt(): Date | undefined {
    return this._updatedAt;
  }

  convertToEntity(
    doc: (UserSchema & { _id?: Types.ObjectId; createdAt?: Date; updatedAt?: Date }) | null,
  ): UserEntity | null {
    if (!doc) {
      return null;
    }

    return new UserEntity()
      .buildId(doc._id!)
      .buildCompanyId(doc.companyId)
      .buildName(doc.name)
      .buildEmails(doc.emails)
      .buildCreatedAt(doc.createdAt!)
      .buildUpdatedAt(doc.updatedAt!);
  }

  convertToSchema(): Partial<UserSchema> {
    return {
      companyId: this._companyId,
      name: this._name,
      emails: this._emails?.map((email) => email.toLowerCase()),
    };
  }
}
