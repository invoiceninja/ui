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
import { InvoiceItemType } from '$app/common/interfaces/invoice-item';
import { Product } from '$app/common/interfaces/product';
import { useBlankPurchaseOrderQuery } from '$app/common/queries/purchase-orders';
import { purchaseOrderAtom } from '$app/pages/purchase-orders/common/atoms';
import { useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';

export const usePurchaseOrderProducts = () => {
  const navigate = useNavigate();

  const { data: blankPurchaseOrder } = useBlankPurchaseOrderQuery();

  const setPurchaseOrder = useSetAtom(purchaseOrderAtom);

  return (products: Product[]) => {
    if (blankPurchaseOrder) {
      const lineItems = products.map((product) => ({
        ...blankLineItem(),
        type_id: InvoiceItemType.Product,
        cost: product.price,
        quantity: product.quantity,
        line_total: Number((product.price * product.quantity).toFixed(2)),
        product_key: product.id,
        notes: product.notes,
        tax_name1: product.tax_name1,
        tax_rate1: product.tax_rate1,
        tax_name2: product.tax_name2,
        tax_rate2: product.tax_rate2,
        tax_name3: product.tax_name3,
        tax_rate3: product.tax_rate3,
        tax_id: '',
      }));

      setPurchaseOrder({ ...blankPurchaseOrder, line_items: lineItems });

      navigate('/purchase_orders/create?action=purchase_order_product');
    }
  };
};
