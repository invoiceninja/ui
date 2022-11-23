/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Tab } from '../../common/components/Tabs';

export function usePaymentGatewayTabs() {
  const { t } = useTranslation();

  const tabs: Tab[] = [
    { name: t('overview') },
    {
      name: t('credentials'),
    },
    {
      name: t('settings'),
    },
    {
      name: t('limits_and_fees'),
    },
  ];

  return tabs;
}
