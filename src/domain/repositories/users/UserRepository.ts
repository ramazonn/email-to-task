import { Injectable } from '@nestjs/common';
import { FilterQuery, Types } from 'mongoose';
import { UserModel, UserSchema } from '../../../database';
import { BaseCRUDRepositoryInterface } from '../../../infra';
import { UserEntity } from '../../entities';
import { BaseCRUDRepository } from '../base';

export interface UserRepositoryInterface
  extends BaseCRUDRepositoryInterface<UserEntity> {
  countDocumentsByFilter(filter: object): Promise<number>;
  deleteById(id: Types.ObjectId): Promise<boolean>;
  findOneRaw(filter: FilterQuery<UserSchema>): Promise<UserSchema | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByEmailInCompany(
    email: string,
    companyId: Types.ObjectId,
  ): Promise<UserEntity | null>;
  findByAnyEmail(
    emails: string[],
    excludeUserId?: Types.ObjectId,
  ): Promise<UserEntity | null>;
}

@Injectable()
export class UserRepository
  extends BaseCRUDRepository<UserEntity, UserSchema>
  implements UserRepositoryInterface
{
  async create(_user: UserEntity): Promise<UserEntity> {
    this.checkRequiredFields(['_companyId', '_name', '_emails'], _user);

    const userToCreate = _user.convertToSchema();
    const created = await UserModel.create(userToCreate);
    return new UserEntity().convertToEntity(created)!;
  }

  async getById(_id: Types.ObjectId): Promise<UserEntity | null> {
    const found = await UserModel.findOne({ _id }).exec();
    return new UserEntity().convertToEntity(found);
  }

  async list(
    pagination?: { page?: number; size?: number },
    filter: FilterQuery<UserSchema> = {},
    sort: Record<string, 1 | -1> = { createdAt: -1 },
  ): Promise<UserEntity[]> {
    const page = pagination?.page ?? 1;
    const size = pagination?.size ?? 20;

    const users = await UserModel.find(filter)
      .limit(size)
      .skip((page - 1) * size)
      .sort(sort)
      .exec();

    return this.multipleConverter(users, UserEntity);
  }

  async update(_user: UserEntity): Promise<UserEntity> {
    this.checkRequiredFields(['_id', '_companyId', '_name', '_emails'], _user);

    const userToUpdate = _user.convertToSchema();
    const updated = await UserModel.findOneAndUpdate(
      { _id: _user.getId() },
      { $set: userToUpdate },
      { new: true },
    ).exec();

    return new UserEntity().convertToEntity(updated)!;
  }

  async countDocumentsByFilter(filter: object): Promise<number> {
    return UserModel.countDocuments(filter).exec();
  }

  async deleteById(id: Types.ObjectId): Promise<boolean> {
    const deleted = await UserModel.deleteOne({ _id: id }).exec();
    return deleted.deletedCount === 1;
  }

  async findOneRaw(filter: FilterQuery<UserSchema>): Promise<UserSchema | null> {
    return UserModel.findOne(filter).lean().exec() as Promise<UserSchema | null>;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const found = await UserModel.findOne({
      emails: email.toLowerCase(),
    }).exec();
    return new UserEntity().convertToEntity(found);
  }

  async findByEmailInCompany(
    email: string,
    companyId: Types.ObjectId,
  ): Promise<UserEntity | null> {
    const found = await UserModel.findOne({
      companyId,
      emails: email.toLowerCase(),
    }).exec();
    return new UserEntity().convertToEntity(found);
  }

  async findByAnyEmail(
    emails: string[],
    excludeUserId?: Types.ObjectId,
  ): Promise<UserEntity | null> {
    const normalizedEmails = emails.map((email) => email.toLowerCase());
    const filter: FilterQuery<UserSchema> = {
      emails: { $in: normalizedEmails },
    };

    if (excludeUserId) {
      filter._id = { $ne: excludeUserId };
    }

    const found = await UserModel.findOne(filter).exec();
    return new UserEntity().convertToEntity(found);
  }
}
