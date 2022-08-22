/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import MDEditor from '@uiw/react-md-editor';
import { debounce } from 'lodash';
import { useEffect, useRef, useState } from 'react';

interface Props {
  value?: string | undefined;
  onChange: (value: string) => unknown;
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
    <div>
      <MDEditor value={value} onChange={handleChange} preview="edit" />
    </div>
  );
}
