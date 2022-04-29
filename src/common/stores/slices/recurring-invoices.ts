/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InvoiceSum } from 'common/helpers/invoices/invoice-sum';
import { Currency } from 'common/interfaces/currency';
import { cloneDeep, set } from 'lodash';
import { setCurrentRecurringInvoiceProperty } from './recurring-invoices/extra-reducers/set-current-recurring-invoice-property';
import { setCurrentLineItemProperty } from './recurring-invoices/extra-reducers/set-current-line-item-property';
import { blankLineItem } from './invoices/constants/blank-line-item';
import { setCurrentRecurringInvoice } from './recurring-invoices/extra-reducers/set-current-recurring-invoice';
import { RecurringInvoice } from 'common/interfaces/recurring-invoice';
import { blankInvitation } from './invoices/constants/blank-invitation';
import { deleteRecurringInvoiceItem } from './recurring-invoices/extra-reducers/delete-recurring-invoice-item';
interface RecurringInvoiceState {
  api?: any;
  current?: RecurringInvoice;
  invoiceSum?: InvoiceSum;
}

const initialState: RecurringInvoiceState = {
  api: {},
};

export const recurringInvoiceSlice = createSlice({
  name: 'recurringInvoice',
  initialState,
  reducers: {
    injectBlankItemIntoCurrent: (state) => {
      state.current?.line_items.push(blankLineItem);
    },
    setCurrentRecurringInvoicePropertySync: (
      state,
      payload: PayloadAction<{
        property: keyof RecurringInvoice;
        value: unknown;
      }>
    ) => {
      if (state.current) {
        state.current = set(
          state.current,
          payload.payload.property,
          payload.payload.value
        );
      }
    },
    toggleCurrentRecurringInvoiceInvitation: (
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
    builder.addCase(setCurrentRecurringInvoice.fulfilled, (state, payload) => {
      state.current = payload.payload.invoice;

      if (typeof state.current.line_items === 'string') {
        state.current.line_items = [];
      }

      if (payload.payload.client && payload.payload.currency) {
        state.invoiceSum = new InvoiceSum(
          cloneDeep(state.current),
          cloneDeep(payload.payload.currency)
        ).build();

        state.current = state.invoiceSum.invoice as RecurringInvoice;
      }
    });

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
            ).build().invoice as RecurringInvoice;
          }
        }
      }
    );

    builder.addCase(setCurrentLineItemProperty.fulfilled, (state, payload) => {
      if (state.current) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        state.current.line_items[payload.payload.position][
          payload.payload.property
        ] = payload.payload.value;

        state.current = new InvoiceSum(
          cloneDeep(state.current),
          cloneDeep(payload.payload.currency as Currency)
        ).build().invoice as RecurringInvoice;
      }
    });

    builder.addCase(deleteRecurringInvoiceItem.fulfilled, (state, payload) => {
      if (state.current) {
        state.current.line_items.splice(payload.payload.payload, 1);
      }

      if (state.current && payload.payload.client && payload.payload.currency) {
        state.current = new InvoiceSum(
          cloneDeep(state.current),
          cloneDeep(payload.payload.currency)
        ).build().invoice as RecurringInvoice;
      }
    });
  },
});

export const {
  injectBlankItemIntoCurrent,
  setCurrentRecurringInvoicePropertySync,
  toggleCurrentRecurringInvoiceInvitation,
} = recurringInvoiceSlice.actions;
