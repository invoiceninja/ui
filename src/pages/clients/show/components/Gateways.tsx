/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Client } from 'common/interfaces/client';
import { InfoCard } from 'components/InfoCard';
import { useTranslation } from 'react-i18next';
import { MdPayment } from 'react-icons/md';
import { IoIosArrowForward } from 'react-icons/io';
import { VscLinkExternal } from 'react-icons/vsc';
import { useNavigate } from 'react-router-dom';
import { route } from 'common/helpers/route';
import { GatewayTypeIcon } from './GatewayTypeIcon';
import { useCompanyGatewaysQuery } from 'common/queries/company-gateways';
import { useEffect, useState } from 'react';
import { CompanyGateway } from 'common/interfaces/company-gateway';

interface Props {
  client: Client;
}

export function Gateways(props: Props) {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const { data: companyGatewaysResponse } = useCompanyGatewaysQuery();

  const [companyGateways, setCompanyGateways] = useState<CompanyGateway[]>();

  const { client } = props;

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
    <div className="col-span-12 lg:col-span-5 xl:col-span-4">
      {companyGateways && (
        <InfoCard
          title={t('gateway_tokens')}
          value={
            <div className="mt-3 space-y-7">
              {client.gateway_tokens.map((gateway) => (
                <div
                  key={gateway.token}
                  className="flex flex-1 justify-between xl:justify-start items-center cursor-pointer px-2 hover:bg-gray-50"
                  onClick={() =>
                    navigate(
                      route('/settings/gateways/:id/edit', {
                        id: gateway.company_gateway_id,
                      })
                    )
                  }
                >
                  <MdPayment fontSize={22} />

                  <div className="flex flex-1 justify-between flex-col ml-5">
                    <div className="flex items-center">
                      <span className="font-semibold text-base">
                        {t('gateway')}
                      </span>

                      <IoIosArrowForward className="ml-1 font-semibold text-base" />

                      <span className="font-semibold text-base ml-1">
                        {getCompanyGatewayLabel(gateway.company_gateway_id)}
                      </span>
                    </div>

                    <div className="flex items-center mt-1">
                      <GatewayTypeIcon name={gateway.meta.brand} />

                      <div className="flex items-center ml-3">
                        <span className="mt-1">****</span>
                        <span className="ml-1">{gateway.meta.last4}</span>
                      </div>

                      <span className="ml-2">
                        {gateway.meta.exp_month}/{gateway.meta.exp_year}
                      </span>
                    </div>
                  </div>

                  <VscLinkExternal fontSize={17} />
                </div>
              ))}
            </div>
          }
          className="h-full"
        />
      )}
    </div>
  );
}
