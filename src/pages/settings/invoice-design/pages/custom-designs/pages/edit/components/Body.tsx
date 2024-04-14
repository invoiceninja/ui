/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDesignUtilities } from '../common/hooks';
import { useDebounce } from 'react-use';
import { Card } from '$app/components/cards';
import Editor from '@monaco-editor/react';
import { useColorScheme } from '$app/common/colors';
import { useOutletContext } from 'react-router-dom';
import { Context } from './Settings';

export default function Body() {
  const context: Context = useOutletContext();

  const { payload, setPayload } = context;

  const [value, setValue] = useState(payload.design?.design.body);

  const { t } = useTranslation();
  const { handleBlockChange } = useDesignUtilities({ payload, setPayload });
  const colors = useColorScheme();

  useDebounce(() => value && handleBlockChange('body', value), 1000, [value]);

  return (
    <Card title={t('body')} padding="small" height="full">
      <Editor
        theme={colors.name === 'invoiceninja.dark' ? 'vs-dark' : 'light'}
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
