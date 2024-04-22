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
import { Editor } from '@tinymce/tinymce-react';
import { useColorScheme } from '$app/common/colors';

interface Props {
  value?: string | undefined;
  onChange: (value: string) => unknown;
  label?: string;
  disabled?: boolean;
}

export function MarkdownEditor(props: Props) {
  const [value, setValue] = useState<string | undefined>();
  const editorRef = useRef<Editor | null>(null);

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

  const colors = useColorScheme();

  return (
    <div className="space-y-4" style={{ zIndex: 0 }}>
      {props.label && <InputLabel>{props.label}</InputLabel>}

      <Editor
        tinymceScriptSrc="/tinymce_6.4.2/tinymce/js/tinymce/tinymce.min.js"
        ref={editorRef}
        value={value}
        init={{
          height: 300,
          entity_encoding: 'raw',
          menubar: false,
          plugins: [
            'advlist',
            'autolink',
            'lists',
            'link',
            'image',
            'charmap',
            'anchor',
            'searchreplace',
            'visualblocks',
            'code',
            'fullscreen',
            'insertdatetime',
            'media',
            'table',
            'preview',
            'help',
            'wordcount',
            'mceCodeEditor',
          ],
          toolbar:
            'undo redo | blocks | link ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | code | help',
          content_style:
            'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          contextmenu: '',
          content_css:
            colors.$0 === 'dark'
              ? 'dark'
              : '/tinymce_6.4.2/tinymce/content.css',
          body_class: 'h-screen',
          skin: colors.$0 === 'dark' ? 'oxide-dark' : 'oxide',
          paste_data_images: false,
          newline_behavior: 'invert',
          license_key: 'gpl',
          browser_spellcheck: true,
        }}
        onEditorChange={handleChange}
        disabled={props.disabled}
      />
    </div>
  );
}
