/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { Number } from 'common/helpers/number';
import { request } from 'common/helpers/request';
import { useResolveClientCurrency } from 'common/hooks/useResolveClientCurrency';
import { useResolveCountry } from 'common/hooks/useResolveCountry';
import { Client } from 'common/interfaces/client';
import { Country } from 'common/interfaces/country';
import { Currency } from 'common/interfaces/currency';
import { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { generatePath } from 'react-router-dom';
import { ProductTableResource } from '../components/ProductsTable';

interface Props {
  resource: ProductTableResource | undefined;
}

export function useFormatMoney(props: Props) {
  const resolveCurrency = useResolveClientCurrency();
  const resolveCountry = useResolveCountry();

  const resource = props.resource;
  const queryClient = useQueryClient();

  const [country, setCountry] = useState<Country>();
  const [currency, setCurrency] = useState<Currency>();
  const [client, setClient] = useState<Client>();

  useEffect(() => {
    if (resource?.client_id) {
      queryClient
        .fetchQuery(
          generatePath('/api/v1/clients/:id', { id: resource.client_id }),
          () =>
            request(
              'GET',
              endpoint('/api/v1/clients/:id', { id: resource.client_id })
            ),
          { staleTime: Infinity }
        )
        .then((response) => setClient(response.data.data))
        .catch((error) => console.error(error));
    }
  }, [resource]);

  useEffect(() => {
    if (client) {
      setCurrency(resolveCurrency(client));
      setCountry(resolveCountry(client.country_id));
    }
  }, [client]);

  return (value: number | string) => {
    if (currency && country) {
      return Number.formatMoney(value, currency, country);
    }

    return value;
  };
}
