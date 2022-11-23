/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Tab } from '../../common/components/Tabs';

export function usePaymentGatewayTabs() {
  const tabs: Tab[] = [
    { name: 'overview' },
    {
      name: 'credentials',
    },
    {
      name: 'settings',
    },
    {
      name: 'required_fields',
    },
    {
      name: 'limits_and_fees',
    },
  ];

  return tabs;
}
