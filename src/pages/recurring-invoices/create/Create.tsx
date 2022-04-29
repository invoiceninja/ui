/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useTitle } from 'common/hooks/useTitle';
import { RecurringInvoice } from 'common/interfaces/recurring-invoice';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useBlankRecurringInvoiceQuery } from 'common/queries/recurring-invoices';
import { setCurrentRecurringInvoice } from 'common/stores/slices/recurring-invoices/extra-reducers/set-current-recurring-invoice';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { ValidationAlert } from 'components/ValidationAlert';
import { InvoicePreview } from 'pages/invoices/common/components/InvoicePreview';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { generatePath } from 'react-router-dom';
import { ClientSelector } from '../common/components/ClientSelector';
import { InvoiceDetails } from '../common/components/InvoiceDetails';
import { InvoiceFooter } from '../common/components/InvoiceFooter';
import { InvoiceTotals } from '../common/components/InvoiceTotals';
import { ProductsTable } from '../common/components/ProductsTable';
import { useCurrentRecurringInvoice } from '../common/hooks/useCurrentRecurringInvoice';
import { useHandleCreate } from '../create/hooks/useHandleCreate';

export function Create() {
  const { documentTitle } = useTitle('new_recurring_invoice');
  const { data: recurringInvoice } = useBlankRecurringInvoiceQuery();

  const [t] = useTranslation();
  const [errors, setErrors] = useState<ValidationBag>();

  const dispatch = useDispatch();
  const handleCreate = useHandleCreate(setErrors);
  const currentRecurringInvoice = useCurrentRecurringInvoice();
  const company = useCurrentCompany();
  const pages: BreadcrumRecord[] = [
    { name: t('recurring_invoices'), href: '/recurring_invoices' },
    {
      name: t('new_recurring_invoice'),
      href: generatePath('/recurring_invoices/create'),
    },
  ];

  useEffect(() => {
    if (recurringInvoice?.data.data) {
      dispatch(setCurrentRecurringInvoice(recurringInvoice.data.data));
    }
  }, [recurringInvoice]);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onBackClick={generatePath('/recurring_invoices')}
      onSaveClick={() =>
        handleCreate(currentRecurringInvoice as RecurringInvoice)
      }
    >
      {errors && <ValidationAlert errors={errors} />}

      <div className="grid grid-cols-12 gap-4">
        <ClientSelector />
        <InvoiceDetails autoBill={company.settings.auto_bill} />

        <div className="col-span-12">
          <ProductsTable />
        </div>

        <InvoiceFooter />
        <InvoiceTotals />
      </div>

      <div className="my-4">
        {currentRecurringInvoice && (
          <InvoicePreview
            for="create"
            resource={currentRecurringInvoice}
            entity="recurring_invoice"
          />
        )}
      </div>
    </Default>
  );
}
