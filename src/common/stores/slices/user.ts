/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { set } from 'lodash';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Authenticated, Registered } from '../../dtos/authentication';

interface UserState {
  authenticated: boolean;
  user: any;
  changes: any;
  msal: any;
}

const initialState: UserState = {
  authenticated: false,
  user: {},
  changes: {},
  msal: {},
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setMsal: (state, action) =>{
      state.user.msal = action;
    },
    updateUser: (state, action) => {
      state.user = action.payload;
    },
    injectInChanges: (state) => {
      state.changes = state.user;
    },
    injectInChangesWithData: (state, action) => {
      state.changes = action.payload;
    },
    resetChanges: (state) => {
      state.changes = state.user;
    },
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
    deletePassword: (state) => {
      delete state.changes['password'];
      delete state.user['password'];
    },
  },
});

export const {
  updateUser,
  injectInChanges,
  injectInChangesWithData,
  resetChanges,
  authenticate,
  register,
  updateChanges,
  deletePassword,
} = userSlice.actions;
