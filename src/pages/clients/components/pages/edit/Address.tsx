/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, CardContainer } from '@invoiceninja/cards';
import { useTranslation } from 'react-i18next';
import { Tab } from '@headlessui/react';
import { TabGroup } from 'components/TabGroup';
import { BillingAddress } from '.';

export function Address() {
  const [t] = useTranslation();

  return (
    <Card className="col-span-12 xl:col-span-6" title={t('address')}>
      <TabGroup
        className="px-5"
        tabs={[t('billing_address'), t('shipping_address')]}
      >
        <Tab.Panel>
          <BillingAddress />
        </Tab.Panel>

        <Tab.Panel>Shipping address</Tab.Panel>
      </TabGroup>
    </Card>
  );
}
