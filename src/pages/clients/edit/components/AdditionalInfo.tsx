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
import MDEditor from '@uiw/react-md-editor';
import { useCompanyChanges } from 'common/hooks/useCompanyChanges';
import { useCurrencies } from 'common/hooks/useCurrencies';
import { useLanguages } from 'common/hooks/useLanguages';
import { useQuery } from 'common/hooks/useQuery';
import { Client } from 'common/interfaces/client';
import { PaymentTerm } from 'common/interfaces/payment-term';
import { useStaticsQuery } from 'common/queries/statics';
import { injectInChanges, updateChanges } from 'common/stores/slices/company-users';
import Toggle from 'components/forms/Toggle';
import { TabGroup } from 'components/TabGroup';
import { cloneDeep, set } from 'lodash';
import { Field } from 'pages/settings/custom-fields/components';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

interface Props {
  client: Client | undefined;
  setClient: React.Dispatch<React.SetStateAction<Client | undefined>>;
}
export function AdditionalInfo(props: Props) {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const currencies = useCurrencies();
  const languages = useLanguages();

  const { data: paymentTerms } = useQuery('/api/v1/payment_terms');
  const { data: statics } = useStaticsQuery();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const client = { ...props.client };

    props.setClient(set(client as Client, event.target.id, event.target.value));
  };

  const company = useCompanyChanges();

  const handleCustomFieldChange = (field: string, value: string) => {
    const [label] = value.split('|');

    if (label === '') {
      // If we don't have a content, we will remove the field from the company.custom_fields.

      const _company = cloneDeep(company);

      delete _company.custom_fields[field];

      return dispatch(injectInChanges({ object: 'company', data: _company }));
    }

    dispatch(
      updateChanges({
        object: 'company',
        property: `custom_fields.${field}`,
        value,
      })
    );
  };

  return (
    <Card className="mt-4" title={t('additional_info')}>
      <TabGroup
        className="px-5"
        tabs={[
          t('settings'),
          t('notes'),
          t('classify'),
          t('client_fields'),
          t('contact_fields'),
        ]}
      >
        <Tab.Panel>
          {currencies.length > 1 && (
            <Element leftSide={t('currency')}>
              <SelectField
                id="settings.currency_id"
                defaultValue={props.client?.settings?.currency_id || ''}
                onChange={handleChange}
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
                id="settings.language_id"
                defaultValue={props.client?.settings?.language_id || ''}
                onChange={handleChange}
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
              <SelectField
                id="settings.payment_terms"
                defaultValue={props.client?.settings?.payment_terms || ''}
                onChange={handleChange}
              >
                <option value=""></option>
                {paymentTerms.data.data.map(
                  (paymentTerm: PaymentTerm, index: number) => (
                    <option key={index} value={paymentTerm.num_days}>
                      {paymentTerm.name}
                    </option>
                  )
                )}
              </SelectField>
            </Element>
          )}

          {paymentTerms && (
            <Element leftSide={t('quote_valid_until')}>
              <SelectField
                id="settings.valid_until"
                defaultValue={props.client?.settings?.valid_until || ''}
                onChange={handleChange}
              >
                <option value=""></option>
                {paymentTerms.data.data.map(
                  (paymentTerm: PaymentTerm, index: number) => (
                    <option key={index} value={paymentTerm.num_days}>
                      {paymentTerm.name}
                    </option>
                  )
                )}
              </SelectField>
            </Element>
          )}

          <Element leftSide={t('task_rate')}>
            <InputField
              id="settings.default_task_rate"
              value={props.client?.settings?.default_task_rate || ''}
              onChange={handleChange}
            />
          </Element>

          <Element leftSide={t('send_reminders')}>
            <Toggle
              checked={props.client?.settings.send_reminders}
              onChange={(value) =>
                props.setClient(
                  (client) =>
                    client && set(client, 'settings.send_reminders', value)
                )
              }
            />
          </Element>
        </Tab.Panel>

        <Tab.Panel>
          <Element leftSide={t('public_notes')}>
            <MDEditor
              value={props.client?.public_notes}
              onChange={(value) => {
                const client = { ...props.client };
                client.public_notes = value as string;

                props.setClient(client as Client);
              }}
            />
          </Element>

          <Element leftSide={t('private_notes')}>
            <MDEditor
              value={props.client?.private_notes}
              onChange={(value) => {
                const client = { ...props.client };
                client.private_notes = value as string;

                props.setClient(client as Client);
              }}
            />
          </Element>
        </Tab.Panel>

        <Tab.Panel>
          {statics && (
            <Element leftSide={t('size_id')}>
              <SelectField
                id="size_id"
                defaultValue={props.client?.size_id || ''}
                onChange={handleChange}
              >
                <option value=""></option>

                {statics.data.sizes.map(
                  (size: { id: string; name: string }, index: number) => (
                    <option key={index} value={size.id}>
                      {size.name}
                    </option>
                  )
                )}
              </SelectField>
            </Element>
          )}

          {statics && (
            <Element leftSide={t('industry')}>
              <SelectField
                id="industry_id"
                defaultValue={props.client?.industry_id || ''}
                onChange={handleChange}
              >
                <option value=""></option>

                {statics.data.industries.map(
                  (size: { id: string; name: string }, index: number) => (
                    <option key={index} value={size.id}>
                      {size.name}
                    </option>
                  )
                )}
              </SelectField>
            </Element>
          )}
        </Tab.Panel>

        <Tab.Panel>
          <Element
            leftSide={
              <div className="inline-flex items-center space-x-2">
                <span>{t('note')}</span>
                <span className="text-red-600">*</span>
              </div>
            }
          >
            Custom fields apply to all clients, they are not specific to this
            one. <i>Needs translation.</i>
          </Element>

          {['client1', 'client2', 'client3', 'client4'].map((field) => (
            <Field
              key={field}
              initialValue={company.custom_fields[field]}
              field={field}
              placeholder={t('client_field')}
              onChange={(value) => handleCustomFieldChange(field, value)}
            />
          ))}
        </Tab.Panel>

        <Tab.Panel>
          <Element
            leftSide={
              <div className="inline-flex items-center space-x-2">
                <span>{t('note')}</span>
                <span className="text-red-600">*</span>
              </div>
            }
          >
            Custom fields apply to all contacts, they are not specific to this
            one. <i>Needs translation.</i>
          </Element>

          {['contact1', 'contact2', 'contact3', 'contact4'].map((field) => (
            <Field
              key={field}
              initialValue={company.custom_fields[field]}
              field={field}
              placeholder={t('contact_field')}
              onChange={(value) => handleCustomFieldChange(field, value)}
            />
          ))}
        </Tab.Panel>
      </TabGroup>
    </Card>
  );
}
