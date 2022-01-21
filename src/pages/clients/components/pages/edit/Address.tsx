/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '@invoiceninja/cards';
import { useTranslation } from 'react-i18next';
import { Tab } from '@headlessui/react';
import { TabGroup } from 'components/TabGroup';
import { BillingAddress } from './address/BillingAddress';
import { ShippingAddress } from './address/ShippingAddress';
import { Client } from 'common/interfaces/client';

interface Props {
  client: Client;
  setClient: React.Dispatch<React.SetStateAction<Client | undefined>>;
}

export function Address(props: Props) {
  const [t] = useTranslation();

  return (
    <Card className="col-span-12 xl:col-span-6" title={t('address')}>
      <TabGroup
        className="px-5"
        tabs={[t('billing_address'), t('shipping_address')]}
      >
        <Tab.Panel>
          <BillingAddress {...props} />
        </Tab.Panel>

        <Tab.Panel>
          <ShippingAddress />
        </Tab.Panel>
      </TabGroup>
    </Card>
  );
}
