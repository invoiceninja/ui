/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Number as NumberHelper } from '$app/common/helpers/number';
import { useClientResolver } from '$app/common/hooks/clients/useClientResolver';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useVendorResolver } from '$app/common/hooks/vendors/useVendorResolver';
import { Client } from '$app/common/interfaces/client';
import { Country } from '$app/common/interfaces/country';
import { Currency } from '$app/common/interfaces/currency';
import { Vendor } from '$app/common/interfaces/vendor';
import { useEffect, useState } from 'react';
import {
  ProductTableResource,
  RelationType,
} from '../components/ProductsTable';
import { useCurrencyResolver } from '$app/common/helpers/currencies/currency-resolver';
import { useCountryResolver } from '$app/common/helpers/country/country-resolver';

interface Props {
  resource: ProductTableResource | undefined;
  relationType: RelationType;
}

export function useFormatMoney(props: Props) {
  const company = useCurrentCompany();

  const currencyResolver = useCurrencyResolver();
  const countryResolver = useCountryResolver();
  const vendorResolver = useVendorResolver();
  const clientResolver = useClientResolver();

  const [clientId, setClientId] = useState<string>('');
  const [vendorId, setVendorId] = useState<string>('');

  const { resource, relationType } = props;

  const [country, setCountry] = useState<Country>();
  const [currency, setCurrency] = useState<Currency>();

  const [relation, setRelation] = useState<Client | Vendor>();

  useEffect(() => {
    if (clientId && relationType === 'client_id') {
      clientResolver.find(clientId).then((client) => setRelation(client));
    }

    if (vendorId && relationType === 'vendor_id') {
      vendorResolver.find(vendorId).then((vendor) => setRelation(vendor));
    }
  }, [clientId, vendorId]);

  useEffect(() => {
    resource?.vendor_id && setVendorId(resource.vendor_id);

    resource?.client_id && setClientId(resource.client_id);
  }, [resource?.client_id, resource?.vendor_id]);

  useEffect(() => {
    if (relationType === 'client_id') {
      const client = relation as Client | undefined;

      currencyResolver
        .find(client?.settings.currency_id || company?.settings.currency_id)
        .then((currencyResponse) => setCurrency(currencyResponse));

      countryResolver
        .find(client?.country_id || company?.settings.country_id)
        .then((countryResponse) => setCountry(countryResponse));
    }

    if (relationType === 'vendor_id') {
      const vendor = relation as Vendor | undefined;

      currencyResolver
        .find(vendor?.currency_id || company?.settings.currency_id)
        .then((currencyResponse) => setCurrency(currencyResponse));

      countryResolver
        .find(vendor?.country_id || company?.settings.country_id)
        .then((countryResponse) => setCountry(countryResponse));
    }
  }, [relation]);

  return (value: number | string) => {
    if (currency && country) {
      return NumberHelper.formatMoney(
        isNaN(Number(value)) ? 0 : value,
        currency,
        country
      );
    }

    return value;
  };
}
