/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { blankLineItem } from '$app/common/constants/blank-line-item';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useUserNumberPrecision } from '$app/common/hooks/useUserNumberPrecision';
import { InvoiceItemType } from '$app/common/interfaces/invoice-item';
import { Product } from '$app/common/interfaces/product';
import { useBlankInvoiceQuery } from '$app/common/queries/invoices';
import { invoiceAtom } from '$app/pages/invoices/common/atoms';
import { useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';

interface Params {
  onlyAddToInvoice?: boolean;
}

export const useInvoiceProducts = (params?: Params) => {
  const { onlyAddToInvoice } = params || {};

  const navigate = useNavigate();

  const company = useCurrentCompany();
  const userNumberPrecision = useUserNumberPrecision();

  const { data: blankInvoice } = useBlankInvoiceQuery();

  const setInvoice = useSetAtom(invoiceAtom);

  return (products: Product[]) => {
    if (blankInvoice) {
      const lineItems = products.map((product) => ({
        ...blankLineItem(),
        type_id: InvoiceItemType.Product,
        product_key: product.product_key,
        quantity: company?.fill_products ? product.quantity : 1,
        ...(company?.fill_products && {
          line_total: Number(
            (product.price * product.quantity).toFixed(userNumberPrecision)
          ),
          cost: product.price,
          notes: product.notes,
          tax_name1: product.tax_name1,
          tax_rate1: product.tax_rate1,
          tax_name2: product.tax_name2,
          tax_rate2: product.tax_rate2,
          tax_name3: product.tax_name3,
          tax_rate3: product.tax_rate3,
          tax_id: '',
          custom_value1: product.custom_value1,
          custom_value2: product.custom_value2,
          custom_value3: product.custom_value3,
          custom_value4: product.custom_value4,
        }),
      }));

      if (!onlyAddToInvoice) {
        setInvoice({ ...blankInvoice, line_items: lineItems });

        navigate('/invoices/create?action=invoice_product');
      } else {
        setInvoice(
          (current) =>
            current && {
              ...current,
              line_items: [...current.line_items, ...lineItems],
            }
        );
      }
    }
  };
};
