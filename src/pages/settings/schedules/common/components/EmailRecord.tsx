/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Credit } from '$app/common/interfaces/credit';
import { Invoice } from '$app/common/interfaces/invoice';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { Quote } from '$app/common/interfaces/quote';
import { Schedule } from '$app/common/interfaces/schedule';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Element } from '$app/components/cards';
import { SelectField } from '$app/components/forms';
import { ComboboxAsync, Entry } from '$app/components/forms/Combobox';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  schedule: Schedule;
  handleChange: (
    property: keyof Schedule,
    value: Schedule[keyof Schedule]
  ) => void;
  errors: ValidationBag | undefined;
}

export function EmailRecord({ schedule, handleChange, errors }: Props) {
  const [t] = useTranslation();

  const company = useCurrentCompany();

  const formatMoney = useFormatMoney();

  const formatEntityLabel = (entity: Invoice | Quote) => {
    return `${entity.number} (${formatMoney(
      entity.amount,
      entity?.client?.country_id,
      entity?.client?.settings.currency_id
    )})`;
  };

  const TEMPLATE_OPTIONS = useMemo(() => {
    const options = {
      invoice: [
        { value: 'invoice', label: t('initial_email') },
        { value: 'reminder1', label: t('first_reminder') },
        { value: 'reminder2', label: t('second_reminder') },
        { value: 'reminder3', label: t('third_reminder') },
        { value: 'reminder_endless', label: t('endless_reminder') },
      ],
      quote: [
        { value: 'quote', label: t('initial_email') },
        { value: 'reminder1', label: t('first_reminder') },
      ],
      credit: [{ value: 'credit', label: t('initial_email') }],
      purchase_order: [{ value: 'purchase_order', label: t('initial_email') }],
    };

    if (company?.settings.email_subject_custom1) {
      options.invoice.push({
        value: 'custom1',
        label: company?.settings.email_subject_custom1,
      });

      options.quote.push({
        value: 'custom1',
        label: company?.settings.email_subject_custom1,
      });
    }

    if (company?.settings.email_subject_custom2) {
      options.invoice.push({
        value: 'custom2',
        label: company?.settings.email_subject_custom2,
      });

      options.quote.push({
        value: 'custom2',
        label: company?.settings.email_subject_custom2,
      });
    }

    if (company?.settings.email_subject_custom3) {
      options.invoice.push({
        value: 'custom3',
        label: company?.settings.email_subject_custom3,
      });

      options.quote.push({
        value: 'custom3',
        label: company?.settings.email_subject_custom3,
      });
    }

    return options;
  }, []);

  return (
    <>
      <Element leftSide={t('type')}>
        <SelectField
          value={schedule.parameters.entity}
          onValueChange={(value) =>
            handleChange('parameters.entity' as keyof Schedule, value)
          }
          errorMessage={errors?.errors['parameters.entity']}
          customSelector
          dismissable={false}
        >
          <option value="invoice" defaultChecked>
            {t('invoice')}
          </option>
          <option value="quote">{t('quote')}</option>
          <option value="credit">{t('credit')}</option>
          <option value="purchase_order">{t('purchase_order')}</option>
        </SelectField>
      </Element>

      {schedule.parameters.entity === 'invoice' && (
        <>
          <Element leftSide={t('invoice')}>
            <ComboboxAsync<Invoice>
              endpoint={endpoint(
                '/api/v1/invoices?include=client.group_settings&filter_deleted_clients=true&status=active'
              )}
              onChange={(invoice: Entry<Invoice>) =>
                invoice.resource &&
                handleChange(
                  'parameters.entity_id' as keyof Schedule,
                  invoice.resource.id
                )
              }
              inputOptions={{
                value: schedule.parameters.entity_id,
              }}
              entryOptions={{
                id: 'id',
                label: 'number',
                value: 'id',
                dropdownLabelFn: (invoice) => formatEntityLabel(invoice),
                inputLabelFn: (invoice) =>
                  invoice ? formatEntityLabel(invoice) : '',
              }}
              onDismiss={() =>
                handleChange('parameters.entity_id' as keyof Schedule, '')
              }
              errorMessage={errors?.errors['parameters.entity_id']}
            />
          </Element>

          <Element leftSide={t('template')}>
            <SelectField
              value={schedule.parameters.template}
              onValueChange={(value) =>
                handleChange('parameters.template' as keyof Schedule, value)
              }
              errorMessage={errors?.errors['parameters.template']}
              customSelector
              dismissable={false}
            >
              {TEMPLATE_OPTIONS.invoice.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          </Element>
        </>
      )}

      {schedule.parameters.entity === 'quote' && (
        <>
          <Element leftSide={t('quote')}>
            <ComboboxAsync<Quote>
              endpoint={endpoint(
                '/api/v1/quotes?include=client&filter_deleted_clients=true&status=active'
              )}
              onChange={(quote: Entry<Quote>) =>
                quote.resource &&
                handleChange(
                  'parameters.entity_id' as keyof Schedule,
                  quote.resource.id
                )
              }
              inputOptions={{
                value: schedule.parameters.entity_id,
              }}
              entryOptions={{
                id: 'id',
                label: 'number',
                value: 'id',
                dropdownLabelFn: (quote) => formatEntityLabel(quote),
                inputLabelFn: (quote) =>
                  quote ? formatEntityLabel(quote) : '',
              }}
              onDismiss={() =>
                handleChange('parameters.entity_id' as keyof Schedule, '')
              }
              errorMessage={errors?.errors['parameters.entity_id']}
            />
          </Element>

          <Element leftSide={t('template')}>
            <SelectField
              value={schedule.parameters.template}
              onValueChange={(value) =>
                handleChange('parameters.template' as keyof Schedule, value)
              }
              errorMessage={errors?.errors['parameters.template']}
              customSelector
              dismissable={false}
            >
              {TEMPLATE_OPTIONS.quote.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          </Element>
        </>
      )}

      {schedule.parameters.entity === 'credit' && (
        <>
          <Element leftSide={t('credit')}>
            <ComboboxAsync<Credit>
              endpoint={endpoint(
                '/api/v1/credits?include=client&filter_deleted_clients=true&status=active'
              )}
              onChange={(credit: Entry<Credit>) =>
                credit.resource &&
                handleChange(
                  'parameters.entity_id' as keyof Schedule,
                  credit.resource.id
                )
              }
              inputOptions={{
                value: schedule.parameters.entity_id,
              }}
              entryOptions={{
                id: 'id',
                label: 'number',
                value: 'id',
                dropdownLabelFn: (credit) => formatEntityLabel(credit),
                inputLabelFn: (credit) =>
                  credit ? formatEntityLabel(credit) : '',
              }}
              onDismiss={() =>
                handleChange('parameters.entity_id' as keyof Schedule, '')
              }
              errorMessage={errors?.errors['parameters.entity_id']}
            />
          </Element>

          <Element leftSide={t('template')}>
            <SelectField
              value={schedule.parameters.template}
              onValueChange={(value) =>
                handleChange('parameters.template' as keyof Schedule, value)
              }
              errorMessage={errors?.errors['parameters.template']}
              customSelector
              dismissable={false}
            >
              {TEMPLATE_OPTIONS.credit.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          </Element>
        </>
      )}

      {schedule.parameters.entity === 'purchase_order' && (
        <>
          <Element leftSide={t('purchase_order')}>
            <ComboboxAsync<PurchaseOrder>
              endpoint={endpoint(
                '/api/v1/purchase_orders?include=vendor&status=active'
              )}
              onChange={(value: Entry<PurchaseOrder>) =>
                value.resource &&
                handleChange(
                  'parameters.entity_id' as keyof Schedule,
                  value.resource.id
                )
              }
              inputOptions={{
                value: schedule.parameters.entity_id,
              }}
              entryOptions={{
                id: 'id',
                label: 'number',
                value: 'id',
                dropdownLabelFn: (purchaseOrder) =>
                  `${purchaseOrder.number} (${formatMoney(
                    purchaseOrder.amount,
                    purchaseOrder?.vendor?.country_id,
                    purchaseOrder?.vendor?.currency_id
                  )})`,
                inputLabelFn: (purchaseOrder) =>
                  purchaseOrder
                    ? `${purchaseOrder.number} (${formatMoney(
                        purchaseOrder.amount,
                        purchaseOrder?.vendor?.country_id,
                        purchaseOrder?.vendor?.currency_id
                      )})`
                    : '',
              }}
              onDismiss={() =>
                handleChange('parameters.entity_id' as keyof Schedule, '')
              }
              errorMessage={errors?.errors['parameters.entity_id']}
            />
          </Element>

          <SelectField
            value={schedule.parameters.template}
            onValueChange={(value) =>
              handleChange('parameters.template' as keyof Schedule, value)
            }
            errorMessage={errors?.errors['parameters.template']}
            customSelector
            dismissable={false}
          >
            {TEMPLATE_OPTIONS.invoice.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
        </>
      )}
    </>
  );
}
