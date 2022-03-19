/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { InputField } from '@invoiceninja/forms';
import { Container } from 'components/Container';
import Toggle from 'components/forms/Toggle';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';

export function Create() {
  const [t] = useTranslation();

  return (
    <Default title={t('new_payment')}>
      <Container>
        <Card title={t('new_payment')}>
          <Element leftSide={t('client')}>
            <InputField />
          </Element>
          <Element leftSide={t('amount')}>
            <InputField />
          </Element>
          <Element leftSide={t('invoice')}>
              
          </Element>
          <Element leftSide={t('payment_date')}>
            <InputField />
          </Element>
          <Element leftSide={t('transaction_reference')}>
            <InputField />
          </Element>
          <Element leftSide={t('private_notes')}>
            <InputField />
          </Element>
          <Element leftSide={t('send_email')}>
            <Toggle />
          </Element>
          <Element leftSide={t('convert_currency')}>
            <Toggle />
          </Element>
        </Card>
      </Container>
    </Default>
  );
}
