/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Schedule } from 'common/interfaces/schedule';
import { DataTableColumns } from 'components/DataTable';
import { useTranslation } from 'react-i18next';

export function useScheduleColumns() {
  const [t] = useTranslation();

  const columns: DataTableColumns<Schedule> = [
    {
      id: 'name',
      label: t('name'),
    },
    {
      id: 'template',
      label: t('template'),
      format: (value) => t(value as string),
    },
    {
      id: 'next_run',
      label: t('next_run'),
    },
  ];

  return columns;
}
