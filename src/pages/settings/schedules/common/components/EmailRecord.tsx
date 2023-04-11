/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { Credit } from '$app/common/interfaces/credit';
import { Invoice } from '$app/common/interfaces/invoice';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { Quote } from '$app/common/interfaces/quote';
import { Schedule } from '$app/common/interfaces/schedule';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Element } from '$app/components/cards';
import { SelectField } from '$app/components/forms';
import {
  DebouncedCombobox,
  Record,
} from '$app/components/forms/DebouncedCombobox';
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

  return (
    <>
      <Element leftSide={t('type')}>
        <SelectField
          value={schedule.parameters.entity}
          onValueChange={(value) =>
            handleChange('parameters.entity' as keyof Schedule, value)
          }
          errorMessage={errors?.errors.entity}
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
          <DebouncedCombobox
            endpoint="/api/v1/invoices?include=client"
            label="number"
            defaultValue={schedule.parameters.entity_id}
            formatLabel={(resource: Invoice) =>
              `${resource.number} (${formatMoney(
                resource.amount,
                resource?.client?.country_id ?? '1',
                resource?.client?.settings.currency_id
              )})`
            }
            onChange={(value: Record<Invoice>) =>
              value.resource &&
              handleChange(
                'parameters.entity_id' as keyof Schedule,
                value.resource.id
              )
            }
            clearButton
            onClearButtonClick={() =>
              handleChange('parameters.entity_id' as keyof Schedule, '')
            }
            queryAdditional
            errorMessage={errors?.errors.entity_id}
          />
        </Element>
      )}

      {schedule.parameters.entity === 'quote' && (
        <Element leftSide={t('quote')}>
          <DebouncedCombobox
            endpoint="/api/v1/quotes?include=client"
            label="number"
            defaultValue={schedule.parameters.entity_id}
            formatLabel={(resource: Quote) =>
              `${resource.number} (${formatMoney(
                resource.amount,
                resource?.client?.country_id ?? '1',
                resource?.client?.settings.currency_id
              )})`
            }
            onChange={(value: Record<Quote>) =>
              value.resource &&
              handleChange(
                'parameters.entity_id' as keyof Schedule,
                value.resource.id
              )
            }
            clearButton
            onClearButtonClick={() =>
              handleChange('parameters.entity_id' as keyof Schedule, '')
            }
            queryAdditional
            errorMessage={errors?.errors.entity_id}
          />
        </Element>
      )}

      {schedule.parameters.entity === 'credit' && (
        <Element leftSide={t('credit')}>
          <DebouncedCombobox
            endpoint="/api/v1/credits?include=client"
            label="number"
            defaultValue={schedule.parameters.entity_id}
            formatLabel={(resource: Credit) =>
              `${resource.number} (${formatMoney(
                resource.amount,
                resource?.client?.country_id ?? '1',
                resource?.client?.settings.currency_id
              )})`
            }
            onChange={(value: Record<Credit>) =>
              value.resource &&
              handleChange(
                'parameters.entity_id' as keyof Schedule,
                value.resource.id
              )
            }
            clearButton
            onClearButtonClick={() =>
              handleChange('parameters.entity_id' as keyof Schedule, '')
            }
            queryAdditional
            errorMessage={errors?.errors.entity_id}
          />
        </Element>
      )}

      {schedule.parameters.entity === 'purchase_order' && (
        <Element leftSide={t('purchase_order')}>
          <DebouncedCombobox
            endpoint="/api/v1/purchase_orders?include=vendor"
            label="number"
            defaultValue={schedule.parameters.entity_id}
            formatLabel={(resource: PurchaseOrder) =>
              `${resource.number} (${formatMoney(
                resource.amount,
                resource?.vendor?.country_id ?? '1',
                resource?.vendor?.currency_id ?? '1'
              )})`
            }
            onChange={(value: Record<PurchaseOrder>) =>
              value.resource &&
              handleChange(
                'parameters.entity_id' as keyof Schedule,
                value.resource.id
              )
            }
            clearButton
            onClearButtonClick={() =>
              handleChange('parameters.entity_id' as keyof Schedule, '')
            }
            queryAdditional
            errorMessage={errors?.errors.entity_id}
          />
        </Element>
      )}
    </>
  );
}
