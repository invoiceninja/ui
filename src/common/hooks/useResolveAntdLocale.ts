/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import type { Locale } from 'antd/es/locale';

function isRecord(candidate: unknown): candidate is Record<string, unknown> {
  return typeof candidate === 'object' && candidate !== null;
}

export function normalizeAntdLocale(candidate: unknown): Locale | null {
  let current = candidate;
  const visited = new Set<unknown>();

  while (isRecord(current) && 'default' in current && !visited.has(current)) {
    visited.add(current);
    current = current.default;
  }

  return isRecord(current) && typeof current.locale === 'string'
    ? (current as unknown as Locale)
    : null;
}

function loadAntdLocale(appLanguage: string): Promise<unknown> {
  switch (appLanguage) {
    case 'en':
      return import('antd/locale/en_US');
    case 'it':
      return import('antd/locale/it_IT');
    case 'de':
      return import('antd/locale/de_DE');
    case 'fr':
      return import('antd/locale/fr_FR');
    case 'pt_BR':
      return import('antd/locale/pt_BR');
    case 'nl':
      return import('antd/locale/nl_NL');
    case 'es':
      return import('antd/locale/es_ES');
    case 'nb_NO':
      return import('antd/locale/nb_NO');
    case 'da':
      return import('antd/locale/da_DK');
    case 'ja':
      return import('antd/locale/ja_JP');
    case 'sv':
      return import('antd/locale/sv_SE');
    case 'es_ES':
      return import('antd/locale/es_ES');
    case 'fr_CA':
      return import('antd/locale/fr_CA');
    case 'lt':
      return import('antd/locale/lt_LT');
    case 'pl':
      return import('antd/locale/pl_PL');
    case 'cs':
      return import('antd/locale/cs_CZ');
    case 'hr':
      return import('antd/locale/hr_HR');
    case 'sq':
      return import('antd/locale/en_US');
    case 'el':
      return import('antd/locale/el_GR');
    case 'en_GB':
      return import('antd/locale/en_GB');
    case 'pt_PT':
      return import('antd/locale/pt_PT');
    case 'sl':
      return import('antd/locale/sl_SI');
    case 'fi':
      return import('antd/locale/fi_FI');
    case 'ro':
      return import('antd/locale/ro_RO');
    case 'tr_TR':
      return import('antd/locale/tr_TR');
    case 'th':
      return import('antd/locale/th_TH');
    case 'mk_MK':
      return import('antd/locale/mk_MK');
    case 'zh_TW':
      return import('antd/locale/zh_TW');
    case 'ru_RU':
      return import('antd/locale/ru_RU');
    case 'ar':
      return import('antd/locale/ar_EG');
    case 'fa':
      return import('antd/locale/fa_IR');
    case 'lv_LV':
      return import('antd/locale/lv_LV');
    case 'sr':
      return import('antd/locale/sr_RS');
    case 'sk':
      return import('antd/locale/sk_SK');
    case 'et':
      return import('antd/locale/et_EE');
    case 'bg':
      return import('antd/locale/bg_BG');
    case 'he':
      return import('antd/locale/he_IL');
    case 'km_KH':
      return import('antd/locale/km_KH');
    case 'hu':
      return import('antd/locale/hu_HU');
    case 'fr_CH':
      return import('antd/locale/fr_FR');
    case 'ca':
      return import('antd/locale/ca_ES');
    case 'id_ID':
      return import('antd/locale/id_ID');
    case 'vi':
      return import('antd/locale/vi_VN');
    default:
      return import('antd/locale/en_US');
  }
}

export function useResolveAntdLocale() {
  return async (appLanguage: string): Promise<Locale> => {
    try {
      const locale = normalizeAntdLocale(await loadAntdLocale(appLanguage));

      if (locale) {
        return locale;
      }
    } catch {
      // Fall through to the English locale if a locale chunk cannot load.
    }

    const fallback = normalizeAntdLocale(await import('antd/locale/en_US'));

    if (!fallback) {
      throw new Error('Unable to resolve the fallback Ant Design locale');
    }

    return fallback;
  };
}
