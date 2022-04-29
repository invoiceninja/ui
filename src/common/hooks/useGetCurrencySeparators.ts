/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ClientResolver } from 'common/helpers/clients/client-resolver';
import { CurrencyResolver } from 'common/helpers/currencies/currency-resolver';
import { Client } from 'common/interfaces/client';
import { Currency } from 'common/interfaces/currency';
import React from 'react';
import { useCurrentCompany } from './useCurrentCompany';
import { useCurrentInvoice } from './useCurrentInvoice';
import { useResolveCountry } from './useResolveCountry';

export function useGetCurrencySeparators(
  setInputCurrencySeparators: React.Dispatch<
    React.SetStateAction<
      | {
          decimal_separator: string;
          precision: number;
          thousand_separator: string;
        }
      | undefined
    >
  >
) {
  const company = useCurrentCompany();
  const invoice = useCurrentInvoice();

  const clientResolver = new ClientResolver();
  const currencyresolver = new CurrencyResolver();
  const resolveCountry = useResolveCountry();
  return async (client_id: string) => {
    if (invoice?.client_id) {
      const client: Client = await clientResolver.find(client_id);

      const currency: Currency | undefined = await currencyresolver.find(
        client.settings.currency_id
      );
      const companyCountry = resolveCountry(company.settings.country_id);
      console.log('country', companyCountry);
      console.log('currency', currency);

      currency &&
        setInputCurrencySeparators({
          thousand_separator:
            companyCountry?.thousand_separator || currency.thousand_separator,
          decimal_separator:
            companyCountry?.decimal_separator || currency.decimal_separator,
          precision: currency.precision,
        });
    } else {
      const currency: Currency | undefined = await currencyresolver.find(
        company.settings?.currency_id
      );
      const companyCountry = resolveCountry(company.settings.country_id);

      currency &&
        setInputCurrencySeparators({
          thousand_separator:
            companyCountry?.thousand_separator || currency.thousand_separator,
          decimal_separator:
            companyCountry?.decimal_separator || currency.decimal_separator,
          precision: currency.precision,
        });
    }
  };
}
