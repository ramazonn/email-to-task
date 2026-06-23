export interface MultilingualMessage {
  en: string;
  ru: string;
  uz: string;
}

export function isMultilingualMessage(value: unknown): value is MultilingualMessage {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const message = value as Record<string, unknown>;
  return (
    typeof message.en === 'string' &&
    typeof message.ru === 'string' &&
    typeof message.uz === 'string'
  );
}

export function createMultilingualMessage(
  en: string,
  ru: string,
  uz: string,
): MultilingualMessage {
  return { en, ru, uz };
}
