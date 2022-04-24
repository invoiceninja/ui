/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '@invoiceninja/forms';
import { CompanyGateway } from 'common/interfaces/company-gateway';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { Check } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';

export function Gateways() {
  const [t] = useTranslation();

  const columns: DataTableColumns = [
    {
      id: 'label',
      label: t('label'),
      format: (field, resource: CompanyGateway) => (
        <Link
          to={generatePath('/settings/gateways/:id/edit', { id: resource.id })}
        >
          {field}
        </Link>
      ),
    },
    {
      id: 'test_mode',
      label: t('test_mode'),
      format: (field) => (field ? <Check size={20} /> : ''),
    },
  ];

  return (
    <DataTable
      columns={columns}
      resource="company_gateway"
      endpoint="/api/v1/company_gateways"
      linkToCreate="/settings/gateways/create"
      withResourcefulActions
    />
  );
}
