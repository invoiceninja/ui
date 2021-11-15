/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Authenticated } from "../../dtos/authentication";

interface UserState {
  authenticated: boolean;
  user: any;
}

const initialState: UserState = {
  authenticated: false,
  user: {},
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    authenticate: (state, action: PayloadAction<Authenticated>) => {
      state.authenticated = true;
      state.user = action.payload.user;
    },
  },
});

export const { authenticate } = userSlice.actions;
