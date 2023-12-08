/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { InvoiceItem } from '$app/common/interfaces/invoice-item';
import { Product } from '$app/common/interfaces/product';
import { ProductTableResource } from '../components/ProductsTable';

interface Props {
  resource: ProductTableResource;
  type: 'product' | 'task';
  onChange: (index: number, lineItem: InvoiceItem) => unknown;
}

export function useHandleProductChange(props: Props) {
  const company = useCurrentCompany();

  const resource = props.resource;

  return (index: number, product_key: string, product: Product | null) => {
    const lineItem = { ...resource.line_items[index] };

    lineItem.product_key = product?.product_key || product_key;

    if (!product) {
      // When we deal with inline product key
      // keep everything but the name.

      return props.onChange(index, lineItem);
    }

    lineItem.quantity = company?.default_quantity ? 1 : product?.quantity ?? 0;

    if (company.fill_products) {
      lineItem.cost = product?.price || 0;
    }

    if (!product) {
      lineItem.notes = '';
    }

    if (props.type == 'product' && product?.notes && company.fill_products) {
      lineItem.notes = product?.notes;
    }

    if (props.type == 'task' && product?.notes && !lineItem.notes) {
      lineItem.notes = product.notes;
    }

    lineItem.tax_name1 = product?.tax_name1 || '';
    lineItem.tax_name2 = product?.tax_name2 || '';
    lineItem.tax_name3 = product?.tax_name3 || '';

    lineItem.tax_rate1 = product?.tax_rate1 || 0;
    lineItem.tax_rate2 = product?.tax_rate2 || 0;
    lineItem.tax_rate3 = product?.tax_rate3 || 0;

    lineItem.custom_value1 = product?.custom_value1 || '';
    lineItem.custom_value2 = product?.custom_value2 || '';
    lineItem.custom_value3 = product?.custom_value3 || '';
    lineItem.custom_value4 = product?.custom_value4 || '';
    lineItem.tax_id = product?.tax_id || '1';

    return props.onChange(index, lineItem);
  };
}