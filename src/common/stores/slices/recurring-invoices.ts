/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { createSlice } from '@reduxjs/toolkit';
import { InvoiceSum } from 'common/helpers/invoices/invoice-sum';
import { cloneDeep, set } from 'lodash';
import { setCurrentRecurringInvoiceProperty } from './recurring-invoices/extra-reducers/set-current-recurring-invoice-property';

interface RecurringInvoiceState {
  api?: any;
  current?: any;
}

const initialState: RecurringInvoiceState = {
  api: {},
};

export const recurringInvoiceSlice = createSlice({
  name: 'recurringInvoice',
  initialState,
  reducers: {
    setCurrentRecurringInvoice: (state, payload) => {
      state.current = payload.payload;

      if (typeof state.current.line_items === 'string') {
        state.current.line_items = [];
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      setCurrentRecurringInvoiceProperty.fulfilled,
      (state, payload) => {
        if (state.current) {
          state.current = set(
            state.current,
            payload.payload.payload.property,
            payload.payload.payload.value
          );

          if (payload.payload.client && payload.payload.currency) {
            state.current = new InvoiceSum(
              cloneDeep(state.current),
              cloneDeep(payload.payload.currency)
            ).build().invoice;
          }
        }
      }
    );
  },
});

export const { setCurrentRecurringInvoice } = recurringInvoiceSlice.actions;
