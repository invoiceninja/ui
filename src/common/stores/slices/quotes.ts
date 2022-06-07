/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InvoiceSum } from 'common/helpers/invoices/invoice-sum';
import { Quote } from 'common/interfaces/quote';
import { cloneDeep, set } from 'lodash';
import { blankInvitation } from './invoices/constants/blank-invitation';
import { setCurrentQuote } from './quotes/extra-reducers/set-current-quote';
import { setCurrentQuoteProperty } from './quotes/extra-reducers/set-current-quote-property';

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
  reducers: {
    dismissCurrentQuote: (state) => {
      state.current = undefined;
    },
    toggleCurrentQuoteInvitation: (
      state,
      payload: PayloadAction<{ contactId: string; checked: boolean }>
    ) => {
      const invitations = state.current?.invitations;

      const potential =
        invitations?.find(
          (invitation) =>
            invitation.client_contact_id === payload.payload.contactId
        ) || -1;

      if (
        potential !== -1 &&
        payload.payload.checked === false &&
        state.current
      ) {
        state.current.invitations = state.current.invitations.filter(
          (i) => i.client_contact_id !== payload.payload.contactId
        );
      }

      if (potential === -1) {
        const invitation = cloneDeep(blankInvitation);

        invitation.client_contact_id = payload.payload.contactId;

        state.current?.invitations.push(invitation);
      }
    },
  },
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

    builder.addCase(setCurrentQuoteProperty.fulfilled, (state, payload) => {
      if (state.current) {
        state.current = set(
          state.current,
          payload.payload.payload.property,
          payload.payload.payload.value
        );

        if (payload.payload.client && payload.payload.currency) {
          state.invoiceSum = new InvoiceSum(
            cloneDeep(state.current),
            cloneDeep(payload.payload.currency)
          ).build();

          state.current = state.invoiceSum.invoice as Quote;
        }
      }
    });
  },
});

export const { dismissCurrentQuote, toggleCurrentQuoteInvitation } =
  quoteSlice.actions;
