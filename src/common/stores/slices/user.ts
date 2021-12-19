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
  isDirty: boolean;
}

const initialState: UserState = {
  authenticated: false,
  user: {},
  isDirty: false,
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
      state.isDirty = true;
      set(state.user, action.payload.property, action.payload.value);
    },
    deletePassword: (state) => {
      delete state.user['password'];
    },
  },
});

export const { authenticate, register, updateChanges, deletePassword } =
  userSlice.actions;
