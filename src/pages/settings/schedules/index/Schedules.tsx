/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from 'common/hooks/useTitle';
import { DataTable } from 'components/DataTable';
import { Settings } from 'components/layouts/Settings';
import { useTranslation } from 'react-i18next';
import { useScheduleColumns } from '../common/hooks/useScheduleColumns';

export function Schedules() {
  const { documentTitle } = useTitle('schedules');

  const [t] = useTranslation();

  const columns = useScheduleColumns();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('schedules'), href: '/settings/schedules' },
  ];

  return (
    <Settings
      title={documentTitle}
      docsLink="docs/advanced-settings/#schedules"
      breadcrumbs={pages}
    >
      <DataTable
        resource="schedule"
        endpoint="/api/v1/task_schedulers"
        columns={columns}
        linkToCreate="/settings/schedules/create"
        linkToEdit="/settings/schedules/:id/edit"
        withResourcefulActions
      />
    </Settings>
  );
}
