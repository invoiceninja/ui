/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { resolveKey } from 'pages/invoices/create/helpers/resolve-key';
import { useTranslation } from 'react-i18next';

export function useResolveTranslation() {
  const company = useCurrentCompany();
  const [t] = useTranslation();

  const aliases: Record<string, string> = {
    '$product.tax_rate1': company?.settings.tax_name1 || t('tax_rate1'),
    '$product.tax_rate2': company?.settings.tax_name2 || t('tax_rate2'),
    '$product.tax_rate3': company?.settings.tax_name3 || t('tax_rate3'),
  };

  return (key: string) => {
    if (Object.prototype.hasOwnProperty.call(aliases, key)) {
      return aliases[key];
    }

    const { property } = resolveKey(key);

    return property ? t(property) : t(key);
  };
}
