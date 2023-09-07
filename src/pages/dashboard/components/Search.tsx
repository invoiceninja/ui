/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { SearchRecord, SearchResponse } from '$app/common/interfaces/search';
import { useNavigate } from 'react-router-dom';
import { ComboboxStatic, Entry } from '$app/components/forms/Combobox';
import { AxiosResponse } from 'axios';
import { v4 } from 'uuid';

export function Search() {
  const [t] = useTranslation();

  const { data } = useQuery(
    '/api/v1/search',
    () =>
      request('POST', endpoint('/api/v1/search')).then(
        (response: AxiosResponse<SearchResponse>) => {
          const formatted: Entry<SearchRecord>[] = [];

          Object.entries(response.data).forEach(
            ([key, value]: [string, SearchRecord[]]) => {
              value.forEach((record: SearchRecord) => {
                formatted.push({
                  id: v4(),
                  label: record.name,
                  value: record.id,
                  resource: record,
                  searchable: `${t(key)}: ${record.name}`,
                  eventType: 'external',
                });
              });
            }
          );

          return formatted;
        }
      ),
    { staleTime: Infinity }
  );

  const navigate = useNavigate();

  return (
    <ComboboxStatic<SearchRecord>
      inputOptions={{ value: 'id', placeholder: `${t('search')}...` }}
      entries={data ?? []}
      entryOptions={{ id: 'id', label: 'id', value: 'id' }}
      onChange={(entry: Entry<SearchRecord>) => entry.resource && navigate(entry.resource.path)}
      onEmptyValues={() => console.log()}
    />
  );
}
