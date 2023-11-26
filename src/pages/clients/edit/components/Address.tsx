/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '$app/components/cards';
import { useTranslation } from 'react-i18next';
import { TabGroup } from '$app/components/TabGroup';
import { BillingAddress } from './address/BillingAddress';
import { ShippingAddress } from './address/ShippingAddress';
import { Client } from '$app/common/interfaces/client';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Dispatch, SetStateAction } from 'react';

interface Props {
  client: Client | undefined;
  setClient: Dispatch<SetStateAction<Client | undefined>>;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  errors: ValidationBag | undefined;
}

export function Address(props: Props) {
  const [t] = useTranslation();

  return (
    <Card title={t('address')}>
      <TabGroup
        className="px-5"
        tabs={[t('billing_address'), t('shipping_address')]}
      >
        <div className="-mx-5">
          <BillingAddress {...props} />
        </div>

        <div className="-mx-5">
          <ShippingAddress {...props} />
        </div>
      </TabGroup>
    </Card>
  );
}
