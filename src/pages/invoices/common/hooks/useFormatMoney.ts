/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Number } from 'common/helpers/number';
import { useClientResolver } from 'common/hooks/clients/useClientResolver';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useResolveCountry } from 'common/hooks/useResolveCountry';
import { useResolveCurrency } from 'common/hooks/useResolveCurrency';
import { useVendorResolver } from 'common/hooks/vendors/useVendorResolver';
import { Client } from 'common/interfaces/client';
import { Country } from 'common/interfaces/country';
import { Currency } from 'common/interfaces/currency';
import { Vendor } from 'common/interfaces/vendor';
import { useEffect, useState } from 'react';
import {
  ProductTableResource,
  RelationType,
} from '../components/ProductsTable';

interface Props {
  resource: ProductTableResource | undefined;
  relationType: RelationType;
}

export function useFormatMoney(props: Props) {
  const company = useCurrentCompany();

  const currencyResolver = useResolveCurrency();
  const countryResolver = useResolveCountry();
  const vendorResolver = useVendorResolver();
  const clientResolver = useClientResolver();

  const { resource, relationType } = props;

  const [country, setCountry] = useState<Country>();
  const [currency, setCurrency] = useState<Currency>();

  const [relation, setRelation] = useState<Client | Vendor>();

  useEffect(() => {
    if (resource?.[relationType] && relationType === 'client_id') {
      clientResolver
        .find(resource.client_id)
        .then((client) => setRelation(client));
    }

    if (resource?.[relationType] && relationType === 'vendor_id') {
      vendorResolver
        .find(resource.vendor_id)
        .then((vendor) => setRelation(vendor));
    }
  }, [resource]);

  useEffect(() => {
    if (relation && relationType === 'client_id') {
      const client = relation as Client;

      setCurrency(
        currencyResolver(
          client.settings.currency_id || company?.settings.currency_id
        )
      );

      setCountry(
        countryResolver(client.country_id || company?.settings.country_id)
      );
    }

    if (relation && relationType === 'vendor_id') {
      const vendor = relation as Vendor;

      setCurrency(
        currencyResolver(vendor.currency_id || company?.settings.currency_id)
      );

      setCountry(
        countryResolver(vendor.country_id || company?.settings.country_id)
      );
    }
  }, [relation]);

  return (value: number | string) => {
    if (currency && country) {
      return Number.formatMoney(value, currency, country);
    }

    return value;
  };
}
