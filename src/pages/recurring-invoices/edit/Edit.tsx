/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import { useTitle } from 'common/hooks/useTitle';
import { RecurringInvoice } from 'common/interfaces/recurring-invoice';
import { useRecurringInvoiceQuery } from 'common/queries/recurring-invoices';
import { dismissCurrentRecurringInvoice } from 'common/stores/slices/recurring-invoices';
import { setCurrentRecurringInvoice } from 'common/stores/slices/recurring-invoices/extra-reducers/set-current-recurring-invoice';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { InvoicePreview } from 'pages/invoices/common/components/InvoicePreview';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { generatePath, useParams } from 'react-router-dom';
import { ClientSelector } from '../common/components/ClientSelector';
import { InvoiceDetails } from '../common/components/InvoiceDetails';
import { InvoiceFooter } from '../common/components/InvoiceFooter';
import { InvoiceTotals } from '../common/components/InvoiceTotals';
import { ProductsTable } from '../common/components/ProductsTable';
import { useCurrentRecurringInvoice } from '../common/hooks/useCurrentRecurringInvoice';
import { useRecurringInvoiceSave } from '../common/hooks/useRecurringInvoiceSave';
import { Actions } from './components/Actions';

export function Edit() {
  const { documentTitle } = useTitle('edit_recurring_invoice');
  const [t] = useTranslation();
  const { id } = useParams();
  const { data: recurringInvoice } = useRecurringInvoiceQuery({ id });
  const dispatch = useDispatch();
  const handleSave = useRecurringInvoiceSave();
  const currentRecurringInvoice = useCurrentRecurringInvoice();

  const pages: BreadcrumRecord[] = [
    { name: t('recurring_invoices'), href: '/recurring_invoices' },
    {
      name: t('edit_recurring_invoice'),
      href: generatePath('/recurring_invoices/:id/edit', { id }),
    },
  ];

  useEffect(() => {
    if (recurringInvoice?.data.data) {
      dispatch(setCurrentRecurringInvoice(recurringInvoice.data.data));
    }

    return () => {
      dispatch(dismissCurrentRecurringInvoice());
    };
  }, [recurringInvoice]);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onBackClick={generatePath('/recurring_invoices')}
      onSaveClick={() =>
        handleSave(
          currentRecurringInvoice?.id || '',
          currentRecurringInvoice as RecurringInvoice
        )
      }
      navigationTopRight={<Actions />}
    >
      <div className="grid grid-cols-12 gap-4">
        <ClientSelector readonly />
        <InvoiceDetails autoBill={currentRecurringInvoice?.auto_bill} />

        <div className="col-span-12">
          <ProductsTable />
        </div>

        <InvoiceFooter page="edit" />
        <InvoiceTotals />
      </div>

      <div className="my-4">
        {currentRecurringInvoice && (
          <InvoicePreview
            for="invoice"
            resource={currentRecurringInvoice}
            entity="recurring_invoice"
          />
        )}
      </div>
    </Default>
  );
}
