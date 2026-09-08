import { describe, expect, it } from 'vitest';
import {
  normalizeDayJSLocale,
  useResolveDayJSLocale,
} from '../../../src/common/hooks/useResolveDayJSLocale';

describe('Dayjs locale resolution', () => {
  it('normalizes Vite 7 and Vite 8 CommonJS module shapes', () => {
    const locale = { name: 'id' } as ILocale;

    expect(normalizeDayJSLocale(locale)).toBe(locale);
    expect(normalizeDayJSLocale({ default: locale })).toBe(locale);
    expect(normalizeDayJSLocale({ default: { default: locale } })).toBe(locale);
  });

  it('rejects malformed and recursive locale modules', () => {
    const recursiveModule: Record<string, unknown> = {};
    recursiveModule.default = recursiveModule;

    expect(normalizeDayJSLocale(null)).toBeNull();
    expect(normalizeDayJSLocale({ default: {} })).toBeNull();
    expect(normalizeDayJSLocale(recursiveModule)).toBeNull();
  });

  it.each([
    ['es_ES', 'es'],
    ['id_ID', 'id'],
    ['km_KH', 'km'],
    ['lv_LV', 'lv'],
    ['mk_MK', 'mk'],
    ['nb_NO', 'nb'],
    ['pt_PT', 'pt'],
    ['ru_RU', 'ru'],
    ['sq', 'sq'],
    ['tr_TR', 'tr'],
  ])('maps shipped region locale %s to Dayjs %s', async (appLocale, name) => {
    await expect(useResolveDayJSLocale()(appLocale)).resolves.toMatchObject({
      name,
    });
  });

  it.each(['af_ZA', 'lo_LA', 'not-a-locale'])(
    'falls back to English for unsupported Ant locale %s',
    async (appLocale) => {
      await expect(useResolveDayJSLocale()(appLocale)).resolves.toMatchObject({
        name: 'en',
      });
    }
  );
});
