/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/dist/query';
import { companyDocumentSlice } from './slices/company-documents';
import { productsSlice } from './slices/products';
import { settingsSlice } from './slices/settings';
import { userSlice } from './slices/user';
import { companyUserSlice } from './slices/company-users';
import { creditSlice } from './slices/credits';

export const store = configureStore({
  reducer: {
    companyUsers: companyUserSlice.reducer,
    companyDocuments: companyDocumentSlice.reducer,
    user: userSlice.reducer,
    products: productsSlice.reducer,
    settings: settingsSlice.reducer,
    credits: creditSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
