/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import gatewayType from '$app/common/constants/gateway-type';

export function useResolveGatewayTypeTranslation() {
  return (id: string) => {
    return gatewayType[id as keyof typeof gatewayType] || 'other';
  };
}
