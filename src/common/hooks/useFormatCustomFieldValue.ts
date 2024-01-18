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
import { useTranslation } from 'react-i18next';
import { AvailableTypes } from '$app/pages/settings/custom-fields/components';

export function useFormatCustomFieldValue() {
  const [t] = useTranslation();
  const company = useCurrentCompany();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const customFields = company?.custom_fields;

  return (fieldKey: string, value: string) => {
    if (customFields && customFields[fieldKey]) {
      const currentField = customFields[fieldKey];

      if (currentField?.split('|')[1] === AvailableTypes.Date && value) {
        return date(value, dateFormat);
      }

      if (currentField?.split('|')[1] === AvailableTypes.Switch) {
        return value ? t('yes') : t('no');
      }
    }

    return value;
  };
}
