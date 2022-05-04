/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ClientResolver } from 'common/helpers/clients/client-resolver';
import { CurrencyResolver } from 'common/helpers/currencies/currency-resolver';
import { Client } from 'common/interfaces/client';
import { Currency } from 'common/interfaces/currency';
import { DecimalInputSeparators } from 'common/interfaces/decimal-number-input-separators';
import React from 'react';
import { useCurrentCompany } from './useCurrentCompany';
import { useCurrentInvoice } from './useCurrentInvoice';
import { useResolveCountry } from './useResolveCountry';

export function useGetCurrencySeparators(
  setInputCurrencySeparators: React.Dispatch<
    React.SetStateAction<DecimalInputSeparators | undefined>
  >
) {
  const company = useCurrentCompany();
  const invoice = useCurrentInvoice();

  const clientResolver = new ClientResolver();
  const currencyresolver = new CurrencyResolver();
  const resolveCountry = useResolveCountry();

  return (client_id: string) => {
    if (invoice?.client_id) {
      clientResolver.find(client_id).then((client: Client) =>
        currencyresolver
          .find(client.settings.currency_id)
          .then((currency: Currency | undefined) => {
            const companyCountry = resolveCountry(company.settings.country_id);

            currency &&
              setInputCurrencySeparators({
                thousandSeparator:
                  companyCountry?.thousand_separator ||
                  currency.thousand_separator,
                decimalSeparator:
                  companyCountry?.decimal_separator ||
                  currency.decimal_separator,
                precision: currency.precision,
              });
          })
      );
    } else {
      currencyresolver
        .find(company.settings?.currency_id)
        .then((currency: Currency | undefined) => {
          const companyCountry = resolveCountry(company.settings.country_id);

          currency &&
            setInputCurrencySeparators({
              thousandSeparator:
                companyCountry?.thousand_separator ||
                currency.thousand_separator,
              decimalSeparator:
                companyCountry?.decimal_separator || currency.decimal_separator,
              precision: currency.precision,
            });
        });
    }
  };
}
