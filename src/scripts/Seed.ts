import { NestFactory } from '@nestjs/core';
import { AppModule } from '../AppModule';
import {
  CompanyEntity,
  CompanyRepository,
  UserEntity,
  UserRepository,
} from '../domain';

export const SEED_COMPANY_1_API_KEY = 'company-1-api-key-test';
export const SEED_COMPANY_2_API_KEY = 'company-2-api-key-test';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const companyRepository = app.get(CompanyRepository);
  const userRepository = app.get(UserRepository);

  const company1 = await companyRepository.create(
    new CompanyEntity()
      .buildName('Company 1')
      .buildApiKey(SEED_COMPANY_1_API_KEY),
  );

  const company2 = await companyRepository.create(
    new CompanyEntity()
      .buildName('Company 2')
      .buildApiKey(SEED_COMPANY_2_API_KEY),
  );

  await userRepository.create(
    new UserEntity()
      .buildCompanyId(company1.getId())
      .buildName('Ramazon Test User 1')
      .buildEmails(['ramazon1@gmail.com']),
  );

  await userRepository.create(
    new UserEntity()
      .buildCompanyId(company2.getId())
      .buildName('Ramazon Test User 2')
      .buildEmails(['ramazon2@gmail.com']),
  );

  console.log('Seed complete:');
  console.log(`  Company 1 id=${company1.getId().toString()} apiKey=${SEED_COMPANY_1_API_KEY} user=ramazon1@gmail.com`);
  console.log(`  Company 2 id=${company2.getId().toString()} apiKey=${SEED_COMPANY_2_API_KEY} user=ramazon2@gmail.com`);

  await app.close();
}

void seed();
