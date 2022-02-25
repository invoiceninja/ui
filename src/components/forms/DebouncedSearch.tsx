/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios from 'axios';
import { endpoint } from 'common/helpers';
import { defaultHeaders } from 'common/queries/common/headers';
import { debounce } from 'lodash';
import AsyncSelect from 'react-select/async';

interface Props {
  endpoint: string;
  value?: string;
  label: string;
  onChange?: (value: { value: unknown; label: unknown }) => any;
  className?: string;
}

export function DebouncedSearch(props: Props) {
  const debouncedSearch = debounce((query, resolve) => {
    axios
      .get(endpoint(`${props.endpoint}?filter=${query}`), {
        headers: defaultHeaders,
      })
      .then((response) => {
        const array: Record<string, unknown>[] = [{ value: '', label: '' }];

        response?.data?.data?.map((resource: any) =>
          array.push({
            value: resource[props.value ?? 'id'],
            label: resource[props.label],
          })
        );

        resolve(array);
      });
  }, 500);

  const loadOptions = (query: string) => {
    return new Promise((resolve) => debouncedSearch(query, resolve));
  };

  return (
    <AsyncSelect
      className={props.className}
      cacheOptions
      defaultOptions
      loadOptions={loadOptions}
      menuPortalTarget={document.body}
      onChange={(value) =>
        props.onChange &&
        props.onChange(value as { value: unknown; label: unknown })
      }
    />
  );
}
