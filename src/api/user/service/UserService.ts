import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { NotFoundError } from '../../../infra';
import {
  CompanyRepository,
  UserEntity,
  UserRepository,
} from '../../../domain';
import { CreateUserDto, ListUsersQueryDto, UpdateUserDto } from '../dto';
import { DuplicateUserEmailError } from '../exception';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly companyRepository: CompanyRepository,
  ) {}

  async createUser(dto: CreateUserDto) {
    const companyId = new Types.ObjectId(dto.companyId);
    await this.ensureCompanyExists(companyId);

    const emails = this.normalizeEmails(dto.emails);
    await this.ensureEmailsAreUnique(emails);

    const user = new UserEntity()
      .buildCompanyId(companyId)
      .buildName(dto.name.trim())
      .buildEmails(emails);

    const created = await this.userRepository.create(user);
    return this.formatResponse(created);
  }

  async listUsers(query: ListUsersQueryDto) {
    const filter: Record<string, unknown> = {};

    if (query.companyId) {
      filter.companyId = new Types.ObjectId(query.companyId);
    }

    const [items, total] = await Promise.all([
      this.userRepository.list(
        { page: query.page, size: query.limit },
        filter,
        { createdAt: -1 },
      ),
      this.userRepository.countDocumentsByFilter(filter),
    ]);

    return {
      items: items.map((user) => this.formatResponse(user)),
      total,
    };
  }

  async getUserById(id: string) {
    const user = await this.findUserOrThrow(id);
    return this.formatResponse(user);
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const existing = await this.findUserOrThrow(id);
    const companyId = new Types.ObjectId(dto.companyId);
    await this.ensureCompanyExists(companyId);

    const emails = this.normalizeEmails(dto.emails);
    await this.ensureEmailsAreUnique(emails, existing.getId());

    existing
      .buildCompanyId(companyId)
      .buildName(dto.name.trim())
      .buildEmails(emails);

    return this.formatResponse(await this.userRepository.update(existing));
  }

  async deleteUser(id: string) {
    const existing = await this.findUserOrThrow(id);
    await this.userRepository.deleteById(existing.getId());

    return {
      id: existing.getId().toString(),
      deleted: true,
    };
  }

  private async findUserOrThrow(id: string): Promise<UserEntity> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('User');
    }

    const user = await this.userRepository.getById(new Types.ObjectId(id));
    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  private async ensureCompanyExists(companyId: Types.ObjectId): Promise<void> {
    if (!Types.ObjectId.isValid(companyId.toString())) {
      throw new NotFoundError('Company');
    }

    const company = await this.companyRepository.getById(companyId);
    if (!company) {
      throw new NotFoundError('Company');
    }
  }

  private normalizeEmails(emails: string[]): string[] {
    return [...new Set(emails.map((email) => email.toLowerCase().trim()))];
  }

  private async ensureEmailsAreUnique(
    emails: string[],
    excludeUserId?: Types.ObjectId,
  ): Promise<void> {
    const conflict = await this.userRepository.findByAnyEmail(emails, excludeUserId);

    if (conflict) {
      throw new DuplicateUserEmailError();
    }
  }

  private formatResponse(user: UserEntity) {
    return {
      id: user.getId().toString(),
      companyId: user.getCompanyId().toString(),
      name: user.getName(),
      emails: user.getEmails(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    };
  }
}
