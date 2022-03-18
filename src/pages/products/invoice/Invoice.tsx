/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentInvoice } from 'common/hooks/useCurrentInvoice';
import { useTitle } from 'common/hooks/useTitle';
import { InvoiceItem } from 'common/interfaces/invoice-item';
import { useBlankInvoiceQuery } from 'common/queries/invoices';
import { useProductQuery } from 'common/queries/products';
import { injectProductItemIntoCurrent } from 'common/stores/slices/invoices';
import { setCurrentInvoice } from 'common/stores/slices/invoices/extra-reducers/set-current-invoice';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { ClientSelector } from 'pages/invoices/common/components/ClientSelector';
import { InvoiceActions } from 'pages/invoices/common/components/InvoiceActions';
import { InvoiceDetails } from 'pages/invoices/common/components/InvoiceDetails';
import { InvoiceFooter } from 'pages/invoices/common/components/InvoiceFooter';
import { InvoiceTotals } from 'pages/invoices/common/components/InvoiceTotals';
import { ProductsTable } from 'pages/invoices/common/components/ProductsTable';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { generatePath, useParams } from 'react-router-dom';

export function Invoice() {
  const { documentTitle } = useTitle('new_invoice');

  const { id } = useParams();
  const { data: product } = useProductQuery({ id });
  const { data: invoice } = useBlankInvoiceQuery();
  const current = useCurrentInvoice();
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const pages: BreadcrumRecord[] = [
    { name: t('invoices'), href: '/invoices' },
    {
      name: t('new_invoice'),
      href: generatePath('/invoices/create'),
    },
  ];
  useEffect(() => {
    if (invoice?.data.data && !current) {
      dispatch(setCurrentInvoice(invoice?.data.data));
    }
    if (product?.data.data && invoice?.data.data && current) {
      if (current.line_items.length < 1) {
        const lineItem: InvoiceItem = {
          quantity: 0,
          cost: product.data.data.cost,
          product_key: product.data.data.product_key,
          product_cost: product.data.data.cost,
          notes: product.data.data.notes,
          discount: 0,
          is_amount_discount: false,
          tax_name1: product.data.data.tax_name1,
          tax_rate1: product.data.data.tax_rate1,
          tax_name2: product.data.data.tax_name1,
          tax_rate2: product.data.data.tax_rate1,
          tax_name3: product.data.data.tax_name1,
          tax_rate3: product.data.data.tax_rate1,
          sort_id: 0,
          line_total: 0,
          gross_line_total: 0,
          date: '',
          custom_value1: product.data.data.custom_value1,
          custom_value2: product.data.data.custom_value2,
          custom_value3: product.data.data.custom_value3,
          custom_value4: product.data.data.custom_value4,
          type_id: '1',
        };
        dispatch(injectProductItemIntoCurrent(lineItem));
      }
    } else {
      dispatch(setCurrentInvoice(invoice?.data.data));
    }
  }, [invoice, product, current]);
  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      <div className="grid grid-cols-12 gap-4">
        <ClientSelector />
        <InvoiceDetails />

        <div className="col-span-12">
          <ProductsTable />
        </div>

        <InvoiceFooter />
        <InvoiceTotals />
      </div>

      <InvoiceActions />
    </Default>
  );
}
