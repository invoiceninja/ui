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
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import {
  InvoiceItem,
  InvoiceItemType,
} from '$app/common/interfaces/invoice-item';
import { Product } from '$app/common/interfaces/product';

export interface ProductRow {
  id: string;
  title: string;
  detail?: string;
  amount: number;
  build: () => InvoiceItem;
}

export const productFields = (product: Product): Partial<InvoiceItem> => {
  return {
    type_id: InvoiceItemType.Product,
    product_key: product.product_key,
    notes: product.notes || product.product_key,
    cost: product.price,
    quantity: product.quantity || 1,
    tax_name1: product.tax_name1,
    tax_rate1: product.tax_rate1,
    tax_name2: product.tax_name2,
    tax_rate2: product.tax_rate2,
    tax_name3: product.tax_name3,
    tax_rate3: product.tax_rate3,
    tax_id: product.tax_id || '1',
  };
};

export const productToItem = (product: Product): InvoiceItem => {
  return { ...blankLineItem(), ...productFields(product) };
};

export const loadProductRows = (query: string): Promise<ProductRow[]> => {
  return request(
    'GET',
    endpoint(
      '/api/v1/products?status=active&per_page=50&sort=product_key|asc&filter=:filter',
      { filter: encodeURIComponent(query.trim()) }
    ),
    {},
    { skipIntercept: true }
  ).then((response) =>
    (response.data.data as Product[]).map((product) => ({
      id: product.id,
      title: product.product_key || product.notes,
      detail: product.product_key ? product.notes : undefined,
      amount: product.price,
      build: () => productToItem(product),
    }))
  );
};
