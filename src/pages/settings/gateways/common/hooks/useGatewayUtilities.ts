/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { CompanyGateway } from '$app/common/interfaces/company-gateway';
import { useCompanyGatewaysQuery } from '$app/common/queries/company-gateways';
import { updateChanges } from '$app/common/stores/slices/company-users';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

interface Params {
  currentGateways: CompanyGateway[];
  setCurrentGateways: Dispatch<SetStateAction<CompanyGateway[]>>;
}
export function useGatewayUtilities(params: Params) {
  const dispatch = useDispatch();

  const { currentGateways, setCurrentGateways } = params;

  const companyChanges = useCompanyChanges();

  const [currentSettingGateways, setCurrentSettingGateways] = useState<
    CompanyGateway[]
  >([]);

  const { data: companyGatewaysResponse } = useCompanyGatewaysQuery({
    status: 'active',
  });

  const handleChange = (property: string, value: string) => {
    dispatch(
      updateChanges({
        object: 'company',
        property,
        value,
      })
    );
  };

  const handleRemoveGateway = (gatewayId: string) => {
    const filteredGateways = currentGateways.filter(
      ({ id }) => id !== gatewayId
    );

    setCurrentGateways(filteredGateways);

    handleChange(
      'settings.company_gateway_ids',
      filteredGateways.map(({ id }) => id).join(',')
    );
  };

  const handleReset = () => {
    const availableGateways =
      (companyGatewaysResponse?.data.data as CompanyGateway[]) || [];

    if (availableGateways) {
      setCurrentGateways(availableGateways);

      handleChange(
        'settings.company_gateway_ids',
        availableGateways.map(({ id }) => id).join(',')
      );
    }
  };

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

        setCurrentSettingGateways(filteredCompanyGateways);
      } else {
        setCurrentSettingGateways(companyGatewaysResponse.data.data);
      }
    }
  }, [companyGatewaysResponse]);

  return {
    gateways: currentSettingGateways,
    handleChange,
    handleRemoveGateway,
    handleReset,
  };
}
