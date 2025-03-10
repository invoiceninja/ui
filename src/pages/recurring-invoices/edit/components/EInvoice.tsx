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
import { InputField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { RecurringInvoiceContext } from '../../create/Create';
import { useOutletContext } from 'react-router-dom';
import { cloneDeep, set } from 'lodash';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';

export default function EInvoice() {
  const [t] = useTranslation();

  const context: RecurringInvoiceContext = useOutletContext();
  const { recurringInvoice, errors, setRecurringInvoice } = context;

  const handleChange = (property: string, value: string | number | boolean) => {
    const updatedInvoice = cloneDeep(recurringInvoice) as RecurringInvoice;

    set(updatedInvoice, property, value);

    setRecurringInvoice(updatedInvoice);
  };

  return (
    <Card title={t('date_range')}>
      <Element leftSide={t('start_date')}>
        <InputField
          element="textarea"
          value={
            recurringInvoice?.InvoicePeriod?.Description?.split('|')?.[0] || ''
          }
          onValueChange={(value) =>
            handleChange(
              'InvoicePeriod.Description',
              `${value}|${
                recurringInvoice?.InvoicePeriod?.Description?.split('|')?.[1] ||
                ''
              }`
            )
          }
          errorMessage={errors?.errors?.['InvoicePeriod.StartDate']}
        />
      </Element>

      <Element leftSide={t('end_date')}>
        <InputField
          element="textarea"
          value={
            recurringInvoice?.InvoicePeriod?.Description?.split('|')?.[1] || ''
          }
          onValueChange={(value) =>
            handleChange(
              'InvoicePeriod.Description',
              `${
                recurringInvoice?.InvoicePeriod?.Description?.split('|')?.[0] ||
                ''
              }|${value}`
            )
          }
          errorMessage={errors?.errors?.['InvoicePeriod.EndDate']}
        />
      </Element>
    </Card>
  );
}
