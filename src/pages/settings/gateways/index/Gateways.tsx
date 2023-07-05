/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '$app/components/forms';
import { CompanyGateway } from '$app/common/interfaces/company-gateway';
import { DataTable, DataTableColumns } from '$app/components/DataTable';
import { Check } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { route } from '$app/common/helpers/route';
import { EntityStatus } from '$app/components/EntityStatus';
import { Tooltip } from '$app/components/Tooltip';
import { MdWarning } from 'react-icons/md';

export function Gateways() {
  const [t] = useTranslation();

  const STRIPE_CONNECT = 'd14dd26a47cecc30fdd65700bfb67b34';

  const columns: DataTableColumns<CompanyGateway> = [
    {
      id: 'status_id',
      label: t('status'),
      format: (_, gateway) => <EntityStatus entity={gateway} />,
    },
    {
      id: 'label',
      label: t('label'),
      format: (field, gateway) => {
        const gatewayConfig = JSON.parse(gateway.config);

        return (
          <div className="flex items-center space-x-2">
            <Link
              to={route('/settings/gateways/:id/edit?tab=:tab', {
                id: gateway.id,
                tab: STRIPE_CONNECT === gateway.gateway_key ? 1 : 0,
              })}
            >
              {field}
            </Link>

            {STRIPE_CONNECT === gateway.gateway_key &&
              !gatewayConfig.account_id && (
                <Tooltip
                  message={t('stripe_connect_migration_title') as string}
                  width="auto"
                  placement="top"
                >
                  <div className="flex space-x-2">
                    <MdWarning color="red" size={22} />
                    <MdWarning color="red" size={22} />
                  </div>
                </Tooltip>
              )}
          </div>
        );
      },
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
      endpoint="/api/v1/company_gateways?sort=id|desc"
      bulkRoute="/api/v1/company_gateways/bulk"
      linkToCreate="/settings/gateways/create"
      linkToEdit="/settings/gateways/:id/edit"
      withResourcefulActions
    />
  );
}
