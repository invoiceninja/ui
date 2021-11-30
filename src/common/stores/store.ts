/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/dist/query';
import { accountSlice } from './slices/account';
import { companySlice } from './slices/company';
import { invoiceSlice } from './slices/invoices';
import { productsSlice } from './slices/products';
import { settingsSlice } from './slices/settings';
import { tokenSlice } from './slices/token';
import { userSlice } from './slices/user';

export const store = configureStore({
  reducer: {
    company: companySlice.reducer,
    user: userSlice.reducer,
    products: productsSlice.reducer,
    settings: settingsSlice.reducer,
    token: tokenSlice.reducer,
    account: accountSlice.reducer,
    invoices: invoiceSlice.reducer,
  },
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
