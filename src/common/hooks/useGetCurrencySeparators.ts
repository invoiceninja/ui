/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React from 'react';
import { useCurrencyResolver } from '$app/common/helpers/currencies/currency-resolver';
import { Client } from '$app/common/interfaces/client';
import { Currency } from '$app/common/interfaces/currency';
import { DecimalInputSeparators } from '$app/common/interfaces/decimal-number-input-separators';
import { Vendor } from '$app/common/interfaces/vendor';
import { RelationType } from '$app/pages/invoices/common/components/ProductsTable';
import { useClientResolver } from './clients/useClientResolver';
import { useCurrentCompany } from './useCurrentCompany';
import { useResolveCountry } from './useResolveCountry';
import { useVendorResolver } from './vendors/useVendorResolver';

export function useGetCurrencySeparators(
  setInputCurrencySeparators?: React.Dispatch<
    React.SetStateAction<DecimalInputSeparators | undefined>
  >
) {
  const company = useCurrentCompany();

  const clientResolver = useClientResolver();
  const vendorResolver = useVendorResolver();

  const currencyResolver = useCurrencyResolver();
  const resolveCountry = useResolveCountry();

  return async (relationId: string, relationType: RelationType) => {
    let separators: DecimalInputSeparators | undefined;

    if (relationId.length >= 1 && relationType === 'client_id') {
      await clientResolver.find(relationId).then(async (client: Client) => {
        await currencyResolver
          .find(client.settings.currency_id || company.settings?.currency_id)
          .then((currency: Currency | undefined) => {
            const companyCountry = resolveCountry(company.settings.country_id);

            const currentSeparators = {
              thousandSeparator:
                companyCountry?.thousand_separator ||
                currency?.thousand_separator ||
                ',',
              decimalSeparator:
                companyCountry?.decimal_separator ||
                currency?.decimal_separator ||
                '.',
              precision: currency?.precision || 2,
            };

            if (setInputCurrencySeparators) {
              setInputCurrencySeparators(currentSeparators);
            } else {
              separators = currentSeparators;
            }
          });
      });
    } else if (relationId.length >= 1 && relationType === 'vendor_id') {
      await vendorResolver.find(relationId).then(async (vendor: Vendor) => {
        await currencyResolver
          .find(vendor.currency_id || company.settings?.currency_id)
          .then((currency: Currency | undefined) => {
            const companyCountry = resolveCountry(company.settings.country_id);

            const currentSeparators = {
              thousandSeparator:
                companyCountry?.thousand_separator ||
                currency?.thousand_separator ||
                ',',
              decimalSeparator:
                companyCountry?.decimal_separator ||
                currency?.decimal_separator ||
                '.',
              precision: currency?.precision || 2,
            };

            if (setInputCurrencySeparators) {
              setInputCurrencySeparators(currentSeparators);
            } else {
              separators = currentSeparators;
            }
          });
      });
    } else {
      await currencyResolver
        .find(company.settings?.currency_id)
        .then((currency: Currency | undefined) => {
          const companyCountry = resolveCountry(company.settings.country_id);

          const currentSeparators = {
            thousandSeparator:
              companyCountry?.thousand_separator ||
              currency?.thousand_separator ||
              ',',
            decimalSeparator:
              companyCountry?.decimal_separator ||
              currency?.decimal_separator ||
              '.',
            precision: currency?.precision || 2,
          };

          if (setInputCurrencySeparators) {
            setInputCurrencySeparators(currentSeparators);
          } else {
            separators = currentSeparators;
          }
        });
    }

    return separators;
  };
}
