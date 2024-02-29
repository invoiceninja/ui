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
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import { CompanyGateway } from '$app/common/interfaces/company-gateway';
import { useCompanyGatewaysQuery } from '$app/common/queries/company-gateways';
import { SelectOption } from '$app/components/datatables/Actions';
import { useHandleCurrentCompanyChangeProperty } from '$app/pages/settings/common/hooks/useHandleCurrentCompanyChange';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { MultiValue, SingleValue } from 'react-select';

interface Params {
  currentGateways: CompanyGateway[];
  setCurrentGateways: Dispatch<SetStateAction<CompanyGateway[]>>;
}
export function useGatewayUtilities(params: Params) {
  const { isCompanySettingsActive } = useCurrentSettingsLevel();

  const { currentGateways, setCurrentGateways } = params;

  const companyChanges = useCompanyChanges();

  const handleChange = useHandleCurrentCompanyChangeProperty();

  const [currentSettingGateways, setCurrentSettingGateways] = useState<
    CompanyGateway[]
  >([]);

  const [status, setStatus] = useState<string>('active');

  const { data: companyGatewaysResponse } = useCompanyGatewaysQuery({
    status,
  });

  const onStatusChange = (
    options:
      | MultiValue<{ value: string; label: string }>
      | SingleValue<{ value: string; label: string }>
  ) => {
    const values = (options as SelectOption[]).map((option) => option.value);

    setStatus(values.join(','));
  };

  const handleRemoveGateway = (gatewayId: string) => {
    const filteredGateways = currentGateways.filter(
      ({ id }) => id !== gatewayId
    );

    setCurrentGateways(filteredGateways);

    if (filteredGateways.length) {
      handleChange(
        'settings.company_gateway_ids',
        filteredGateways.map(({ id }) => id).join(',')
      );
    } else {
      handleChange('settings.company_gateway_ids', '0');
    }
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

  const removeDuplicatedGateways = (gateways: CompanyGateway[]) => {
    const uniqueGateways: Record<string, CompanyGateway> = {};

    gateways.forEach((item) => {
      if (!uniqueGateways[item.id]) {
        uniqueGateways[item.id] = item;
      }
    });

    return Object.values(uniqueGateways);
  };

  useEffect(() => {
    if (companyGatewaysResponse) {
      if (companyChanges?.settings.company_gateway_ids !== '0') {
        if (companyChanges?.settings.company_gateway_ids) {
          let filteredCompanyGateways =
            companyChanges.settings.company_gateway_ids
              .split(',')
              .map((id: string) =>
                companyGatewaysResponse.data.data.find(
                  (gateway: CompanyGateway) => gateway.id === id
                )
              );

          filteredCompanyGateways = filteredCompanyGateways.filter(
            (companyGateway: CompanyGateway) => companyGateway
          );

          if (isCompanySettingsActive) {
            (companyGatewaysResponse.data.data as CompanyGateway[]).forEach(
              (companyGateway) => {
                const isAlreadyAdded = filteredCompanyGateways.some(
                  (gateway: CompanyGateway) => gateway.id === companyGateway.id
                );

                if (!isAlreadyAdded) {
                  filteredCompanyGateways.push(companyGateway);
                }
              }
            );
          }

          setCurrentSettingGateways(
            removeDuplicatedGateways(filteredCompanyGateways)
          );
        } else {
          setCurrentSettingGateways(
            removeDuplicatedGateways(companyGatewaysResponse.data.data)
          );
        }
      } else {
        setCurrentSettingGateways([]);
      }
    }
  }, [companyGatewaysResponse]);

  return {
    gateways: currentSettingGateways,
    handleRemoveGateway,
    handleReset,
    onStatusChange,
  };
}
