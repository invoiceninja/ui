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
import { payloadAtom } from '../Edit';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDesignUtilities } from '../common/hooks';
import { useDebounce } from 'react-use';
import { Card } from '$app/components/cards';
import Editor from '@monaco-editor/react';
import { useColorScheme } from '$app/common/colors';

export function Body() {
  const [payload] = useAtom(payloadAtom);
  const [value, setValue] = useState(payload.design?.design.body);

  const { t } = useTranslation();
  const { handleBlockChange } = useDesignUtilities();
  const colors = useColorScheme();

  useDebounce(() => value && handleBlockChange('body', value), 1000, [value]);

  return (
    <Card title={t('body')} padding="small" collapsed={true}>
      <Editor
        theme={colors.name === 'invoiceninja.dark' ? 'vs-dark' : 'light'}
        height="25rem"
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
