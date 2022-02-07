/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '@invoiceninja/cards';
import { InputLabel } from '@invoiceninja/forms';
import axios from 'axios';
import { endpoint } from 'common/helpers';
import { Client as IClient } from 'common/interfaces/client';
import { defaultHeaders } from 'common/queries/common/headers';
import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';
import AsyncSelect from 'react-select/async';
import { CreateClient } from './CreateClient';

interface IClientArrayRecord {
  value: string;
  label: string;
}

export function Client() {
  const [t] = useTranslation();

  const debouncedSearch = debounce((query, resolve) => {
    axios
      .get(endpoint(`/api/v1/clients?filter=${query}`), {
        headers: defaultHeaders,
      })
      .then((response) => {
        const array: IClientArrayRecord[] = [];

        response?.data?.data?.map((client: IClient) =>
          array.push({ value: client.id, label: client.display_name })
        );

        resolve(array);
      });
  }, 500);

  const loadOptions = (query: string) => {
    return new Promise((resolve) => debouncedSearch(query, resolve));
  };

  return (
    <Card className="col-span-12 xl:col-span-4 h-max" withContainer>
      <div className="flex items-center justify-between">
        <InputLabel>{t('client')}</InputLabel>
        <CreateClient />
      </div>

      <AsyncSelect
        cacheOptions
        defaultOptions
        loadOptions={loadOptions}
        menuPortalTarget={document.body}
      />
    </Card>
  );
}
