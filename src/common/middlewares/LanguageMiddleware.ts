import { RequestHandler } from 'express';
import { resolveLanguage } from '../i18n';
import { RequestWithLanguage } from '../types/RequestWithLanguage';

export const LanguageMiddleware: RequestHandler = (req, _res, next) => {
  const request = req as RequestWithLanguage;
  request.language = resolveLanguage(req.headers['accept-language']);
  next();
};
