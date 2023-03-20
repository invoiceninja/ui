/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '$app/components/cards';
import { useDesignUtilities } from '$app/pages/settings/invoice-design/customize/common/hooks';
import { CustomizeChildProps } from '$app/pages/settings/invoice-design/customize/components/Settings';
import Editor from '@monaco-editor/react';
import { useState } from 'react';
import { useDebounce } from 'react-use';

export function Body({ payload }: CustomizeChildProps) {
  const [value, setValue] = useState(payload.design?.design.body);

  const { handleDesignBlockChange } = useDesignUtilities();

  useDebounce(() => value && handleDesignBlockChange('body', value), 500, [
    value,
  ]);

  return (
    <Card>
      <Editor
        height="40rem"
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
