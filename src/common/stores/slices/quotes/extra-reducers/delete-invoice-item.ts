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

const clientResolver = new ClientResolver();
const currencyResolver = new CurrencyResolver();

export const deleteInvoiceLineItem = createAsyncThunk(
  'quotes/deleteInvoiceLineItem',
  async (payload: any, thunkApi) => {
    const state = thunkApi.getState() as any;

    const client = await clientResolver.find(state.quotes.current.client_id);
    const currency = await currencyResolver.find(client.settings.currency_id); // or company currency

    return { client, currency, payload };
  }
);
