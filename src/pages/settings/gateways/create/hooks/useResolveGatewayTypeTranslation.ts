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
import { useTranslation } from 'react-i18next';

export function useResolveGatewayTypeTranslation() {
  const [t] = useTranslation();

  return (id: string) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return t(gatewayType[id] || 'other');
  };
}
