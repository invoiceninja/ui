/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { set } from 'lodash';
import { Authenticated, Registered } from '../../dtos/authentication';

interface UserState {
  authenticated: boolean;
  user: any;
  changes: any;
}

const initialState: UserState = {
  authenticated: false,
  user: {},
  changes: {},
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    authenticate: (state, action: PayloadAction<Authenticated>) => {
      state.authenticated = true;
      state.user = action.payload.user;

      localStorage.setItem('X-NINJA-TOKEN', action.payload.token);
    },
    register: (state, action: PayloadAction<Registered>) => {
      state.authenticated = true;
      state.user = action.payload.user;

      localStorage.setItem('X-NINJA-TOKEN', action.payload.token);
    },
    updateChanges: (
      state,
      action: PayloadAction<{ property: string; value: any }>
    ) => {
      set(state.changes, action.payload.property, action.payload.value);
    },
    resetChanges: (state) => {
      state.changes = {};
    },
    deletePassword: (state) => {
      delete state.changes['password'];
      delete state.user['password'];
    },
  },
});

export const {
  authenticate,
  register,
  updateChanges,
  resetChanges,
  deletePassword,
} = userSlice.actions;
