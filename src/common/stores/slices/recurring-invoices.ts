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
});

export const { setCurrentRecurringInvoice } = recurringInvoiceSlice.actions;
