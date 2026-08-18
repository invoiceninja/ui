import { describe, expect, it } from 'vitest';
import {
  normalizeAntdLocale,
  useResolveAntdLocale,
} from '../../../src/common/hooks/useResolveAntdLocale';

describe('Ant Design locale resolution', () => {
  it('normalizes Vite 7 and Vite 8 CommonJS module shapes', () => {
    const locale = { locale: 'fr' };

    expect(normalizeAntdLocale(locale)).toBe(locale);
    expect(normalizeAntdLocale({ default: locale })).toBe(locale);
    expect(normalizeAntdLocale({ default: { default: locale } })).toBe(locale);
  });

  it('rejects malformed locale modules', () => {
    expect(normalizeAntdLocale(null)).toBeNull();
    expect(normalizeAntdLocale({ default: {} })).toBeNull();
  });

  it('resolves supported locales to locale objects', async () => {
    const resolveLocale = useResolveAntdLocale();

    await expect(resolveLocale('fr')).resolves.toMatchObject({ locale: 'fr' });
  });

  it.each([
    ['ca', 'ca', 'ca_ES'],
    ['id_ID', 'id', 'id_ID'],
    ['vi', 'vi', 'vi_VN'],
  ])('maps %s to its supported Ant locale pack', async (appLocale, antdLocale, pickerLocale) => {
    const locale = await useResolveAntdLocale()(appLocale);

    expect(locale.locale).toBe(antdLocale);
    expect(locale.DatePicker?.lang.locale).toBe(pickerLocale);
  });

  it.each([
    'af_ZA',
    'lo_LA',
    'not-a-locale',
  ])('falls back to English for unsupported locale %s', async (appLocale) => {
    const locale = await useResolveAntdLocale()(appLocale);

    expect(locale.locale).toBe('en');
    expect(locale.DatePicker?.lang.locale).toBe('en_US');
  });
});
