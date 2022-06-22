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
import { Credit } from 'common/interfaces/credit';
import { Currency } from 'common/interfaces/currency';

const clientResolver = new ClientResolver();
const currencyResolver = new CurrencyResolver();

export const setCurrentCredit = createAsyncThunk(
  'credits/setCurrentCredit',
  async (payload: Credit) => {
    let client: Client | undefined = undefined;
    let currency: Currency | undefined = undefined;

    if (payload?.client_id) {
      client = await clientResolver.find(payload.client_id);
    }

    if (client && client?.settings?.currency_id) {
      currency = await currencyResolver.find(client.settings.currency_id);
    }

    return { client, currency, credit: payload };
  }
);
