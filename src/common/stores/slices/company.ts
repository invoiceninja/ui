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
  isDirty: boolean;
}

const initialState: CompanyState = {
  companies: [],
  current: {},
  logo,
  isDirty: false,
};

export const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    updateChanges: (
      state,
      action: PayloadAction<{ property: string; value: any }>
    ) => {
      state.isDirty = true;
      set(state.current.company, action.payload.property, action.payload.value);
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

      state.isDirty = false;
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

      state.isDirty = false;
    },
  },
});

export const {
  updateChanges,
  updateCompanies,
  updateCompany,
  updateCompanyRecord,
} = companySlice.actions;
