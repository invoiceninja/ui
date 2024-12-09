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
import { Fragment, useEffect, useState, useRef, memo } from 'react';
import { styled } from 'styled-components';
import collect from 'collect.js';
import {
  isNavigationModalVisibleAtom,
  usePreventNavigation,
} from '$app/common/hooks/usePreventNavigation';
import { debounce } from 'lodash';
import { InputField } from '$app/components/forms';
import { Modal } from '$app/components/Modal';
import { Icon } from '$app/components/icons/Icon';
import { LuArrowUpDown, LuCornerDownLeft } from 'react-icons/lu';
import { useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '$app/components/Spinner';

const Div = styled.div`
  color: ${(props) => props.theme.color};
  background-color: ${(props) => props.theme.backgroundColor};
`;

export function Search$() {
  const [t] = useTranslation();

  const navigate = useNavigate();
  const preventNavigation = usePreventNavigation();

  const colors = useColorScheme();

  const inputRef = useRef<HTMLInputElement>(null);
  const optionsContainerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const isNavigationModalVisible = useAtomValue(isNavigationModalVisibleAtom);

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

  const options = filtered.count() === 0 ? collect(data) : filtered;
  const handleChange = debounce((value: string) => setQuery(value), 500);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'k') {
      event.preventDefault();
      setIsModalOpen(true);

      return;
    }

    const optionsLength = options?.count() || 0;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex((prev) => {
          if (prev >= optionsLength - 1) return 0;

          return prev + 1;
        });
        break;

      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex((prev) => {
          if (prev <= 0) return optionsLength - 1;
          return prev - 1;
        });
        break;

      case 'Enter':
        event.preventDefault();

        if (selectedIndex >= 0 && options) {
          const selectedOption = options.get(selectedIndex);
          preventNavigation({
            fn: () => {
              if (selectedOption?.resource) {
                navigate(selectedOption.resource.path);
                setIsModalOpen(false);
              }
            },
          });
        }
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    if (selectedIndex !== -1 && optionsContainerRef.current) {
      const container = optionsContainerRef.current;
      const selectedElement = container.children[selectedIndex] as HTMLElement;

      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }

    if (selectedIndex !== -1) {
      inputRef.current?.blur();
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex]);

  useEffect(() => {
    if (isModalOpen === false) {
      setQuery('');
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (query && filtered.count() === 0) {
      refetch();
    }

    setSelectedIndex(-1);
  }, [query]);

  return (
    <>
      <InputField
        className="border-transparent focus:border-transparent focus:ring-0 border-0"
        onClick={() => setIsModalOpen(true)}
        placeholder={`${t('search_placeholder')}. (Ctrl+K)`}
        style={{ backgroundColor: colors.$1, color: colors.$3, width: '21rem' }}
      />

      <Modal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        disableClosing
        enableCloseOnClickAway={!isNavigationModalVisible}
        withoutPadding
        size="regular"
      >
        <div
          className="flex flex-col pt-3"
          style={{ backgroundColor: colors.$1 }}
        >
          <div className="flex flex-col space-y-5 px-3 pb-3">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <InputField
                  className="focus:ring-0"
                  innerRef={inputRef}
                  value={query}
                  onValueChange={(value) => handleChange(value)}
                  onClick={() => setSelectedIndex(-1)}
                  placeholder={`${t('search')}...`}
                  changeOverride
                  style={{ backgroundColor: colors.$1, color: colors.$3 }}
                />
              </div>

              {isFetching && <Spinner />}
            </div>

            <div
              ref={optionsContainerRef}
              className="overflow-y-auto max-h-96"
              onMouseLeave={() => selectedIndex !== -1 && setSelectedIndex(-1)}
            >
              {options?.map((entry, index) => (
                <Div
                  key={entry.id}
                  theme={{
                    backgroundColor:
                      index === selectedIndex ? colors.$5 : 'transparent',
                    color: colors.$3,
                  }}
                  className="cursor-pointer pl-2 py-2.5 active:font-semibold search-option"
                  onClick={() => {
                    if (entry.resource) {
                      preventNavigation({
                        fn: () => {
                          if (entry.resource) {
                            navigate(entry.resource.path);
                            setIsModalOpen(false);
                          }
                        },
                      });
                    }
                  }}
                  onMouseMove={() =>
                    selectedIndex !== index &&
                    setTimeout(() => setSelectedIndex(index), 20)
                  }
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
            </div>
          </div>

          <div
            className="flex items-center py-2 space-x-4 px-3"
            style={{ backgroundColor: colors.$5 }}
          >
            <div className="flex items-center space-x-2 text-sm">
              <div>
                <Icon element={LuArrowUpDown} color={colors.$3} />
              </div>

              <span className="mb-0.5" style={{ color: colors.$3 }}>
                {t('navigate')}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-sm px-3">
              <div>
                <Icon element={LuCornerDownLeft} color={colors.$3} />
              </div>

              <span className="mb-0.5" style={{ color: colors.$3 }}>
                {t('select')}
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export const Search = memo(Search$);
