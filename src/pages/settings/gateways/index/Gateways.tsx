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
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import { GatewaysTable } from '../common/components/GatewaysTable';
import { useCompanyGatewaysQuery } from '$app/common/queries/company-gateways';
import { useEffect, useState } from 'react';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';

export function Gateways() {
  const [t] = useTranslation();

  const companyChanges = useCompanyChanges();

  const { isCompanySettingsActive, isGroupSettingsActive } =
    useCurrentSettingsLevel();

  const { data: companyGatewaysResponse } = useCompanyGatewaysQuery({
    status: 'active',
    enabled: isGroupSettingsActive,
  });

  const [groupCompanyGateways, setGroupCompanyGateways] = useState<
    CompanyGateway[]
  >([]);

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

        const showWarning =
          STRIPE_CONNECT === gateway.gateway_key && !gatewayConfig.account_id;

        return (
          <div className="flex items-center space-x-2">
            <Link
              to={route('/settings/gateways/:id/edit?tab=:tab', {
                id: gateway.id,
                tab: showWarning ? 1 : 0,
              })}
            >
              {field}
            </Link>

            {showWarning && (
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

  useEffect(() => {
    if (companyGatewaysResponse) {
      if (companyChanges?.settings.company_gateway_ids) {
        const filteredCompanyGateways =
          companyChanges.settings.company_gateway_ids
            .split(',')
            .map((id: string) =>
              companyGatewaysResponse.data.data.find(
                (gateway: CompanyGateway) => gateway.id === id
              )
            );

        setGroupCompanyGateways(filteredCompanyGateways);
      } else {
        const filteredCompanyGateways =
          companyGatewaysResponse.data.data.filter(
            (gateway: CompanyGateway) =>
              !gateway.archived_at && !gateway.is_deleted
          );

        setGroupCompanyGateways(filteredCompanyGateways);
      }
    }
  }, [companyGatewaysResponse]);

  return (
    <>
      {isCompanySettingsActive && (
        <DataTable
          columns={columns}
          resource="company_gateway"
          endpoint="/api/v1/company_gateways?sort=id|desc"
          bulkRoute="/api/v1/company_gateways/bulk"
          linkToCreate="/settings/gateways/create"
          linkToEdit="/settings/gateways/:id/edit"
          withResourcefulActions
        />
      )}

      {isGroupSettingsActive && (
        <GatewaysTable
          gateways={groupCompanyGateways}
          allGateways={companyGatewaysResponse?.data.data}
        />
      )}
    </>
  );
}
