export enum SupportedLanguage {
  EN = 'en',
  RU = 'ru',
  UZ = 'uz',
}

export const DEFAULT_LANGUAGE = SupportedLanguage.EN;

const SUPPORTED_LANGUAGES = new Set<string>(Object.values(SupportedLanguage));

export function resolveLanguage(
  acceptLanguage?: string | string[],
): SupportedLanguage {
  if (!acceptLanguage) {
    return DEFAULT_LANGUAGE;
  }

  const header = Array.isArray(acceptLanguage)
    ? acceptLanguage[0]
    : acceptLanguage;

  if (!header) {
    return DEFAULT_LANGUAGE;
  }

  const candidates = header
    .split(',')
    .map((part) => {
      const [rawLanguage, qualityPart] = part.trim().split(';');
      const quality = qualityPart?.startsWith('q=')
        ? Number.parseFloat(qualityPart.slice(2))
        : 1;
      const language = rawLanguage.split('-')[0]?.toLowerCase();

      return { language, quality: Number.isNaN(quality) ? 0 : quality };
    })
    .sort((left, right) => right.quality - left.quality);

  for (const candidate of candidates) {
    if (candidate.language && SUPPORTED_LANGUAGES.has(candidate.language)) {
      return candidate.language as SupportedLanguage;
    }
  }

  return DEFAULT_LANGUAGE;
}
