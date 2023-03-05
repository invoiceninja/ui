/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { customField } from 'components/CustomField';
import { useTranslation } from 'react-i18next';
import { useCurrentCompany } from './useCurrentCompany';

interface Params {
  entity:
    | 'client'
    | 'product'
    | 'invoice'
    | 'payment'
    | 'project'
    | 'task'
    | 'vendor'
    | 'expense'
    | 'quote'
    | 'credit';
}

export function useEntityCustomFields(params: Params) {
  const [t] = useTranslation();
  const company = useCurrentCompany();
  const customFields = company?.custom_fields;

  const { entity } = params;

  const fields: string[] = [];

  if (customFields) {
    for (let i = 1; i < 5; i++) {
      const currentField = customFields[entity + i.toString()]
        ? customField(customFields[entity + i.toString()]).label()
        : t(`custom${i.toString()}`);

      fields.push(currentField);
    }
  }

  return fields;
}
