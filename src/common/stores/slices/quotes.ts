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
import { invoiceSlice } from './invoices';

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
});

export const {} = invoiceSlice.actions;
