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
import logo from '../../../resources/images/invoiceninja-logo@light.png';
import { set } from 'lodash';

interface CompanyState {
  companies: any;
  current: any;
  logo: string;
  changes: any;
}

const initialState: CompanyState = {
  companies: [],
  current: {},
  logo,
  changes: {},
};

export const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    updateChanges: (
      state,
      action: PayloadAction<{ property: string; value: any }>
    ) => {
      set(state.changes, action.payload.property, action.payload.value);
    },
    resetChanges: (state) => {
      state.changes = {};
    },
    updateCompanies: (state, action) => {
      state.companies = action.payload;
    },
    updateCompany: (state, action: any) => {
      state.current = action.payload;

      state.logo =
        action.payload.company.settings.company_logo === ''
          ? logo
          : action.payload.company.settings.company_logo;
    },
    updateCompanyRecord: (state, action: any) => {
      state.current.company = action.payload;

      let position = state.companies.findIndex(
        (record: any) => record.company.id === action.payload.id
      );

      state.companies[position].company = action.payload;

      state.logo =
        action.payload.settings.company_logo === ''
          ? logo
          : action.payload.settings.company_logo;
    },
  },
});

export const {
  updateChanges,
  resetChanges,
  updateCompanies,
  updateCompany,
  updateCompanyRecord,
} = companySlice.actions;
