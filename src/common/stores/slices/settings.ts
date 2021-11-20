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

interface SettingsState {
  colors: {
    isClass: boolean;
    primary: string;
    secondary?: string;
  };
}

const initialState: SettingsState = {
  colors: {
    isClass: true,
    primary: "green-800", 
  },
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {},
});

// export { } = settingsSlice.actions
