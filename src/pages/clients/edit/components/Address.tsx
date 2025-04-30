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
import { useColorScheme } from '$app/common/colors';

interface Props {
  client: Client | undefined;
  setClient: Dispatch<SetStateAction<Client | undefined>>;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  errors: ValidationBag | undefined;
}

export function Address(props: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();

  return (
    <Card
      className="shadow-sm"
      title={t('address')}
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
      withoutBodyPadding
    >
      <div className="pt-2">
        <TabGroup
          tabs={[t('billing_address'), t('shipping_address')]}
          withHorizontalPadding
          horizontalPaddingWidth="1.5rem"
          fullRightPadding
        >
          <div>
            <BillingAddress {...props} />
          </div>

          <div>
            <ShippingAddress {...props} />
          </div>
        </TabGroup>
      </div>
    </Card>
  );
}
