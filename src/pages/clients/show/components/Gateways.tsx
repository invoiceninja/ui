/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Client } from '$app/common/interfaces/client';
import { InfoCard } from '$app/components/InfoCard';
import { useTranslation } from 'react-i18next';
import { MdChevronRight, MdLaunch, MdPayment } from 'react-icons/md';
import { route } from '$app/common/helpers/route';
import { GatewayTypeIcon } from './GatewayTypeIcon';
import { useCompanyGatewaysQuery } from '$app/common/queries/company-gateways';
import { useEffect, useState } from 'react';
import { CompanyGateway } from '$app/common/interfaces/company-gateway';
import { Link } from '$app/components/forms';

interface Props {
  client: Client;
}

export function Gateways(props: Props) {
  const [t] = useTranslation();

  const { data: companyGatewaysResponse } = useCompanyGatewaysQuery();
  const { client } = props;

  const [companyGateways, setCompanyGateways] = useState<CompanyGateway[]>();

  const getCompanyGatewayLabel = (gatewayId: string) => {
    const filteredGateways = companyGateways?.filter(
      ({ id }) => id === gatewayId
    );

    return filteredGateways && filteredGateways[0].label;
  };

  useEffect(() => {
    if (companyGatewaysResponse) {
      setCompanyGateways(companyGatewaysResponse.data.data);
    }
  }, [companyGatewaysResponse]);

  return (
    <div className="col-span-12 lg:col-span-4">
      <InfoCard title={t('payment_methods')}>
        {client.gateway_tokens.map((token) => (
          <div
            key={token.id}
            className="flex items-center justify-between my-2.5"
          >
            <div>
              <div className="inline-flex items-center space-x-1">
                <div>
                  <MdPayment fontSize={22} />
                </div>
                <div className="inline-flex items-center">
                  <span> {t('gateway')}</span>
                  <MdChevronRight size={20} />
                  <span>
                    {getCompanyGatewayLabel(token.company_gateway_id)}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <GatewayTypeIcon name={token.meta.brand} />

                <div className="flex items-center">
                  <span className="mt-1">****</span>
                  <span className="ml-1">{token.meta.last4}</span>
                </div>

                <span>
                  {token.meta.exp_month}/{token.meta.exp_year}
                </span>
              </div>
            </div>

            <div>
              <Link
                to={route('/settings/gateways/:id/edit', {
                  id: token.company_gateway_id,
                })}
              >
                <MdLaunch size={18} />
              </Link>
            </div>
          </div>
        ))}
      </InfoCard>
    </div>
  );
}
