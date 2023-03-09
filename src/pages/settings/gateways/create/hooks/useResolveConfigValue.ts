/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { CompanyGateway } from '$app/common/interfaces/company-gateway';

export function useResolveConfigValue(companyGateway: CompanyGateway) {
  const config = JSON.parse(companyGateway.config);

  return (field: string) => {
    return config[field] || '';
  };
}
