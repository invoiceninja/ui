/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { createSlice } from '@reduxjs/toolkit';

interface AccountState {
  api: any;
}

const initialState: AccountState = {
  api: {},
};

export const accountSlice = createSlice({
  name: 'token',
  initialState,
  reducers: {
    updateAccount: (state, action: any) => {
      state.api = action.payload;
    },
  },
});

export const { updateAccount } = accountSlice.actions;
