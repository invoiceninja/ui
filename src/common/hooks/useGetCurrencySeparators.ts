/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { CurrencyResolver } from 'common/helpers/currencies/currency-resolver';
import { Client } from 'common/interfaces/client';
import { Currency } from 'common/interfaces/currency';
import { DecimalInputSeparators } from 'common/interfaces/decimal-number-input-separators';
import { RelationType } from 'pages/invoices/common/components/ProductsTable';
import React from 'react';
import { useClientResolver } from './clients/useClientResolver';
import { useCurrentCompany } from './useCurrentCompany';
import { useResolveCountry } from './useResolveCountry';
import { useVendorResolver } from './vendors/useVendorResolver';

export function useGetCurrencySeparators(
  setInputCurrencySeparators: React.Dispatch<
    React.SetStateAction<DecimalInputSeparators | undefined>
  >
) {
  const company = useCurrentCompany();

  const clientResolver = useClientResolver();
  const vendorResolver = useVendorResolver();

  const currencyResolver = new CurrencyResolver();
  const resolveCountry = useResolveCountry();

  return (relationId: string, relationType: RelationType) => {
    if (relationId.length >= 1 && relationType === 'client_id') {
      clientResolver.find(relationId).then((client: Client) =>
        currencyResolver
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
    } else if (relationId.length >= 1 && relationType === 'vendor_id') {
      vendorResolver.find(relationId).then((vendor: any) =>
        currencyResolver
          .find(vendor.currency_id)
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
      currencyResolver
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
