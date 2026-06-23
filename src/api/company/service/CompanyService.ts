import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { NotFoundError } from '../../../infra';
import { CompanyEntity, CompanyRepository } from '../../../domain';
import { CreateCompanyDto, ListCompaniesQueryDto, UpdateCompanyDto } from '../dto';
import { DuplicateCompanyApiKeyError } from '../exception';

@Injectable()
export class CompanyService {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async createCompany(dto: CreateCompanyDto) {
    const apiKey = dto.apiKey?.trim() || uuidv4();
    await this.ensureApiKeyIsUnique(apiKey);

    const company = new CompanyEntity()
      .buildName(dto.name.trim())
      .buildApiKey(apiKey);

    const created = await this.companyRepository.create(company);
    return this.formatResponse(created);
  }

  async listCompanies(query: ListCompaniesQueryDto) {
    const [items, total] = await Promise.all([
      this.companyRepository.list(
        { page: query.page, size: query.limit },
        {},
        { createdAt: -1 },
      ),
      this.companyRepository.countDocumentsByFilter({}),
    ]);

    return {
      items: items.map((company) => this.formatResponse(company)),
      total,
    };
  }

  async getCompanyById(id: string) {
    const company = await this.findCompanyOrThrow(id);
    return this.formatResponse(company);
  }

  async updateCompany(id: string, dto: UpdateCompanyDto) {
    const existing = await this.findCompanyOrThrow(id);
    const apiKey = dto.apiKey.trim();

    if (apiKey !== existing.getApiKey()) {
      await this.ensureApiKeyIsUnique(apiKey, existing.getId());
    }

    existing.buildName(dto.name.trim()).buildApiKey(apiKey);

    return this.formatResponse(await this.companyRepository.update(existing));
  }

  async deleteCompany(id: string) {
    const existing = await this.findCompanyOrThrow(id);
    await this.companyRepository.deleteById(existing.getId());

    return {
      id: existing.getId().toString(),
      deleted: true,
    };
  }

  private async findCompanyOrThrow(id: string): Promise<CompanyEntity> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Company');
    }

    const company = await this.companyRepository.getById(new Types.ObjectId(id));
    if (!company) {
      throw new NotFoundError('Company');
    }

    return company;
  }

  private async ensureApiKeyIsUnique(
    apiKey: string,
    excludeCompanyId?: Types.ObjectId,
  ): Promise<void> {
    const existing = await this.companyRepository.findByApiKey(apiKey);

    if (!existing) {
      return;
    }

    if (excludeCompanyId && existing.getId().equals(excludeCompanyId)) {
      return;
    }

    throw new DuplicateCompanyApiKeyError();
  }

  private formatResponse(company: CompanyEntity) {
    return {
      id: company.getId().toString(),
      name: company.getName(),
      apiKey: company.getApiKey(),
      createdAt: company.getCreatedAt(),
      updatedAt: company.getUpdatedAt(),
    };
  }
}
