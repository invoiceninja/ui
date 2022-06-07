/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { createSlice } from '@reduxjs/toolkit';
import { InvoiceSum } from 'common/helpers/invoices/invoice-sum';
import { Quote } from 'common/interfaces/quote';
import { cloneDeep } from 'lodash';
import { setCurrentQuote } from './quotes/extra-reducers/set-current-quote';

interface QuoteState {
  api?: any;
  current?: Quote;
  invoiceSum?: InvoiceSum;
}

const initialState: QuoteState = {
  api: {},
};

export const quoteSlice = createSlice({
  name: 'quotes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(setCurrentQuote.fulfilled, (state, payload) => {
      state.current = payload.payload.quote;

      // if (typeof state.current.line_items === 'string') {
      //   state.current.line_items = [];
      // }

      if (payload.payload.client && payload.payload.currency) {
        state.invoiceSum = new InvoiceSum(
          cloneDeep(state.current),
          cloneDeep(payload.payload.currency)
        ).build();

        state.current = state.invoiceSum.invoice as Quote;
      }
    });
  },
});

// export const {} = invoiceSlice.actions;
