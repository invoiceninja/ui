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
import { invoiceSlice } from './slices/invoices';
import { companyDocumentSlice } from './slices/company-documents';
import { productsSlice } from './slices/products';
import { settingsSlice } from './slices/settings';
import { userSlice } from './slices/user';
import { companyUserSlice } from './slices/company-users';
import { recurringInvoiceSlice } from './slices/recurring-invoices';

export const store = configureStore({
  reducer: {
    companyUsers: companyUserSlice.reducer,
    companyDocuments: companyDocumentSlice.reducer,
    user: userSlice.reducer,
    products: productsSlice.reducer,
    settings: settingsSlice.reducer,
    invoices: invoiceSlice.reducer,
    recurringInvoices: recurringInvoiceSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
