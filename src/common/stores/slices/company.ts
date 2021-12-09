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
import logo from '../../../resources/images/invoiceninja-logo@light.png';

interface CompanyState {
  api: any;
  logo: string;
}

const initialState: CompanyState = {
  api: {},
  logo,
};

export const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    updateCompany: (state, action: any) => {
      state.api = action.payload;
      state.logo =
        action.payload.settings.company_logo === ''
          ? logo
          : action.payload.settings.company_logo;
    },
  },
});

export const { updateCompany } = companySlice.actions;
