/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { resolveKey } from '$app/pages/invoices/common/helpers/resolve-key';
import { useTranslation } from 'react-i18next';

interface Params {
  type?: 'product' | 'task';
}

export function useResolveTranslation(params?: Params) {
  const [t] = useTranslation();
  const company = useCurrentCompany();

  const { type } = params || {};

  const customFields =
    type === 'product' || !type
      ? ['product1', 'product2', 'product3', 'product4']
      : ['task1', 'task2', 'task3', 'task4'];

  const aliases: Record<string, string> = {
    '$product.tax_rate1': t('tax_rate1'),
    '$product.tax_rate2': t('tax_rate2'),
    '$product.tax_rate3': t('tax_rate3'),
  };

  return (key: string, delimiter = '.') => {
    if (Object.prototype.hasOwnProperty.call(aliases, key)) {
      return aliases[key];
    }

    const { property } = resolveKey(key, delimiter);

    if (customFields.includes(property)) {
      const customField = company.custom_fields?.[property];

      if (customField) {
        return customField.split('|')[0];
      }
    }

    return property ? t(property) : t(key);
  };
}
