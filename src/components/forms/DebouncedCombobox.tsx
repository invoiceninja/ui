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
import { ChangeEvent, useState } from 'react';
import { InputField } from '.';

interface Props {
  endpoint: string;
  label: string;
  value?: string;
  onChange?: (
    value: unknown,
    label: unknown,
    selected: boolean,
    resource?: unknown
  ) => any;
}

export function DebouncedCombobox(props: Props) {
  const [records, setRecords] = useState<Record<string, unknown>[]>([]);

  const debouncedSearch = debounce((value: unknown) => {
    axios
      .get(endpoint(`${props.endpoint}?filter=${value}`), {
        headers: defaultHeaders,
      })
      .then((response) => {
        const array: Record<string, unknown>[] = [{ value: '', label: '' }];

        response?.data?.data?.map((resource: any) =>
          array.push({
            value: resource[props.value ?? 'id'],
            label: resource[props.label],
            resource,
          })
        );

        setRecords(array);
      });

    const possible = records.find((record) => record.label === value);

    props.onChange &&
      props.onChange(
        possible?.value || value,
        possible?.label || value,
        Boolean(possible),
        possible?.resource
      );
  }, 300);

  return (
    <>
      <InputField
        type="list"
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          debouncedSearch(event.target.value)
        }
        list={props.endpoint}
      />

      <datalist id={props.endpoint}>
        {records.map((record, index) => (
          <option key={index} value={record.label as unknown as string}>
            {record.label as unknown as string}
          </option>
        ))}
      </datalist>
    </>
  );
}
