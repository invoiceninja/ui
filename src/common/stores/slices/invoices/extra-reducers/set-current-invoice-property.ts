/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { ClientResolver } from 'common/helpers/clients/client-resolver';
import { CurrencyResolver } from 'common/helpers/currencies/currency-resolver';
import { Client } from 'common/interfaces/client';
import { Currency } from 'common/interfaces/currency';

const clientResolver = new ClientResolver();
const currencyResolver = new CurrencyResolver();

export const setCurrentInvoiceProperty = createAsyncThunk(
  'invoices/setCurrentInvoiceProperty',
  async (payload: any, thunkApi) => {
    let client: Client | undefined = undefined;
    let currency: Currency | undefined = undefined;

    const state = thunkApi.getState() as any;

    if (state.invoices.current?.client_id) {
      client = await clientResolver.find(state.invoices.current?.client_id);
    }

    if (client) {
      currency = await currencyResolver.find(client.settings?.currency_id); // or company currency
    }

    return { client, currency, payload };
  }
);
