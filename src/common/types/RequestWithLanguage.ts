import { Request } from 'express';
import { SupportedLanguage } from '../i18n';

export interface RequestWithLanguage extends Request {
  language?: SupportedLanguage;
}
