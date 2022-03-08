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
  reducers: {},
});
