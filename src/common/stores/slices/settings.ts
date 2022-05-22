/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  colors: {
    primary: string;
    secondary?: string;
  };
  darkMode: boolean;
  isMiniSidebar: boolean;
}

const initialState: SettingsState = {
  colors: {
    primary: '#117DC0',
  },
  darkMode: false,
  isMiniSidebar: false,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updatePrimaryColor: (state, action: PayloadAction<{ color: string }>) => {
      state.colors.primary = action.payload.color;
    },
    setDarkMode: (state, action: PayloadAction<{ status: boolean }>) => {
      state.darkMode = action.payload.status;
    },
    setIsMiniSidebar: (state, action: PayloadAction<{ status: boolean }>) => {
      state.isMiniSidebar = action.payload.status;
    },
  },
});

export const { updatePrimaryColor, setDarkMode, setIsMiniSidebar } =
  settingsSlice.actions;
