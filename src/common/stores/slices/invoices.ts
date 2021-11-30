/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InvoiceState {
  api?: any;
  builder: {
    items: any[];
  };
}

const blankInvoiceItem = {
  product_key: null,
  description: null,
  unit_cost: null,
  quantity: null,
};

const initialState: InvoiceState = {
  api: {},
  builder: {
    items: [blankInvoiceItem],
  },
};

export const invoiceSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    updateBuilderProperty: (
      state,
      action: PayloadAction<{
        itemIndex: number;
        field: string;
        value: string | number | null;
      }>
    ) => {
      state.builder.items[action.payload.itemIndex][action.payload.field] =
        action.payload.value;
    },
  },
});

export const { updateBuilderProperty } = invoiceSlice.actions;
