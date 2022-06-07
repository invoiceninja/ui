/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Invoice } from 'common/interfaces/invoice';
import { InvoiceItem } from 'common/interfaces/invoice-item';
import { Product } from 'common/interfaces/product';
import { RecurringInvoice } from 'common/interfaces/recurring-invoice';

interface Props {
  resource: Invoice | RecurringInvoice;
  onChange: (index: number, lineItem: InvoiceItem) => unknown;
}

export function useHandleProductChange(props: Props) {
  const resource = props.resource;

  return (index: number, product_key: string, product?: Product) => {
    const lineItem = { ...resource.line_items[index] };

    lineItem.product_key = product?.product_key || product_key;
    lineItem.quantity = product?.quantity || 1;
    lineItem.cost = product?.cost || 0;
    lineItem.notes = product?.notes || '';

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

    return props.onChange(index, lineItem);
  };
}
