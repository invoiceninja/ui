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

export default function Header() {
  const context: Context = useOutletContext();

  const { payload, setPayload } = context;

  const [value, setValue] = useState(payload.design?.design.header);

  const { t } = useTranslation();
  const { handleBlockChange } = useDesignUtilities({ payload, setPayload });

  useDebounce(() => value && handleBlockChange('header', value), 1000, [value]);
  const colors = useColorScheme();

  return (
    <Card title={t('header')} padding="small" height="full">
      <Editor
        theme={colors.name === 'invoiceninja.dark' ? 'vs-dark' : 'light'}
        defaultLanguage="html"
        value={payload.design?.design.header}
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
