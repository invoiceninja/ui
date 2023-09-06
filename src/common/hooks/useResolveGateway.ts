/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { CompanyGateway } from '../interfaces/company-gateway';
import { useCompanyGatewaysQuery } from '../queries/company-gateways';

export function useResolveGateway() {
  const { data: gateways } = useCompanyGatewaysQuery();

  return (id: string) =>
    gateways?.data.data?.find((gateway: CompanyGateway) => gateway.id === id);
}
