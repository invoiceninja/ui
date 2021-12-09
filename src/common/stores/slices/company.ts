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
  api: any;
  logo: string;
  isDirty: boolean;
}

const initialState: CompanyState = {
  api: {},
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
      set(state.api, action.payload.property, action.payload.value);
    },
    updateCompany: (state, action: any) => {
      state.api = action.payload;

      state.logo =
        action.payload.settings.company_logo === ''
          ? logo
          : action.payload.settings.company_logo;

      state.isDirty = false;
    },
  },
});

export const { updateChanges, updateCompany } = companySlice.actions;
