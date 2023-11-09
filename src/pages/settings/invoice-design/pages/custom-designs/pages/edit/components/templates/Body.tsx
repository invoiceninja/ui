/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAtom } from 'jotai';
import { useState } from 'react';
import { useDebounce } from 'react-use';
import { Card } from '$app/components/cards';
import Editor from '@monaco-editor/react';
import { useDesignUtilities } from '../../common/hooks';
import { payloadAtom } from '../../Edit';


export function Body() {
  const [payload] = useAtom(payloadAtom);
  const [value, setValue] = useState(payload.design?.design.body);

  const { handleBlockChange } = useDesignUtilities();

  useDebounce(() => value && handleBlockChange('body', value), 1000, [value]);

  return (
    <Card onFormSubmit={(e) => e.preventDefault()}>
      <Editor
        height="38rem"
        defaultLanguage="html"
        value={payload.design?.design.body}
        options={{
          minimap: {
            enabled: false,
          },
        }}
        onChange={(markup) => markup && setValue(markup)}
      />
    </Card>
  );
}
