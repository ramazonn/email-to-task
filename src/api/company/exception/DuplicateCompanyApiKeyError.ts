import { ConflictError } from '../../../infra';

export class DuplicateCompanyApiKeyError extends ConflictError {
  constructor() {
    super({
      en: 'Company with this apiKey already exists',
      ru: 'Компания с таким apiKey уже существует',
      uz: 'Bunday apiKey bilan kompaniya allaqachon mavjud',
    });
  }
}
