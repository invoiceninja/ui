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
import { Credit } from '$app/common/interfaces/credit';
import { Invoice } from '$app/common/interfaces/invoice';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { Quote } from '$app/common/interfaces/quote';
import { Schedule } from '$app/common/interfaces/schedule';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Element } from '$app/components/cards';
import { SelectField } from '$app/components/forms';
import { ComboboxAsync, Entry } from '$app/components/forms/Combobox';
import { useTranslation } from 'react-i18next';

interface Props {
  schedule: Schedule;
  handleChange: (
    property: keyof Schedule,
    value: Schedule[keyof Schedule]
  ) => void;
  errors: ValidationBag | undefined;
}

export function EmailRecord(props: Props) {
  const [t] = useTranslation();
  const formatMoney = useFormatMoney();

  const { schedule, handleChange, errors } = props;

  const formatEntityLabel = (entity: Invoice | Quote) => {
    return `${entity.number} (${formatMoney(
      entity.amount,
      entity?.client?.country_id,
      entity?.client?.settings.currency_id
    )})`;
  };

  return (
    <>
      <Element leftSide={t('type')}>
        <SelectField
          value={schedule.parameters.entity}
          onValueChange={(value) =>
            handleChange('parameters.entity' as keyof Schedule, value)
          }
          errorMessage={errors?.errors['parameters.entity']}
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
        <Element leftSide={t('invoice')}>
          <ComboboxAsync<Invoice>
            endpoint={
              endpoint('/api/v1/invoices?include=client&status=active')
            }
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
      )}

      {schedule.parameters.entity === 'quote' && (
        <Element leftSide={t('quote')}>
          <ComboboxAsync<Quote>
            endpoint={
              endpoint('/api/v1/quotes?include=client&status=active')
            }
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
              inputLabelFn: (quote) => (quote ? formatEntityLabel(quote) : ''),
            }}
            onDismiss={() =>
              handleChange('parameters.entity_id' as keyof Schedule, '')
            }
            errorMessage={errors?.errors['parameters.entity_id']}
          />
        </Element>
      )}

      {schedule.parameters.entity === 'credit' && (
        <Element leftSide={t('credit')}>
          <ComboboxAsync<Credit>
            endpoint={
              endpoint('/api/v1/credits?include=client&status=active')
            }
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
      )}

      {schedule.parameters.entity === 'purchase_order' && (
        <Element leftSide={t('purchase_order')}>
          <ComboboxAsync<PurchaseOrder>
            endpoint={
                endpoint('/api/v1/purchase_orders?include=vendor&status=active')
            }
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
      )}
    </>
  );
}
