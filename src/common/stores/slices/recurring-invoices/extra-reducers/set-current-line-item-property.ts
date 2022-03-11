/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { ClientResolver } from 'common/helpers/clients/client-resolver';
import { CurrencyResolver } from 'common/helpers/currencies/currency-resolver';

const clientResolver = new ClientResolver();
const currencyResolver = new CurrencyResolver();

export const setCurrentLineItemProperty = createAsyncThunk(
  'recurringInvoices/setCurrentLineItemProperty',
  async (payload: any, thunkApi) => {
    const state = thunkApi.getState() as any;

    const client = await clientResolver.find(
      state.recurringInvoices.current.client_id
    );
    const currency = await currencyResolver.find(client.settings.currency_id); // or company currency

    payload.client = client;
    payload.currency = currency;

    return payload;
  }
);
