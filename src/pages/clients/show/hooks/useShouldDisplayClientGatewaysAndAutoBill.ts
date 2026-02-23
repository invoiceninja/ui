import { useGetSetting } from '$app/common/hooks/useGetSetting';
import { Client } from '$app/common/interfaces/client';

export function useShouldDisplayClientGatewaysAndAutoBill() {
  const getSetting = useGetSetting();

  return (client: Client | undefined) => {
    if (!client) return false;

    const currentCompanyGatewayIds = getSetting(client, 'company_gateway_ids');

    if (currentCompanyGatewayIds === '0') return false;

    const shouldDisplayClientGatewaysAndAutoBill =
      typeof currentCompanyGatewayIds === 'undefined' ||
      currentCompanyGatewayIds.split(',').length > 0;

    return shouldDisplayClientGatewaysAndAutoBill;
  };
}
