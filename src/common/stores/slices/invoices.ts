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
import { Currency } from 'common/interfaces/currency';
import { Invoice } from 'common/interfaces/invoice';
import { cloneDeep, set } from 'lodash';
import { blankInvitation } from './invoices/constants/blank-invitation';
import { blankLineItem } from './invoices/constants/blank-line-item';
import { deleteInvoiceLineItem } from './invoices/extra-reducers/delete-invoice-item';
import { setCurrentInvoiceProperty } from './invoices/extra-reducers/set-current-invoice-property';
import { setCurrentLineItemProperty } from './invoices/extra-reducers/set-current-line-item-property';
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
    toggleCurrentInvoiceInvitation: (
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
    setCurrentInvoicePropertySync: (
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
  },
  extraReducers: (builder) => {
    builder.addCase(setCurrentLineItemProperty.fulfilled, (state, payload) => {
      if (state.current) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        state.current.line_items[payload.payload.position][
          payload.payload.property
        ] = payload.payload.value;

        state.current = new InvoiceSum(
          cloneDeep(state.current as Invoice),
          cloneDeep(payload.payload.currency as Currency)
        ).build().invoice;
      }
    });

    builder.addCase(deleteInvoiceLineItem.fulfilled, (state, payload) => {
      if (state.current) {
        state.current.line_items.splice(payload.payload.payload, 1);
      }

      state.current = new InvoiceSum(
        cloneDeep(state.current as Invoice),
        cloneDeep(payload.payload.currency as Currency)
      ).build().invoice;
    });

    builder.addCase(setCurrentInvoiceProperty.fulfilled, (state, payload) => {
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
    });
  },
});

export const {
  setCurrentInvoice,
  injectBlankItemIntoCurrent,
  toggleCurrentInvoiceInvitation,
  setCurrentInvoicePropertySync,
} = invoiceSlice.actions;
