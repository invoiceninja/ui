// Keep this list aligned with the date_formats returned by the statics API.
export const DATE_FORMATS = [
  'DD/MMM/YYYY',
  'DD-MMM-YYYY',
  'DD/MMMM/YYYY',
  'DD-MMMM-YYYY',
  'MMM D, YYYY',
  'MMMM D, YYYY',
  'ddd MMM D, YYYY',
  'YYYY-MM-DD',
  'DD-MM-YYYY',
  'MM/DD/YYYY',
  'DD.MM.YYYY',
  'DD. MMM. YYYY',
  'DD. MMMM YYYY',
  'DD/MM/YYYY',
] as const;

export const EXPECTED_RANGE = ['2026-08-18', '2026-09-25'] as const;

interface LocaleExpectation {
  antdLocale: string;
  antdPickerLocale: string;
  dayjsLocale: string;
}

// This is deliberately independent of the production resolver. A wrong or
// English-only resolver must fail the locale matrix instead of blessing itself.
export const LOCALE_EXPECTATIONS = {
  af_ZA: { antdLocale: 'en', antdPickerLocale: 'en_US', dayjsLocale: 'en' },
  ar: { antdLocale: 'ar', antdPickerLocale: 'ar_EG', dayjsLocale: 'ar' },
  bg: { antdLocale: 'bg', antdPickerLocale: 'bg_BG', dayjsLocale: 'bg' },
  ca: { antdLocale: 'ca', antdPickerLocale: 'ca_ES', dayjsLocale: 'ca' },
  cs: { antdLocale: 'cs', antdPickerLocale: 'cs_CZ', dayjsLocale: 'cs' },
  da: { antdLocale: 'da', antdPickerLocale: 'da_DK', dayjsLocale: 'da' },
  de: { antdLocale: 'de', antdPickerLocale: 'de_DE', dayjsLocale: 'de' },
  el: { antdLocale: 'el', antdPickerLocale: 'el_GR', dayjsLocale: 'el' },
  en: { antdLocale: 'en', antdPickerLocale: 'en_US', dayjsLocale: 'en' },
  en_GB: {
    antdLocale: 'en-gb',
    antdPickerLocale: 'en_GB',
    dayjsLocale: 'en-gb',
  },
  es: { antdLocale: 'es', antdPickerLocale: 'es_ES', dayjsLocale: 'es' },
  es_ES: { antdLocale: 'es', antdPickerLocale: 'es_ES', dayjsLocale: 'es' },
  et: { antdLocale: 'et', antdPickerLocale: 'et_EE', dayjsLocale: 'et' },
  fa: { antdLocale: 'fa', antdPickerLocale: 'fa_IR', dayjsLocale: 'fa' },
  fi: { antdLocale: 'fi', antdPickerLocale: 'fi_FI', dayjsLocale: 'fi' },
  fr: { antdLocale: 'fr', antdPickerLocale: 'fr_FR', dayjsLocale: 'fr' },
  fr_CA: {
    antdLocale: 'fr',
    antdPickerLocale: 'fr_CA',
    dayjsLocale: 'fr-ca',
  },
  fr_CH: {
    antdLocale: 'fr',
    antdPickerLocale: 'fr_FR',
    dayjsLocale: 'fr-ch',
  },
  he: { antdLocale: 'he', antdPickerLocale: 'he_IL', dayjsLocale: 'he' },
  hr: { antdLocale: 'hr', antdPickerLocale: 'hr_HR', dayjsLocale: 'hr' },
  hu: { antdLocale: 'hu', antdPickerLocale: 'hu_HU', dayjsLocale: 'hu' },
  id_ID: { antdLocale: 'id', antdPickerLocale: 'id_ID', dayjsLocale: 'id' },
  it: { antdLocale: 'it', antdPickerLocale: 'it_IT', dayjsLocale: 'it' },
  ja: { antdLocale: 'ja', antdPickerLocale: 'ja_JP', dayjsLocale: 'ja' },
  km_KH: { antdLocale: 'km', antdPickerLocale: 'km', dayjsLocale: 'km' },
  lo_LA: { antdLocale: 'en', antdPickerLocale: 'en_US', dayjsLocale: 'en' },
  lt: { antdLocale: 'lt', antdPickerLocale: 'lt_LT', dayjsLocale: 'lt' },
  lv_LV: { antdLocale: 'lv', antdPickerLocale: 'lv_LV', dayjsLocale: 'lv' },
  mk_MK: { antdLocale: 'mk', antdPickerLocale: 'mk_MK', dayjsLocale: 'mk' },
  nb_NO: { antdLocale: 'nb', antdPickerLocale: 'nb_NO', dayjsLocale: 'nb' },
  nl: { antdLocale: 'nl', antdPickerLocale: 'nl_NL', dayjsLocale: 'nl' },
  pl: { antdLocale: 'pl', antdPickerLocale: 'pl_PL', dayjsLocale: 'pl' },
  pt_BR: {
    antdLocale: 'pt-br',
    antdPickerLocale: 'pt_BR',
    dayjsLocale: 'pt-br',
  },
  pt_PT: { antdLocale: 'pt', antdPickerLocale: 'pt_PT', dayjsLocale: 'pt' },
  ro: { antdLocale: 'ro', antdPickerLocale: 'ro_RO', dayjsLocale: 'ro' },
  ru_RU: { antdLocale: 'ru', antdPickerLocale: 'ru_RU', dayjsLocale: 'ru' },
  sk: { antdLocale: 'sk', antdPickerLocale: 'sk_SK', dayjsLocale: 'sk' },
  sl: { antdLocale: 'sl', antdPickerLocale: 'sl', dayjsLocale: 'sl' },
  sq: { antdLocale: 'en', antdPickerLocale: 'en_US', dayjsLocale: 'sq' },
  sr: { antdLocale: 'sr', antdPickerLocale: 'sr_RS', dayjsLocale: 'sr' },
  sv: { antdLocale: 'sv', antdPickerLocale: 'sv_SE', dayjsLocale: 'sv' },
  th: { antdLocale: 'th', antdPickerLocale: 'th_TH', dayjsLocale: 'th' },
  tr_TR: { antdLocale: 'tr', antdPickerLocale: 'tr_TR', dayjsLocale: 'tr' },
  vi: { antdLocale: 'vi', antdPickerLocale: 'vi_VN', dayjsLocale: 'vi' },
  zh_TW: {
    antdLocale: 'zh-tw',
    antdPickerLocale: 'zh_TW',
    dayjsLocale: 'zh-tw',
  },
} as const satisfies Record<string, LocaleExpectation>;
