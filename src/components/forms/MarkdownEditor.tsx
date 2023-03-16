/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InputLabel } from '$app/components/forms/InputLabel';
import MDEditor from '@uiw/react-md-editor';
import { debounce } from 'lodash';
import { useEffect, useRef, useState } from 'react';

interface Props {
  value?: string | undefined;
  onChange: (value: string) => unknown;
  label?: string;
}

export function MarkdownEditor(props: Props) {
  const [value, setValue] = useState<string | undefined>();

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  const handleChangeEvent = (value: string) => {
    props.onChange(value);
  };

  const delayedQuery = useRef(
    debounce((q) => handleChangeEvent(q), 500)
  ).current;

  const handleChange = (input: string | undefined) => {
    setValue(input || '');
    delayedQuery(input || '');
  };

  return (
    <div className="space-y-4">
      {props.label && <InputLabel>{props.label}</InputLabel>}

      <MDEditor
        value={value}
        onChange={handleChange}
        preview="edit"
        data-color-mode="light"
      />
    </div>
  );
}
