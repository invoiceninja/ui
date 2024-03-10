/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { InputField, SelectField } from '$app/components/forms';
import { endpoint } from '$app/common/helpers';
import { useCurrencies } from '$app/common/hooks/useCurrencies';
import { useLanguages } from '$app/common/hooks/useLanguages';
import { Client } from '$app/common/interfaces/client';
import { PaymentTerm } from '$app/common/interfaces/payment-term';
import { useStaticsQuery } from '$app/common/queries/statics';
import { DocumentsTable } from '$app/components/DocumentsTable';
import { TabGroup } from '$app/components/TabGroup';
import { Upload } from '$app/pages/settings/company/documents/components';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { MarkdownEditor } from '$app/components/forms/MarkdownEditor';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { cloneDeep, set } from 'lodash';
import { CurrencySelector } from '$app/components/CurrencySelector';
import { LanguageSelector } from '$app/components/LanguageSelector';
import { $refetch } from '$app/common/hooks/useRefetch';
import { usePaymentTermsQuery } from '$app/common/queries/payment-terms';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { DocumentsTabLabel } from '$app/components/DocumentsTabLabel';

interface Props {
  client: Client | undefined;
  setClient: React.Dispatch<React.SetStateAction<Client | undefined>>;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  errors: ValidationBag | undefined;
}

export function AdditionalInfo({ client, errors, setClient }: Props) {
  const [t] = useTranslation();

  const currencies = useCurrencies();
  const languages = useLanguages();

  const entityAssigned = useEntityAssigned();

  const { data: paymentTermsResponse } = usePaymentTermsQuery({});

  const { data: statics } = useStaticsQuery();
  const { id } = useParams();

  const handleChange = <T extends keyof Client>(
    property: T,
    value: Client[typeof property]
  ) => {
    setClient((client) => client && { ...client, [property]: value });
  };

  const handleSettingsChange = <T extends keyof Client['settings']>(
    property: T,
    value: Client['settings'][typeof property]
  ) => {
    const $client = cloneDeep(client)!;

    if (property !== 'currency_id' && value === '') {
      delete $client.settings?.[property];
    } else {
      set($client, `settings.${property}`, value);
    }

    // if (property === 'send_reminders' && value === '') {
    //   delete $client.settings?.send_reminders;
    // } else {
    //   set($client, `settings.${property}`, value);
    // }

    setClient($client);
  };

  const [tabs, setTabs] = useState([
    t('settings'),
    t('notes'),
    t('classify'),
    t('documents'),
  ]);

  useEffect(() => {
    if (!id) {
      setTabs((current) => current.filter((tab) => tab !== t('documents')));
    }
  }, []);

  const onSuccess = () => {
    $refetch(['clients']);
  };

  return (
    <Card title={t('additional_info')}>
      <TabGroup
        className="px-5"
        tabs={tabs}
        formatTabLabel={(tabIndex) => {
          if (tabIndex === 3) {
            return (
              <DocumentsTabLabel numberOfDocuments={client?.documents.length} />
            );
          }
        }}
      >
        <div className="-mx-5">
          {currencies.length > 1 && (
            <Element leftSide={t('currency')}>
              <CurrencySelector
                value={client?.settings?.currency_id || ''}
                onChange={(v) => handleSettingsChange('currency_id', v)}
                errorMessage={errors?.errors['settings.currency_id']}
                dismissable
              />
            </Element>
          )}

          {languages.length > 1 && (
            <Element leftSide={t('language')}>
              <LanguageSelector
                value={client?.settings?.language_id || ''}
                onChange={(v) => handleSettingsChange('language_id', v)}
                errorMessage={errors?.errors['settings.language_id']}
                dismissable
              />
            </Element>
          )}

          {paymentTermsResponse && (
            <Element leftSide={t('payment_terms')}>
              <SelectField
                id="settings.payment_terms"
                defaultValue={client?.settings?.payment_terms || ''}
                errorMessage={errors?.errors['settings.payment_terms']}
                onValueChange={(value) =>
                  handleSettingsChange('payment_terms', value)
                }
                withBlank
              >
                {paymentTermsResponse.data.data.map(
                  (paymentTerm: PaymentTerm, index: number) => (
                    <option key={index} value={paymentTerm.num_days}>
                      {paymentTerm.name}
                    </option>
                  )
                )}
              </SelectField>
            </Element>
          )}

          {paymentTermsResponse && (
            <Element leftSide={t('quote_valid_until')}>
              <SelectField
                id="settings.valid_until"
                defaultValue={client?.settings?.valid_until || ''}
                onValueChange={(value) =>
                  handleSettingsChange('valid_until', value)
                }
                errorMessage={errors?.errors['settings.valid_until']}
                withBlank
              >
                {paymentTermsResponse.data.data.map(
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
              type="number"
              value={client?.settings?.default_task_rate}
              onValueChange={(value) =>
                handleSettingsChange('default_task_rate', value)
              }
              errorMessage={errors?.errors['settings.default_task_rate']}
            />
          </Element>

          <Element leftSide={t('send_reminders')}>
            <SelectField
              id="settings.send_reminders"
              defaultValue={
                client?.settings?.send_reminders === true
                  ? 'enabled'
                  : client?.settings?.send_reminders === false
                  ? 'disabled'
                  : ''
              }
              className={
                'appearance-none block px-3 py-1.5 text-base font-normal  text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none'
              }
              onValueChange={(value) =>
                handleSettingsChange(
                  'send_reminders',
                  value === 'enabled' ? true : value === '' ? '' : false
                )
              }
              withBlank
              errorMessage={errors?.errors['settings.send_reminders']}
            >
              <option value="enabled">{t('enabled')}</option>
              <option value="disabled">{t('disabled')}</option>
            </SelectField>
          </Element>
        </div>

        <div className="-mx-5">
          <Element leftSide={t('public_notes')}>
            <MarkdownEditor
              value={client?.public_notes}
              onChange={(value) => handleChange('public_notes', value)}
            />
          </Element>

          <Element leftSide={t('private_notes')}>
            <MarkdownEditor
              value={client?.private_notes}
              onChange={(value) => handleChange('private_notes', value)}
            />
          </Element>
        </div>

        <div className="-mx-5">
          {statics && (
            <Element leftSide={t('size_id')}>
              <SelectField
                id="size_id"
                defaultValue={client?.size_id || ''}
                onValueChange={(value) => handleChange('size_id', value)}
                errorMessage={errors?.errors.size_id}
                withBlank
              >
                {statics?.sizes.map(
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
                defaultValue={client?.industry_id || ''}
                errorMessage={errors?.errors.industry_id}
                onValueChange={(value) => handleChange('industry_id', value)}
                withBlank
              >
                {statics?.industries.map(
                  (size: { id: string; name: string }, index: number) => (
                    <option key={index} value={size.id}>
                      {size.name}
                    </option>
                  )
                )}
              </SelectField>
            </Element>
          )}
        </div>

        {id ? (
          <div>
            <div className="px-6">
              <Upload
                widgetOnly
                endpoint={endpoint('/api/v1/clients/:id/upload', { id })}
                onSuccess={onSuccess}
              />

              <DocumentsTable
                documents={client?.documents || []}
                onDocumentDelete={onSuccess}
                disableEditableOptions={!entityAssigned(client, true)}
              />
            </div>
          </div>
        ) : (
          <></>
        )}
      </TabGroup>
    </Card>
  );
}
