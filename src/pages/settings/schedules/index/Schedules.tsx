/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { useTitle } from '$app/common/hooks/useTitle';
import { useSchedulesTotalQuery } from '$app/common/queries/schedules';
import { DataTable } from '$app/components/DataTable';
import { Settings } from '$app/components/layouts/Settings';
import { Spinner } from '$app/components/Spinner';
import {
  SchedulesPlaceholder,
  useShowSchedulesPlaceholder,
} from '../common/components/SchedulesPlaceholder';
import { useScheduleColumns } from '../common/hooks/useScheduleColumns';

export function Schedules() {
  const { documentTitle } = useTitle('schedules');

  const [t] = useTranslation();

  const columns = useScheduleColumns();

  const { isLoading } = useSchedulesTotalQuery();
  const showPlaceholder = useShowSchedulesPlaceholder();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('schedules'), href: '/settings/schedules' },
  ];

  return (
    <Settings
      title={documentTitle}
      docsLink="en/advanced-settings/#schedules"
      breadcrumbs={pages}
    >
      {isLoading && <Spinner />}

      <SchedulesPlaceholder />

      {!isLoading && !showPlaceholder && (
        <DataTable
          resource="schedule"
          endpoint="/api/v1/task_schedulers?sort=id|desc"
          bulkRoute="/api/v1/task_schedulers/bulk"
          columns={columns}
          linkToCreate="/settings/schedules/create"
          linkToEdit="/settings/schedules/:id/edit"
          withResourcefulActions
          enableSavingFilterPreference
        />
      )}
    </Settings>
  );
}
