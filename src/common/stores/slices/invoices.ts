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
import { InvoiceSum } from 'common/helpers/invoices/invoice-sum';
import { Invoice } from 'common/interfaces/invoice';
import { InvoiceItem } from 'common/interfaces/invoice-item';
import { cloneDeep, set } from 'lodash';

const blankLineItem: InvoiceItem = {
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

export const aliases: Record<string, string> = {
  item: 'product_key',
  description: 'notes',
  unit_cost: 'cost',
};

interface InvoiceState {
  api?: any;
  current?: Invoice;
}

const initialState: InvoiceState = {
  api: {},
};

export const invoiceSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    setCurrentInvoice: (state, payload: PayloadAction<Invoice>) => {
      state.current = payload.payload;

      // For the fresh invoice we get, line items is equal to "[]".

      if (typeof state.current.line_items === 'string') {
        state.current.line_items = [];
      }
    },
    injectBlankItemIntoCurrent: (state) => {
      state.current?.line_items.push(blankLineItem);
    },
    setCurrentInvoiceProperty: (
      state,
      payload: PayloadAction<{ property: keyof Invoice; value: unknown }>
    ) => {
      if (state.current) {
        state.current = set(
          state.current,
          payload.payload.property,
          payload.payload.value
        );
      }
    },
    setCurrentInvoiceLineItemProperty: (
      state,
      payload: PayloadAction<{
        position: number;
        property: keyof InvoiceItem;
        value: unknown;
      }>
    ) => {
      if (state.current) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        state.current.line_items[payload.payload.position][
          payload.payload.property
        ] = payload.payload.value;

        state.current = new InvoiceSum(
          cloneDeep(state.current)
        ).build().invoice;
      }
    },
    deleteInvoiceLineItem: (state, payload: PayloadAction<number>) => {
      if (state.current) {
        state.current.line_items.splice(payload.payload, 1);
      }
    },
  },
});

export const {
  setCurrentInvoice,
  injectBlankItemIntoCurrent,
  setCurrentInvoiceProperty,
  setCurrentInvoiceLineItemProperty,
  deleteInvoiceLineItem,
} = invoiceSlice.actions;
