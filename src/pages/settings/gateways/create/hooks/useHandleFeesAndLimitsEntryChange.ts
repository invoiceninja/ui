/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import {
  CompanyGateway,
  FeesAndLimitsEntry,
} from 'common/interfaces/company-gateway';

export function useHandleFeesAndLimitsEntryChange(
  setCompanyGateway: React.Dispatch<
    React.SetStateAction<CompanyGateway | undefined>
  >
) {
  return (
    gatewayTypeId: string,
    field: keyof FeesAndLimitsEntry,
    value: string | number | boolean
  ) => {
    setCompanyGateway &&
      setCompanyGateway(
        (current) =>
          current && {
            ...current,
            fees_and_limits: {
              ...current.fees_and_limits,
              [gatewayTypeId]: {
                ...current.fees_and_limits[gatewayTypeId],
                [field]: value,
              },
            },
          }
      );
  };
}
