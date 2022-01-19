/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import paymentStatus from 'common/constants/payment-status';
import { Link } from '@invoiceninja/forms';
import { date } from 'common/helpers';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { StatusBadge } from 'components/StatusBadge';
import { useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';

export function Projects() {
  const [t] = useTranslation();
  const { id } = useParams();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const columns: DataTableColumns = [
    {
      id: 'name',
      label: t('name'),
      format: (value, resource) => (
        <Link to={generatePath('/projects/:id', { id: resource.id })}>
          {value}
        </Link>
      ),
    },
    {
      id: 'task_rate',
      label: t('task_rate'),
    },
    {
      id: 'due_date',
      label: t('due_date'),
      format: (value) => date(value, dateFormat),
    },
    {
      id: 'public_notes',
      label: t('public_notes'),
    },
    {
      id: 'private_notes',
      label: t('private_notes'),
    },
    {
      id: 'budgeted_hours',
      label: t('budgeted_hours'),
    },
  ];

  return (
    <DataTable
      resource="project"
      endpoint={`/api/v1/projects?client_id=${id}`}
      columns={columns}
      withResourcefulActions
      bulkRoute="/api/v1/projects/bulk"
    />
  );
}
