/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

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
import { payloadAtom } from '../../Edit';
import { useState } from 'react';
import { useDesignUtilities } from '../../common/hooks';
import { useDebounce } from 'react-use';
import { Card } from '$app/components/cards';
import Editor from '@monaco-editor/react';

export function Includes() {
  const [payload] = useAtom(payloadAtom);
  const [value, setValue] = useState(payload.design?.design.includes);

  const { handleBlockChange } = useDesignUtilities();

  useDebounce(() => value && handleBlockChange('includes', value), 1000, [
    value,
  ]);

  return (
    <Card>
      <Editor
        height="38rem"
        defaultLanguage="html"
        value={payload.design?.design.includes}
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
