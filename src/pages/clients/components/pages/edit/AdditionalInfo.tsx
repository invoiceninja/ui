/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Tab } from '@headlessui/react';
import { Card, Element } from '@invoiceninja/cards';
import { InputField, SelectField } from '@invoiceninja/forms';
import { useCurrencies } from 'common/hooks/useCurrencies';
import { useLanguages } from 'common/hooks/useLanguages';
import { useQuery } from 'common/hooks/useQuery';
import { Client } from 'common/interfaces/client';
import { PaymentTerm } from 'common/interfaces/payment-term';
import { TabGroup } from 'components/TabGroup';
import { useTranslation } from 'react-i18next';

interface Props {
  client: Client;
  setClient: React.Dispatch<React.SetStateAction<Client | undefined>>;
}

// currency_id
// language_id
// payment_terms
// valid_until
// default_task_rate
// send_reminders

export function AdditionalInfo(props: Props) {
  const [t] = useTranslation();
  const currencies = useCurrencies();
  const languages = useLanguages();
  const { data: paymentTerms } = useQuery('/api/v1/payment_terms');

  // console.log(props.client);
  console.log(paymentTerms);

  return (
    <Card className="mt-4" title={t('additional_info')}>
      <TabGroup
        className="px-5"
        tabs={[t('settings'), t('notes'), t('classify')]}
      >
        <Tab.Panel>
          {currencies.length > 1 && (
            <Element leftSide={t('currency')}>
              <SelectField
                defaultValue={props.client.settings?.currency_id || ''}
              >
                <option value=""></option>
                {currencies.map((currency, index) => (
                  <option key={index} value={currency.id}>
                    {currency.name}
                  </option>
                ))}
              </SelectField>
            </Element>
          )}

          {languages.length > 1 && (
            <Element leftSide={t('language')}>
              <SelectField
                defaultValue={props.client.settings?.language_id || ''}
              >
                <option value=""></option>
                {languages.map((language, index) => (
                  <option key={index} value={language.id}>
                    {language.name}
                  </option>
                ))}
              </SelectField>
            </Element>
          )}

          {paymentTerms && (
            <Element leftSide={t('payment_terms')}>
              <SelectField>
                <option value=""></option>
                {paymentTerms.data.data.map(
                  (paymentTerm: PaymentTerm, index: number) => (
                    <option key={index} value={paymentTerm.id}>
                      {paymentTerm.name}
                    </option>
                  )
                )}
              </SelectField>
            </Element>
          )}

          {paymentTerms && (
            <Element leftSide={t('quote_valid_until')}>
              <SelectField>
                <option value=""></option>
                {paymentTerms.data.data.map(
                  (paymentTerm: PaymentTerm, index: number) => (
                    <option key={index} value={paymentTerm.id}>
                      {paymentTerm.name}
                    </option>
                  )
                )}
              </SelectField>
            </Element>
          )}

          <Element leftSide={t('task_rate')}>
            <InputField id="task_rate" />
          </Element>

          <Element leftSide={t('send_reminders')}>
            <SelectField>
              <option value=""></option>
              <option value="enabled">{t('enabled')}</option>
              <option value="disabled">{t('disabled')}</option>
            </SelectField>
          </Element>
        </Tab.Panel>

        <Tab.Panel></Tab.Panel>
        <Tab.Panel></Tab.Panel>
      </TabGroup>
    </Card>
  );
}
