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
import { defaultEditorDebounceTime } from '$app/pages/settings/invoice-design/customize/components/Body';
import { CustomizeChildProps } from '$app/pages/settings/invoice-design/customize/components/Settings';
import Editor from '@monaco-editor/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'react-use';

export function Header({ payload }: CustomizeChildProps) {
  const [value, setValue] = useState(payload.design?.header);

  const { t } = useTranslation();
  const { handleDesignBlockChange } = useDesignUtilities();

  useDebounce(() => value && handleDesignBlockChange('header', value), defaultEditorDebounceTime, [
    value,
  ]);

  return (
    <Card
      title={t('header')}
      padding="small"
      collapsed={true}
    >
      <Editor
        height="40rem"
        defaultLanguage="html"
        value={payload.design?.header}
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
