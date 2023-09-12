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
import { updateChanges } from '$app/common/stores/slices/company-users';
import { SelectOption } from '$app/components/datatables/Actions';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { MultiValue, SingleValue } from 'react-select';

interface Params {
  currentGateways: CompanyGateway[];
  setCurrentGateways: Dispatch<SetStateAction<CompanyGateway[]>>;
}
export function useGatewayUtilities(params: Params) {
  const dispatch = useDispatch();

  const { isCompanySettingsActive } = useCurrentSettingsLevel();

  const { currentGateways, setCurrentGateways } = params;

  const companyChanges = useCompanyChanges();

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
    onStatusChange,
  };
}
