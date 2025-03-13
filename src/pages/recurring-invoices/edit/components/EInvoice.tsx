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
import { cloneDeep, get, set } from 'lodash';
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
            (
              get(
                recurringInvoice,
                'e_invoice.Invoice.InvoicePeriod.0.Description'
              ) as unknown as string
            )?.split('|')?.[0] || ''
          }
          onValueChange={(value) =>
            handleChange(
              'e_invoice.Invoice.InvoicePeriod.0.Description',
              `${value}|${
                (
                  get(
                    recurringInvoice,
                    'e_invoice.Invoice.InvoicePeriod.0.Description'
                  ) as unknown as string
                )?.split('|')?.[1] || ''
              }`
            )
          }
          errorMessage={get(
            errors?.errors,
            'e_invoice.Invoice.InvoicePeriod.0.StartDate'
          )}
        />
      </Element>

      <Element leftSide={t('end_date')}>
        <InputField
          element="textarea"
          value={
            (
              get(
                recurringInvoice,
                'e_invoice.Invoice.InvoicePeriod.0.Description'
              ) as unknown as string
            )?.split('|')?.[1] || ''
          }
          onValueChange={(value) =>
            handleChange(
              'e_invoice.Invoice.InvoicePeriod.0.Description',
              `${
                (
                  get(
                    recurringInvoice,
                    'e_invoice.Invoice.InvoicePeriod.0.Description'
                  ) as unknown as string
                )?.split('|')?.[0] || ''
              }|${value}`
            )
          }
          errorMessage={get(
            errors?.errors,
            'e_invoice.Invoice.InvoicePeriod.0.EndDate'
          )}
        />
      </Element>
    </Card>
  );
}
