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
import { Credit } from 'common/interfaces/credit';

interface CreditState {
  api?: any;
  current?: Credit;
  invoiceSum?: InvoiceSum;
}

const initialState: CreditState = {
  api: {},
};

export const creditSlice = createSlice({
  name: 'quotes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {},
});

export const {} = creditSlice.actions;
