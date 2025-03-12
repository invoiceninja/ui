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
import { useBlankPurchaseOrderQuery } from '$app/common/queries/purchase-orders';
import { purchaseOrderAtom } from '$app/pages/purchase-orders/common/atoms';
import { useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';

export const usePurchaseOrderProducts = () => {
  const navigate = useNavigate();

  const company = useCurrentCompany();
  const userNumberPrecision = useUserNumberPrecision();

  const { data: blankPurchaseOrder } = useBlankPurchaseOrderQuery();

  const setPurchaseOrder = useSetAtom(purchaseOrderAtom);

  return (products: Product[]) => {
    if (blankPurchaseOrder) {
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

      setPurchaseOrder({ ...blankPurchaseOrder, line_items: lineItems });

      navigate('/purchase_orders/create?action=purchase_order_product');
    }
  };
};
