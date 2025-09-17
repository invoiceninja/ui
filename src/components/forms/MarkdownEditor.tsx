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
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { Editor as LexicalEditor } from '$app/components/lexical/Editor';

interface Props {
  value?: string | undefined;
  onChange: (value: string) => unknown;
  label?: string;
  disabled?: boolean;
  handleChangeOnlyOnUserInput?: boolean;
}

export function MarkdownEditor(props: Props) {
  const [value, setValue] = useState<string | undefined>();
  const editorRef = useRef<Editor | null>(null);

  const reactSettings = useReactSettings();

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

  useEffect(() => {
    const isDarkMode = colors.$0 === 'dark';

    if (editorRef.current?.editor) {
      try {
        const editor = editorRef.current.editor;

        const darkSkinUrl =
          editor.editorManager.baseURL + '/skins/ui/oxide-dark/skin.min.css';
        const lightSkinUrl =
          editor.editorManager.baseURL + '/skins/ui/oxide/skin.min.css';

        editor.ui.styleSheetLoader.unload(darkSkinUrl);
        editor.ui.styleSheetLoader.unload(lightSkinUrl);

        editor.ui.styleSheetLoader.load(
          isDarkMode ? darkSkinUrl : lightSkinUrl
        );

        const iframeDoc = editor.getDoc();

        if (iframeDoc) {
          const links = iframeDoc.querySelectorAll('link[rel="stylesheet"]');

          links.forEach((link) => {
            const currentHref = link.getAttribute('href');

            if (
              currentHref?.endsWith('/skins/content/dark/content.min.css') ||
              currentHref?.endsWith('/tinymce_6.4.2/tinymce/content.css')
            ) {
              link.parentNode?.removeChild(link);
            }
          });

          const newLink = iframeDoc.createElement('link');

          newLink.rel = 'stylesheet';

          newLink.href = isDarkMode
            ? editor.editorManager.baseURL +
              '/skins/content/dark/content.min.css'
            : '/tinymce_6.4.2/tinymce/content.css';

          iframeDoc.head.appendChild(newLink);
        }
      } catch (e) {
        console.error('Error updating content CSS:', e);
      }
    }
  }, [colors.$0]);

  if (reactSettings.preferences.use_legacy_editor) {
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
              // 'mceCodeEditor': https://github.com/invoiceninja/invoiceninja/issues/11060
              'emoticons',
            ],
            toolbar: [
              'blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor | emoticons link image media',
              'alignleft aligncenter alignright alignjustify | bullist numlist | outdent indent | table | searchreplace | removeformat | code | help',
            ],
            font_family_formats:
              'Arial=arial,helvetica,sans-serif;' +
              'Courier New=courier new,courier,monospace;' +
              'Georgia=georgia,palatino;' +
              'Helvetica=helvetica;' +
              'Times New Roman=times new roman,times;' +
              'Trebuchet MS=trebuchet ms,geneva;' +
              'Verdana=verdana,geneva',
            font_size_formats: '8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt 48pt',
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
            browser_spellcheck: true,
            convert_urls: false,
          }}
          onEditorChange={(currentValue) => {
            if (props.handleChangeOnlyOnUserInput) {
              if (currentValue !== props.value) {
                handleChange(currentValue);
              }
            } else {
              handleChange(currentValue);
            }
          }}
          disabled={props.disabled}
        />
      </div>
    );
  }

  return <LexicalEditor value={value || ''} />;
}
