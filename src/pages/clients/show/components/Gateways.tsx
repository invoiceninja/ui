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
import { GatewayLogoName, GatewayTypeIcon } from './GatewayTypeIcon';
import { useCompanyGatewaysQuery } from '$app/common/queries/company-gateways';
import { useEffect, useState } from 'react';
import { CompanyGateway } from '$app/common/interfaces/company-gateway';
import { Button, Link } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';

interface Props {
  client: Client;
}

export function Gateways(props: Props) {
  const [t] = useTranslation();

  const { data: companyGatewaysResponse } = useCompanyGatewaysQuery();
  const { client } = props;

  const [companyGateways, setCompanyGateways] = useState<CompanyGateway[]>();

  const getCompanyGateway = (gatewayId: string) => {
    return companyGateways?.find(({ id }) => id === gatewayId);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isStripeGateway = (gatewayKey: string | undefined) => {
    return Boolean(
      gatewayKey &&
        (gatewayKey === 'd14dd26a37cecc30fdd65700bfb55b23' ||
          gatewayKey === 'd14dd26a47cecc30fdd65700bfb67b34')
    );
  };

  useEffect(() => {
    if (companyGatewaysResponse) {
      setCompanyGateways(companyGatewaysResponse.data.data);
    }
  }, [companyGatewaysResponse]);

  client.gateway_tokens = [
    {
      id: 't7kd92je1p3m',
      archived_at: 0,
      company_gateway_id: 'cg_8392jd82',
      created_at: 1699892400, // Nov 13, 2023
      gateway_customer_reference: 'cus_JK39d8H2',
      gateway_type_id: 'd791gw',
      meta: {
        brand: 'visa',
        last4: '4242',
        exp_month: '11',
        exp_year: '2025',
        type: 1,
      },
      is_default: true,
      is_deleted: false,
      token: 'tok_visa_4242',
      updated_at: 1699892400,
    },
    {
      id: 'p9mw73kf4n2q',
      archived_at: 0,
      company_gateway_id: 'cg_8392jd82',
      created_at: 1698682800, // Oct 30, 2023
      gateway_customer_reference: 'cus_JK39d8H2',
      gateway_type_id: 'd791gw',
      meta: {
        brand: 'mastercard',
        last4: '5555',
        exp_month: '03',
        exp_year: '2026',
        type: 1,
      },
      is_default: false,
      is_deleted: false,
      token: 'tok_mc_5555',
      updated_at: 1698682800,
    },
    {
      id: 'v5hn28rs9x4t',
      archived_at: 1697473200, // Oct 16, 2023
      company_gateway_id: 'cg_8392jd82',
      created_at: 1696263600, // Oct 2, 2023
      gateway_customer_reference: 'cus_JK39d8H2',
      gateway_type_id: 'd791gw',
      meta: {
        brand: 'amex',
        last4: '0005',
        exp_month: '08',
        exp_year: '2024',
        type: 1,
      },
      is_default: false,
      is_deleted: true,
      token: 'tok_amex_0005',
      updated_at: 1697473200,
    },
  ];

  console.log(client.gateway_tokens);

  return (
    <div className="col-span-12 md:col-span-6 lg:col-span-3">
      <InfoCard
        title={t('payment_methods')}
        className="max-h-96 overflow-y-auto h-full"
      >
        {client.gateway_tokens.map((token) => (
          <div
            key={token.id}
            className="flex items-center justify-between first:mt-3 mb-7 h-12"
          >
            <div className="flex flex-col space-y-1.5">
              <div className="inline-flex items-center space-x-1">
                <div>
                  <MdPayment fontSize={22} />
                </div>
                <div className="inline-flex items-center">
                  <span>{t('gateway')}</span>
                  <MdChevronRight size={20} />

                  <Link
                    to={route('/settings/gateways/:id/edit', {
                      id: token.company_gateway_id,
                    })}
                  >
                    {getCompanyGateway(token.company_gateway_id)?.label ||
                      'Stripe'}
                  </Link>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <GatewayTypeIcon name={token.meta.brand as GatewayLogoName} />

                <div className="flex items-center">
                  <span className="mt-1">****</span>
                  <span className="ml-1">{token.meta.last4}</span>
                </div>

                <span>
                  {token.meta.exp_month}/{token.meta.exp_year}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end justify-between h-full">
              <Link
                external
                to={route(
                  'https://dashboard.stripe.com/customers/:customerReference',
                  {
                    customerReference: token.gateway_customer_reference,
                  }
                )}
              >
                <Icon element={MdLaunch} size={18} />
              </Link>

              <div>
                <Button type="minimal">{t('default')}</Button>
              </div>
            </div>
          </div>
        ))}
      </InfoCard>
    </div>
  );
}
