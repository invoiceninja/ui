/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { CompanyGateway } from 'common/interfaces/company-gateway';
import { Field } from './useResolveInputField';

export function useHandleCredentialsChange(
  setCompanyGateway: React.Dispatch<
    React.SetStateAction<CompanyGateway | undefined>
  >
) {
  return (field: keyof Field, value: string | number | boolean) => {
    setCompanyGateway(
      (companyGateway) =>
        companyGateway && {
          ...companyGateway,
          config: JSON.stringify({
            ...JSON.parse(companyGateway.config),
            [field]: value,
          }),
        }
    );
  };
}
