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

interface CompanyUser {
  currentIndex: number;
  api: any;
  changes: {
    company: any;
  };
}

type AvailableResources = 'company';

const initialState: CompanyUser = {
  currentIndex: 0,
  api: {},
  changes: {
    company: undefined,
  },
};

export const companyUserSlice = createSlice({
  name: 'companyUser',
  initialState,
  reducers: {
    changeCurrentIndex: (state, payload: PayloadAction<number>) => {
      state.currentIndex = payload.payload;
    },
    updateCompanyUsers: (state, action) => {
      state.api = action.payload;
    },
    injectInChanges: (
      state,
      action: PayloadAction<{ object: AvailableResources; data: any }>
    ) => {
      state.changes[action.payload.object] = action.payload.data;
    },
    updateChanges: (
      state,
      action: PayloadAction<{
        object: AvailableResources;
        property: string;
        value: any;
      }>
    ) => {
      state.changes[action.payload.object] = set(
        state.changes[action.payload.object],
        action.payload.property,
        action.payload.value
      );
    },
    resetChanges: (state, action: PayloadAction<AvailableResources>) => {
      state.changes[action.payload] =
        state.api[state.currentIndex][action.payload];
    },
    updateRecord: (
      state,
      action: PayloadAction<{
        object: AvailableResources;
        data: any;
      }>
    ) => {
      state.api[state.currentIndex][action.payload.object] =
        action.payload.data;
    },
  },
});

export const {
  changeCurrentIndex,
  updateCompanyUsers,
  injectInChanges,
  resetChanges,
  updateChanges,
  updateRecord,
} = companyUserSlice.actions;
