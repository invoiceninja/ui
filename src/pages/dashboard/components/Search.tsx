/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { Entry } from '$app/components/forms/Combobox';
import { AxiosResponse } from 'axios';
import { v4 } from 'uuid';
import { useColorScheme } from '$app/common/colors';
import { memo, useEffect, useRef, useState } from 'react';
import { styled } from 'styled-components';
import { Combobox } from '@headlessui/react';
import { useClickAway } from 'react-use';
import collect from 'collect.js';
import { usePreventNavigation } from '$app/common/hooks/usePreventNavigation';
import { debounce } from 'lodash';
import { InputField } from '$app/components/forms';
import { Modal } from '$app/components/Modal';

const ComboboxOption = styled(Combobox.Option)`
  color: ${(props) => props.theme.color};
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

const Div = styled.div`
  color: ${(props) => props.theme.color};
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

export function Search$() {
  const [t] = useTranslation();
  const [query, setQuery] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const preventNavigation = usePreventNavigation();
  const colors = useColorScheme();
  const comboboxRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { data, refetch, isFetching } = useQuery(
    ['/api/v1/search'],
    () => {
      const $endpoint =
        query.length === 0
          ? '/api/v1/search'
          : `/api/v1/search?search=${query}`;

      return request('POST', endpoint($endpoint)).then(
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
      );
    },
    { staleTime: Infinity }
  );

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
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isVisible === false) {
      setQuery('');
    }
  }, [isVisible]);

  useClickAway(comboboxRef, () => setIsVisible(false));

  const handleChange = debounce((value: string) => setQuery(value), 500);

  const options = filtered.count() === 0 ? collect(data) : filtered;

  useEffect(() => {
    if (query && filtered.count() === 0) {
      refetch();
    }
  }, [query]);

  return (
    <>
      <InputField
        className="border-transparent focus:border-transparent focus:ring-0 w-full"
        value={query}
        onValueChange={(value) => handleChange(value)}
        onClick={() => setIsModalOpen(true)}
        placeholder={`${t('search_placeholder')}. (Ctrl+K)`}
        style={{ backgroundColor: colors.$1, color: colors.$3 }}
      />

      <Modal visible={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {options?.map((entry) => (
          <Div
            key={entry.id}
            theme={{ color: colors.$3, hoverColor: colors.$2 }}
            className="cursor-pointer rounded px-4 py-2 active:font-semibold"
          >
            <span>
              <div>
                <p className="text-xs font-semibold">
                  {entry.resource?.heading}
                </p>
                <p>{entry.label}</p>
              </div>
            </span>
          </Div>
        ))}
      </Modal>

      {/* <Combobox
        as="div"
        onChange={(value: Entry<SearchRecord>) =>
          value.resource
            ? preventNavigation({
                url: value.resource.path,
              })
            : null
        }
        className="relative w-full max-w-[70%]"
        ref={comboboxRef}
      >
        <div className="relative mt-2">
          <div className="flex items-center">
            <span
              className={classNames({
                block: isFetching,
                hidden: !isFetching,
              })}
            >
              <Spinner />
            </span>

            <Combobox.Input
              className="border-transparent focus:border-transparent focus:ring-0 w-full"
              onChange={handleChange}
              ref={inputRef}
              onFocus={() => setIsVisible(true)}
              placeholder={`${t('search_placeholder')}. (Ctrl+K)`}
              style={{ backgroundColor: colors.$1, color: colors.$3 }}
            />
          </div>

          <Combobox.Options
            className={classNames(
              'absolute border rounded-lg max-h-72 overflow-y-auto shadow-xl',
              'min-w-full w-max',
              {
                hidden: !isVisible,
              }
            )}
            style={{
              backgroundColor: colors.$1,
              borderColor: colors.$5,
              minWidth: '33vw',
              maxWidth: 'max(100%, 33vw)',
            }}
            static={true}
          >
            {options?.map((entry) => (
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

            {options.count() === 0 && (
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
      </Combobox> */}
    </>
  );
}

export const Search = memo(Search$);
