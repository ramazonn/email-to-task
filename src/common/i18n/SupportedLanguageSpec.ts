import { resolveLanguage, SupportedLanguage } from './SupportedLanguage';

describe('resolveLanguage', () => {
  it('defaults to english when header is missing', () => {
    expect(resolveLanguage()).toBe(SupportedLanguage.EN);
  });

  it('prefers the highest quality supported language', () => {
    expect(resolveLanguage('en;q=0.8,ru;q=0.9,uz;q=0.7')).toBe(
      SupportedLanguage.RU,
    );
  });

  it('falls back to english for unsupported languages', () => {
    expect(resolveLanguage('fr-FR,de;q=0.9')).toBe(SupportedLanguage.EN);
  });
});
