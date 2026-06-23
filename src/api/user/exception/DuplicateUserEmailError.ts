import { ConflictError } from '../../../infra';

export class DuplicateUserEmailError extends ConflictError {
  constructor() {
    super({
      en: 'One or more user emails are already in use',
      ru: 'Один или несколько email пользователя уже используются',
      uz: 'Foydalanuvchi email manzillaridan biri yoki bir nechtasi allaqachon ishlatilmoqda',
    });
  }
}
