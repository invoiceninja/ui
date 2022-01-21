/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Element } from '@invoiceninja/cards';
import { InputField } from '@invoiceninja/forms';
import { useTranslation } from 'react-i18next';

export function BillingAddress() {
  const [t] = useTranslation();

  return (
    <>
      <Element leftSide={t('billing_address1')}>
        <InputField id="address1" />
      </Element>

      <Element leftSide={t('address2')}>
        <InputField id="address2" />
      </Element>

      <Element leftSide={t('city')}>
        <InputField id="city" />
      </Element>

      <Element leftSide={t('state')}>
        <InputField id="state" />
      </Element>

      <Element leftSide={t('postal_code')}>
        <InputField id="postal_code" />
      </Element>

      <Element leftSide={t('country')}>
        <InputField id="country" />
      </Element>
    </>
  );
}
