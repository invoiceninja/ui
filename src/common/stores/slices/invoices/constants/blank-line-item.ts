/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InvoiceItem } from 'common/interfaces/invoice-item';

export const blankLineItem: InvoiceItem = {
  quantity: 0,
  cost: 0,
  product_key: '',
  product_cost: 0,
  notes: '',
  discount: 0,
  is_amount_discount: false,
  tax_name1: '',
  tax_rate1: 0,
  tax_name2: '',
  tax_rate2: 0,
  tax_name3: '',
  tax_rate3: 0,
  sort_id: 0,
  line_total: 0,
  gross_line_total: 0,
  date: '',
  custom_value1: '',
  custom_value2: '',
  custom_value3: '',
  custom_value4: '',
  type_id: '1',
};
