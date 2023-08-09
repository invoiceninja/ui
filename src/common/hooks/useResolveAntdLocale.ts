/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export function useResolveAntdLocale() {
  return (appLanguage: string) => {
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
      default:
        return import('antd/locale/en_US');
    }
  };
}
