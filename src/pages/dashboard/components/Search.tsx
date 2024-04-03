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
import { SearchRecord, SearchResponse } from '$app/common/interfaces/search';
import { useNavigate } from 'react-router-dom';
import { Entry } from '$app/components/forms/Combobox';
import { AxiosResponse } from 'axios';
import { v4 } from 'uuid';
import { useColorScheme } from '$app/common/colors';
import { memo, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { styled } from 'styled-components';
import { Combobox } from '@headlessui/react';
import { useClickAway } from 'react-use';
import collect from 'collect.js';

export function useSearch() {
  const [t] = useTranslation();

  const { data } = useQuery(
    ['/api/v1/search'],
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

  return data;
}

const ComboboxOption = styled(Combobox.Option)`
  color: ${(props) => props.theme.color};
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

export function Search$() {
  const [t] = useTranslation();
  const [query, setQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const data = useSearch();
  const colors = useColorScheme();
  const navigate = useNavigate();

  const comboboxRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const filtered = collect(data)
    .filter(
      (record) =>
        record.searchable.toLowerCase().includes(query.toLowerCase()) ||
        record.label.toLowerCase().includes(query.toLowerCase()) ||
        record.value.toString().toLowerCase().includes(query.toLowerCase())
    )
    .take(100);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();

        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isVisible === false) {
      setQuery('');
    }
  }, [isVisible]);

  useClickAway(comboboxRef, () => setIsVisible(false));

  return (
    <Combobox
      as="div"
      onChange={(value: Entry<SearchRecord>) =>
        value.resource ? navigate(value.resource.path) : null
      }
      className="w-full"
      ref={comboboxRef}
    >
      <div className="relative mt-2">
        <Combobox.Input
          className="border-transparent focus:border-transparent focus:ring-0 w-full"
          onChange={(event) => setQuery(event.target.value)}
          ref={inputRef}
          onFocus={() => setIsVisible(true)}
          placeholder={`${t('search')}... (Ctrl K)`}
          style={{ backgroundColor: colors.$1, color: colors.$3 }}
        />

        <Combobox.Options
          className={classNames(
            'absolute border rounded w-96 max-h-72 overflow-y-auto shadow-lg',
            {
              hidden: !isVisible,
            }
          )}
          style={{ backgroundColor: colors.$1, borderColor: colors.$4 }}
          static={true}
        >
          {filtered?.map((entry) => (
            <ComboboxOption
              key={entry.id}
              value={entry}
              theme={{ color: colors.$3, hoverColor: colors.$2 }}
              className="cursor-pointer rounded px-4 py-2 active:font-semibold"
            >
              {({ active }) => (
                <span
                  className={classNames(
                    'block truncate space-x-1',
                    active && 'font-semibold'
                  )}
                >
                  <div>
                    <p className="text-xs font-semibold">
                      {entry.resource?.heading}
                    </p>

                    <p>{entry.label}</p>
                  </div>
                </span>
              )}
            </ComboboxOption>
          ))}

          {filtered.count() === 0 && (
            <ComboboxOption
              value={null}
              theme={{ color: colors.$3, hoverColor: colors.$2 }}
              className="cursor-not-allowed rounded px-4 py-2 active:font-semibold"
              disabled
            >
              {({ active }) => (
                <span
                  className={classNames(
                    'block truncate space-x-1',
                    active && 'font-semibold'
                  )}
                >
                  <p className="text-sm">{t('no_match_found')}</p>
                </span>
              )}
            </ComboboxOption>
          )}
        </Combobox.Options>
      </div>
    </Combobox>
  );
}

export const Search = memo(Search$);
