import { MultilingualMessage } from '../../infra';
import { DEFAULT_LANGUAGE, SupportedLanguage } from './SupportedLanguage';

export function resolveMessage(
  messages: MultilingualMessage,
  language: SupportedLanguage = DEFAULT_LANGUAGE,
): string {
  return messages[language] ?? messages[DEFAULT_LANGUAGE];
}
