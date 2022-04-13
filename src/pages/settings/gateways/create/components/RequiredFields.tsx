/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { Gateway } from 'common/interfaces/statics';
import { Divider } from 'components/cards/Divider';
import Toggle from 'components/forms/Toggle';
import { useTranslation } from 'react-i18next';

interface Props {
  gateway: Gateway;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function RequiredFields(props: Props) {
  const [t] = useTranslation();

  return (
    <Card title={t('required_fields')}>
      <Element leftSide={t('client_name')}>
        <Toggle />
      </Element>

      <Element leftSide={t('client_phone')}>
        <Toggle />
      </Element>

      <Element leftSide={t('contact_name')}>
        <Toggle />
      </Element>

      <Element leftSide={t('contact_email')}>
        <Toggle />
      </Element>

      <Element leftSide={t('postal_code')}>
        <Toggle />
      </Element>

      <Element leftSide={t('cvv')}>
        <Toggle />
      </Element>

      <Element leftSide={t('billing_address')}>
        <Toggle />
      </Element>

      <Element leftSide={t('shipping_address')}>
        <Toggle />
      </Element>

      <Divider />

      <Element leftSide={t('update_address')}>
        <Toggle label={t('update_address_help')} />
      </Element>
    </Card>
  );
}
