/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { DateRangeProperty } from '$app/components/DataTable';
import { useTranslation } from 'react-i18next';

export function useDateRangeProperties() {
  const [t] = useTranslation();

  const properties: DateRangeProperty[] = [
    {
      value: 'date',
      label: t('date'),
    },
    {
      value: 'due_date',
      label: t('due_date'),
    },
  ];

  return properties;
}
