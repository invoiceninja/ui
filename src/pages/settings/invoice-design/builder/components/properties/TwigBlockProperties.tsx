/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Code } from 'lucide-react';
import { PropertyEditorProps, TwigBlock } from '../../types';
import { VariablePicker } from '../VariablePicker';
import { useDebouncedCallback } from '../../hooks/useDebounce';
import { unwrapNinjaTags } from '../../utils/twig-block';
import { useColorScheme } from '$app/common/colors';

export function TwigBlockProperties({
  block,
  onChange,
}: PropertyEditorProps<TwigBlock>) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const [showVariablePicker, setShowVariablePicker] = useState(false);
  const [contentValue, setContentValue] = useState(
    unwrapNinjaTags(block.properties.content)
  );

  const debouncedUpdateContent = useDebouncedCallback((value: string) => {
    onChange({
      ...block,
      properties: { ...block.properties, content: unwrapNinjaTags(value) },
    });
  }, 300);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setContentValue(newValue);
    debouncedUpdateContent(newValue);
  };

  useEffect(() => {
    setContentValue(unwrapNinjaTags(block.properties.content));
  }, [block.properties.content]);

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label
            className="block text-sm font-medium"
            style={{ color: colors.$3 }}
          >
            {t('twig_template')}
          </label>
          <button
            type="button"
            onClick={() => setShowVariablePicker(true)}
            className="flex items-center gap-1 text-xs transition-colors"
            style={{ color: colors.$3 }}
          >
            <Code className="h-3 w-3" />
            {t('variables')}
          </button>
        </div>

        <p className="mb-2 text-xs leading-5" style={{ color: colors.$17 }}>
          {t('twig_template_help')}
        </p>

        <div
          className="overflow-hidden rounded-md font-mono text-xs"
          style={{
            backgroundColor: colors.$1,
            border: `1px solid ${colors.$24}`,
            color: colors.$3,
          }}
        >
          <div
            className="px-3 py-1.5"
            style={{ backgroundColor: colors.$20, color: colors.$16 }}
          >
            {'<ninja>'}
          </div>
          <textarea
            value={contentValue}
            onChange={handleContentChange}
            className="w-full resize-y bg-transparent px-3 py-2 text-sm font-mono outline-none"
            style={{ color: colors.$3 }}
            rows={10}
            spellCheck={false}
            placeholder={t('twig_template_placeholder')}
          />
          <div
            className="px-3 py-1.5"
            style={{ backgroundColor: colors.$20, color: colors.$16 }}
          >
            {'</ninja>'}
          </div>
        </div>
      </div>

      {showVariablePicker && (
        <VariablePicker
          onInsert={(variable) => {
            const next = `${contentValue}${variable}`;
            setContentValue(next);
            onChange({
              ...block,
              properties: { ...block.properties, content: unwrapNinjaTags(next) },
            });
          }}
          onClose={() => setShowVariablePicker(false)}
        />
      )}
    </div>
  );
}
