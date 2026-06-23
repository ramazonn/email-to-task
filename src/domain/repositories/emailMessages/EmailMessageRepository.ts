import { Injectable } from '@nestjs/common';
import { FilterQuery, Types } from 'mongoose';
import {
  EmailMessageModel,
  EmailMessageSchema,
  EmailMessageStatus,
} from '../../../database';
import { BaseCRUDRepositoryInterface } from '../../../infra';
import { EmailMessageEntity } from '../../entities';
import { BaseCRUDRepository } from '../base';

export interface EmailMessageRepositoryInterface
  extends BaseCRUDRepositoryInterface<EmailMessageEntity> {
  countDocumentsByFilter(filter: object): Promise<number>;
  deleteById(id: Types.ObjectId): Promise<boolean>;
  findOneRaw(
    filter: FilterQuery<EmailMessageSchema>,
  ): Promise<EmailMessageSchema | null>;
  findByProviderMessageId(
    providerMessageId: string,
  ): Promise<EmailMessageEntity | null>;
  findByIdForCompany(
    id: string | Types.ObjectId,
    companyId: Types.ObjectId,
  ): Promise<EmailMessageEntity | null>;
  updateStatus(
    id: string | Types.ObjectId,
    status: EmailMessageStatus,
    extra?: Record<string, unknown>,
  ): Promise<EmailMessageEntity | null>;
}

@Injectable()
export class EmailMessageRepository
  extends BaseCRUDRepository<EmailMessageEntity, EmailMessageSchema>
  implements EmailMessageRepositoryInterface
{
  async create(_email: EmailMessageEntity): Promise<EmailMessageEntity> {
    this.checkRequiredFields(
      ['_providerMessageId', '_from', '_to', '_text', '_receivedAt'],
      _email,
    );

    const emailToCreate = {
      ..._email.convertToSchema(),
      status: EmailMessageStatus.RECEIVED,
    };
    const created = await EmailMessageModel.create(emailToCreate);
    return new EmailMessageEntity().convertToEntity(created)!;
  }

  async getById(_id: Types.ObjectId): Promise<EmailMessageEntity | null> {
    const found = await EmailMessageModel.findOne({ _id }).exec();
    return new EmailMessageEntity().convertToEntity(found);
  }

  async list(
    pagination?: { page?: number; size?: number },
    filter: FilterQuery<EmailMessageSchema> = {},
    sort: Record<string, 1 | -1> = { createdAt: -1 },
  ): Promise<EmailMessageEntity[]> {
    const page = pagination?.page ?? 1;
    const size = pagination?.size ?? 20;

    const emails = await EmailMessageModel.find(filter)
      .limit(size)
      .skip((page - 1) * size)
      .sort(sort)
      .exec();

    return this.multipleConverter(emails, EmailMessageEntity);
  }

  async update(_email: EmailMessageEntity): Promise<EmailMessageEntity> {
    this.checkRequiredFields(
      ['_id', '_providerMessageId', '_from', '_to', '_text', '_receivedAt', '_status'],
      _email,
    );

    const emailToUpdate = _email.convertToSchema();
    const updated = await EmailMessageModel.findOneAndUpdate(
      { _id: _email.getId() },
      { $set: emailToUpdate },
      { new: true },
    ).exec();

    return new EmailMessageEntity().convertToEntity(updated)!;
  }

  async countDocumentsByFilter(filter: object): Promise<number> {
    return EmailMessageModel.countDocuments(filter).exec();
  }

  async deleteById(id: Types.ObjectId): Promise<boolean> {
    const deleted = await EmailMessageModel.deleteOne({ _id: id }).exec();
    return deleted.deletedCount === 1;
  }

  async findOneRaw(
    filter: FilterQuery<EmailMessageSchema>,
  ): Promise<EmailMessageSchema | null> {
    return EmailMessageModel.findOne(filter).lean().exec() as Promise<EmailMessageSchema | null>;
  }

  async findByProviderMessageId(
    providerMessageId: string,
  ): Promise<EmailMessageEntity | null> {
    const found = await EmailMessageModel.findOne({ providerMessageId }).exec();
    return new EmailMessageEntity().convertToEntity(found);
  }

  async findByIdForCompany(
    id: string | Types.ObjectId,
    companyId: Types.ObjectId,
  ): Promise<EmailMessageEntity | null> {
    const found = await EmailMessageModel.findOne({ _id: id, companyId }).exec();
    return new EmailMessageEntity().convertToEntity(found);
  }

  async updateStatus(
    id: string | Types.ObjectId,
    status: EmailMessageStatus,
    extra: Record<string, unknown> = {},
  ): Promise<EmailMessageEntity | null> {
    const updated = await EmailMessageModel.findByIdAndUpdate(
      id,
      { status, ...extra },
      { new: true },
    ).exec();
    return new EmailMessageEntity().convertToEntity(updated);
  }
}
