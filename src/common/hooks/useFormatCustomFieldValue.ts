/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompany } from './useCurrentCompany';
import { useCurrentCompanyDateFormats } from './useCurrentCompanyDateFormats';
import { date } from '$app/common/helpers';

export function useFormatCustomFieldValue() {
  const company = useCurrentCompany();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const customFields = company?.custom_fields;

  return (fieldKey: string, value: string) => {
    if (customFields && customFields[fieldKey] && value) {
      const currentField = customFields[fieldKey];

      if (currentField.split('|')[1] === 'date') {
        return date(value, dateFormat);
      }
    }

    return value;
  };
}
