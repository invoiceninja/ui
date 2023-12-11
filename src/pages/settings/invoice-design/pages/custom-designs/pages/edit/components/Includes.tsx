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
import { payloadAtom } from '../Edit';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDesignUtilities } from '../common/hooks';
import { useDebounce } from 'react-use';
import { Card } from '$app/components/cards';
import Editor from '@monaco-editor/react';
import { useColorScheme } from '$app/common/colors';

export function Includes() {
  const [payload] = useAtom(payloadAtom);
  const [value, setValue] = useState(payload.design?.design.includes);

  const { t } = useTranslation();
  const { handleBlockChange } = useDesignUtilities();
  const colors = useColorScheme();

  useDebounce(() => value && handleBlockChange('includes', value), 1000, [
    value,
  ]);

  return (
    <Card title={t('includes')} padding="small" collapsed={true}>
      <Editor
        height="25rem"
        defaultLanguage="html"
        value={payload.design?.design.includes}
        theme={colors.name === 'invoiceninja.dark' ? 'vs-dark' : 'light'}
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
