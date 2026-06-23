import { Injectable } from '@nestjs/common';
import { FilterQuery, Types } from 'mongoose';
import { CompanyModel, CompanySchema } from '../../../database';
import { BaseCRUDRepositoryInterface } from '../../../infra';
import { CompanyEntity } from '../../entities';
import { BaseCRUDRepository } from '../base';

export interface CompanyRepositoryInterface
  extends BaseCRUDRepositoryInterface<CompanyEntity> {
  countDocumentsByFilter(filter: object): Promise<number>;
  deleteById(id: Types.ObjectId): Promise<boolean>;
  findByApiKey(apiKey: string): Promise<CompanyEntity | null>;
  findOneRaw(filter: FilterQuery<CompanySchema>): Promise<CompanySchema | null>;
}

@Injectable()
export class CompanyRepository
  extends BaseCRUDRepository<CompanyEntity, CompanySchema>
  implements CompanyRepositoryInterface
{
  async create(_company: CompanyEntity): Promise<CompanyEntity> {
    this.checkRequiredFields(['_name', '_apiKey'], _company);

    const companyToCreate = _company.convertToSchema();
    const created = await CompanyModel.create(companyToCreate);
    return new CompanyEntity().convertToEntity(created)!;
  }

  async getById(_id: Types.ObjectId): Promise<CompanyEntity | null> {
    const found = await CompanyModel.findOne({ _id }).exec();
    return new CompanyEntity().convertToEntity(found);
  }

  async list(
    pagination?: { page?: number; size?: number },
    filter: FilterQuery<CompanySchema> = {},
    sort: Record<string, 1 | -1> = { createdAt: -1 },
  ): Promise<CompanyEntity[]> {
    const page = pagination?.page ?? 1;
    const size = pagination?.size ?? 20;

    const companies = await CompanyModel.find(filter)
      .limit(size)
      .skip((page - 1) * size)
      .sort(sort)
      .exec();

    return this.multipleConverter(companies, CompanyEntity);
  }

  async update(_company: CompanyEntity): Promise<CompanyEntity> {
    this.checkRequiredFields(['_id', '_name', '_apiKey'], _company);

    const companyToUpdate = _company.convertToSchema();
    const updated = await CompanyModel.findOneAndUpdate(
      { _id: _company.getId() },
      { $set: companyToUpdate },
      { new: true },
    ).exec();

    return new CompanyEntity().convertToEntity(updated)!;
  }

  async countDocumentsByFilter(filter: object): Promise<number> {
    return CompanyModel.countDocuments(filter).exec();
  }

  async deleteById(id: Types.ObjectId): Promise<boolean> {
    const deleted = await CompanyModel.deleteOne({ _id: id }).exec();
    return deleted.deletedCount === 1;
  }

  async findByApiKey(apiKey: string): Promise<CompanyEntity | null> {
    const found = await CompanyModel.findOne({ apiKey }).exec();
    return new CompanyEntity().convertToEntity(found);
  }

  async findOneRaw(
    filter: FilterQuery<CompanySchema>,
  ): Promise<CompanySchema | null> {
    return CompanyModel.findOne(filter).lean().exec() as Promise<CompanySchema | null>;
  }
}
