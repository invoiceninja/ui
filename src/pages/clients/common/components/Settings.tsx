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
import { CurrencySelector } from '$app/components/CurrencySelector';
import { useTranslation } from 'react-i18next';
import { ClientContext } from '../../edit/Edit';
import { useOutletContext } from 'react-router-dom';
import { cloneDeep } from 'lodash';
import { set } from 'lodash';
import { useCurrencies } from '$app/common/hooks/useCurrencies';
import { useLanguages } from '$app/common/hooks/useLanguages';
import { SelectField } from '$app/components/forms/SelectField';
import { usePaymentTermsQuery } from '$app/common/queries/payment-terms';
import { LanguageSelector } from '$app/components/LanguageSelector';
import { PaymentTerm } from '$app/common/interfaces/payment-term';
import { NumberInputField } from '$app/components/forms/NumberInputField';
import { MarkdownEditor } from '$app/components/forms/MarkdownEditor';
import { useStaticsQuery } from '$app/common/queries/statics';

export default function Settings() {
  const [t] = useTranslation();

  const context: ClientContext = useOutletContext();

  const { client, errors, setClient } = context;

  const languages = useLanguages();
  const currencies = useCurrencies();
  const { data: statics } = useStaticsQuery();

  const { data: paymentTermsResponse } = usePaymentTermsQuery({});

  const handleChange = (property: string, value: string | number | boolean) => {
    const $client = cloneDeep(client)!;

    if (
      property !== 'currency_id' &&
      $client.settings?.[property] !== undefined &&
      value === ''
    ) {
      delete $client.settings?.[property];
    } else {
      set($client, property, value);
    }

    setClient($client);
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      <Card title={t('settings')} className="col-span-12 lg:col-span-6">
        {currencies.length > 1 && (
          <Element leftSide={t('currency')}>
            <CurrencySelector
              value={client?.settings?.currency_id || ''}
              onChange={(v) => handleChange('settings.currency_id', v)}
              errorMessage={errors?.errors['settings.currency_id']}
              dismissable
            />
          </Element>
        )}

        {languages.length > 1 && (
          <Element leftSide={t('language')}>
            <LanguageSelector
              value={client?.settings?.language_id || ''}
              onChange={(v) => handleChange('settings.language_id', v)}
              errorMessage={errors?.errors['settings.language_id']}
              dismissable
            />
          </Element>
        )}

        {paymentTermsResponse && (
          <Element leftSide={t('payment_terms')}>
            <SelectField
              id="settings.payment_terms"
              value={client?.settings?.payment_terms || ''}
              errorMessage={errors?.errors['settings.payment_terms']}
              onValueChange={(value) =>
                handleChange('settings.payment_terms', value)
              }
              withBlank
              customSelector
            >
              {paymentTermsResponse.data.data.map(
                (paymentTerm: PaymentTerm, index: number) => (
                  <option key={index} value={paymentTerm.num_days.toString()}>
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
              value={client?.settings?.valid_until || ''}
              onValueChange={(value) =>
                handleChange('settings.valid_until', value)
              }
              errorMessage={errors?.errors['settings.valid_until']}
              withBlank
              customSelector
            >
              {paymentTermsResponse.data.data.map(
                (paymentTerm: PaymentTerm, index: number) => (
                  <option key={index} value={paymentTerm.num_days.toString()}>
                    {paymentTerm.name}
                  </option>
                )
              )}
            </SelectField>
          </Element>
        )}

        <Element leftSide={t('task_rate')}>
          <NumberInputField
            value={client?.settings?.default_task_rate || ''}
            onValueChange={(value) =>
              handleChange('settings.default_task_rate', parseFloat(value))
            }
            errorMessage={errors?.errors['settings.default_task_rate']}
          />
        </Element>

        <Element leftSide={t('send_reminders')}>
          <SelectField
            id="settings.send_reminders"
            value={
              client?.settings?.send_reminders === true
                ? 'enabled'
                : client?.settings?.send_reminders === false
                ? 'disabled'
                : ''
            }
            onValueChange={(value) =>
              handleChange(
                'settings.send_reminders',
                value === 'enabled' ? true : value === '' ? '' : false
              )
            }
            withBlank
            errorMessage={errors?.errors['settings.send_reminders']}
            customSelector
          >
            <option value="enabled">{t('enabled')}</option>
            <option value="disabled">{t('disabled')}</option>
          </SelectField>
        </Element>
      </Card>

      <Card title={t('classify')} className="col-span-12 lg:col-span-6 h-max">
        {statics && (
          <Element leftSide={t('size_id')}>
            <SelectField
              id="size_id"
              value={client?.size_id || ''}
              onValueChange={(value) => handleChange('size_id', value)}
              errorMessage={errors?.errors.size_id}
              withBlank
              customSelector
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
              value={client?.industry_id || ''}
              errorMessage={errors?.errors.industry_id}
              onValueChange={(value) => handleChange('industry_id', value)}
              withBlank
              customSelector
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
      </Card>

      <Card title={t('notes')} className="col-span-12">
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
      </Card>
    </div>
  );
}
