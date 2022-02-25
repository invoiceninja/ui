/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ClientResolver } from 'common/helpers/clients/client-resolver';
import { CurrencyResolver } from 'common/helpers/currencies/currency-resolver';
import { InvoiceSum } from 'common/helpers/invoices/invoice-sum';
import { Currency } from 'common/interfaces/currency';
import { Invoice } from 'common/interfaces/invoice';
import { InvoiceItem } from 'common/interfaces/invoice-item';
import { cloneDeep, set } from 'lodash';

const clientResolver = new ClientResolver();
const currencyResolver = new CurrencyResolver();

export const setCurrentLineItemProperty = createAsyncThunk(
  'invoices/setCurrentInvoiceProperty',
  async (payload: any, thunkApi) => {
    const state = thunkApi.getState() as any;

    const client = await clientResolver.find(state.invoices.current.client_id);
    const currency = await currencyResolver.find(client.settings.currency_id); // or company currency

    payload.client = client;
    payload.currency = currency;

    return payload;
  }
);

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

const blankInvitation = {
  client_contact_id: '',
  is_deleted: false,
  isChanged: false,
  key: '',
  link: '',
  opened_date: '',
  sent_date: '',
  viewed_date: '',
  created_at: 0,
  archived_at: 0,
  updated_at: 0,
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
    deleteInvoiceLineItem: (state, payload: PayloadAction<number>) => {
      if (state.current) {
        state.current.line_items.splice(payload.payload, 1);
      }
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
  },
});

export const {
  setCurrentInvoice,
  injectBlankItemIntoCurrent,
  setCurrentInvoiceProperty,
  deleteInvoiceLineItem,
  toggleCurrentInvoiceInvitation,
} = invoiceSlice.actions;
