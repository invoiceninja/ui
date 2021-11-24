/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { createSlice } from "@reduxjs/toolkit";

interface CompanyState {
  api: any;
}

const initialState: CompanyState = {
  api: {},
};

export const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    updateCompany: (state, action: any) => {
      state.api = action.payload;
    },
  },
});

export const { updateCompany } = companySlice.actions;
