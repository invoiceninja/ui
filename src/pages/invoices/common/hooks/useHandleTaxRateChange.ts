/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InvoiceItem } from 'common/interfaces/invoice-item';
import { TaxRate } from 'common/interfaces/tax-rate';
import { ProductTableResource } from '../components/ProductsTable';

interface Props {
  resource: ProductTableResource;
  type: 'product' | 'task';
  onChange: (index: number, lineItem: InvoiceItem) => unknown;
}

export function useHandleTaxRateChange(props: Props) {
  const resource = props.resource;

  return (property: keyof InvoiceItem, index: number, taxRate: TaxRate) => {
    const lineItem = { ...resource.line_items[index] };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    lineItem[property] = taxRate.rate;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    lineItem[property.replace('rate', 'name')] = taxRate.name;

    return props.onChange(index, lineItem);
  };
}
