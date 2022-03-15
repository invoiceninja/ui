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
import { Currency } from 'common/interfaces/currency';
import { Invoice } from 'common/interfaces/invoice';
import { cloneDeep, set } from 'lodash';
import { setCurrentRecurringInvoiceProperty } from './recurring-invoices/extra-reducers/set-current-recurring-invoice-property';
import { setCurrentLineItemProperty } from './recurring-invoices/extra-reducers/set-current-line-item-property';
import { blankLineItem } from './invoices/constants/blank-line-item';
import { setCurrentRecurringInvoice } from './recurring-invoices/extra-reducers/set-current-recurring-invoice';
interface RecurringInvoiceState {
  api?: any;
  current?: any;
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

        state.current = state.invoiceSum.invoice;
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
            ).build().invoice;
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
          cloneDeep(state.current as Invoice),
          cloneDeep(payload.payload.currency as Currency)
        ).build().invoice;
      }
    });
  },
});

export const { injectBlankItemIntoCurrent } = recurringInvoiceSlice.actions;
