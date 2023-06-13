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
import { debounce } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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

  const modules = {
    toolbar: [
      [{ font: [] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ script: "sub" }, { script: "super" }],
      ["blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }, { align: [] }],
      ["link", "image", "video"],
      ["clean"],
    ],
  };

  return (
    <div className="space-y-4">
      
      {props.label && <InputLabel>{props.label}</InputLabel>}

      <ReactQuill
        theme="snow"
        value={value} 
        onChange={handleChange}
        modules={modules}
      />
    </div>

  );
}
