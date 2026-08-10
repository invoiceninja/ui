/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import Editor from '@monaco-editor/react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import {
  INVOICE_WIDGET_CLASS,
  INVOICE_WIDGET_CLASS_BY_TYPE,
} from '../constants/widget-classes';
import { sanitizeCustomCss } from '../utils/custom-css';

interface CustomCssPanelProps {
  value: string;
  onChange: (value: string) => void;
}

export function CustomCssPanel({ value, onChange }: CustomCssPanelProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const containsUnsafeCss = Boolean(value.trim()) && !sanitizeCustomCss(value);

  return (
    <div className="flex h-full min-h-[600px] flex-col">
      <div
        className="space-y-2 border-b p-4"
        style={{ borderColor: colors.$24 }}
      >
        <h2 className="font-semibold" style={{ color: colors.$3 }}>
          {t('custom_css') || 'Custom CSS'}
        </h2>
        <p className="text-xs leading-5" style={{ color: colors.$17 }}>
          Target a widget type with a stable selector such as{' '}
          <code>{`.${INVOICE_WIDGET_CLASS_BY_TYPE.table}`}</code>. Properties
          already set by the designer may require <code>!important</code>.
        </p>
        {containsUnsafeCss && (
          <p className="text-xs leading-5 text-red-600" role="alert">
            {t('custom_css_security_warning', {
              defaultValue:
                'This CSS contains an external resource or unsafe construct and will not be applied or saved.',
            })}
          </p>
        )}
        <details className="text-xs" style={{ color: colors.$17 }}>
          <summary className="cursor-pointer select-none font-medium">
            Available widget selectors
          </summary>
          <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
            <div
              className="rounded-md border p-2"
              style={{ borderColor: colors.$24 }}
            >
              <div className="mb-1 font-medium" style={{ color: colors.$3 }}>
                All widgets
              </div>
              <code
                className="block select-all whitespace-normal break-all rounded px-2 py-1 font-mono leading-5"
                style={{ backgroundColor: colors.$20, color: colors.$16 }}
              >
                .{INVOICE_WIDGET_CLASS}
              </code>
            </div>
            {Object.entries(INVOICE_WIDGET_CLASS_BY_TYPE).map(
              ([type, className]) => (
                <div
                  key={type}
                  className="rounded-md border p-2"
                  style={{ borderColor: colors.$24 }}
                >
                  <div
                    className="mb-1 font-medium capitalize"
                    style={{ color: colors.$3 }}
                  >
                    {type.replace(/-/g, ' ')}
                  </div>
                  <code
                    className="block select-all whitespace-normal break-all rounded px-2 py-1 font-mono leading-5"
                    style={{ backgroundColor: colors.$20, color: colors.$16 }}
                  >
                    .{className}
                  </code>
                </div>
              )
            )}
          </div>
        </details>
      </div>

      <div className="min-h-0 flex-1">
        <Editor
          defaultLanguage="css"
          language="css"
          value={value}
          theme={colors.name === 'invoiceninja.dark' ? 'vs-dark' : 'light'}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbersMinChars: 3,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
          }}
          onChange={(css) => onChange(css ?? '')}
        />
      </div>
    </div>
  );
}
