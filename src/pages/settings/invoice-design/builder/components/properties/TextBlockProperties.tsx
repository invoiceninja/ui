/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Code } from 'lucide-react';
import { PropertyEditorProps } from '../../types';
import { VariablePicker } from '../VariablePicker';
import { useDebouncedCallback } from '../../hooks/useDebounce';
import {
  FontSizeInput,
  FontStyleInput,
  AlignmentInput,
  ColorInput,
  LineHeightInput,
  TextInput,
  SectionDivider,
} from './PropertyInputs';
import { useColorScheme } from '$app/common/colors';

export function TextBlockProperties({ block, onChange }: PropertyEditorProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const [showVariablePicker, setShowVariablePicker] = useState(false);
  // Local state for immediate textarea updates
  const [contentValue, setContentValue] = useState(
    block.properties.content || ''
  );

  // Debounced callback to update the actual property (prevents excessive re-renders)
  const debouncedUpdateContent = useDebouncedCallback((value: string) => {
    onChange({
      ...block,
      properties: { ...block.properties, content: value },
    });
  }, 300);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setContentValue(newValue); // Update local state immediately for responsive typing
    debouncedUpdateContent(newValue); // Debounced update to parent
  };

  // Sync local state when block changes externally
  useEffect(() => {
    setContentValue(block.properties.content || '');
  }, [block.properties.content]);

  const updateProperty = (key: string, value: any) => {
    onChange({
      ...block,
      properties: { ...block.properties, [key]: value },
    });
  };

  return (
    <div className="space-y-4">
      {/* Content */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            className="block text-sm font-medium"
            style={{ color: colors.$3 }}
          >
            {String(t('content'))}
          </label>
          <button
            onClick={() => setShowVariablePicker(true)}
            className="text-xs flex items-center gap-1 transition-colors"
            style={{ color: colors.$3 }}
          >
            <Code className="w-3 h-3" />
            {String(t('insert_variable'))}
          </button>
        </div>
        <textarea
          value={contentValue}
          onChange={handleContentChange}
          className="w-full px-3 py-2 rounded-md text-sm font-mono"
          style={{
            backgroundColor: colors.$1,
            border: `1px solid ${colors.$24}`,
            color: colors.$3,
          }}
          rows={4}
          placeholder={String(t('enter_your_text'))}
        />
        <p className="text-xs mt-1" style={{ color: colors.$17 }}>
          {String(t('use_variables_like'))} $company.name, $invoice.number
        </p>
      </div>

      {showVariablePicker && (
        <VariablePicker
          onInsert={(variable) => {
            const currentContent = block.properties.content || '';
            updateProperty('content', currentContent + variable);
          }}
          onClose={() => setShowVariablePicker(false)}
        />
      )}

      <SectionDivider label={String(t('typography'))} />

      {/* Font Size */}
      <FontSizeInput
        label={String(t('font_size'))}
        value={block.properties.fontSize}
        onChange={(value) => updateProperty('fontSize', value)}
        sizes={['12px', '14px', '16px', '18px', '24px', '32px']}
      />

      {/* Font Weight & Style */}
      <FontStyleInput
        label={String(t('text_style'))}
        fontWeight={block.properties.fontWeight || 'normal'}
        fontStyle={block.properties.fontStyle || 'normal'}
        onFontWeightChange={(value) => updateProperty('fontWeight', value)}
        onFontStyleChange={(value) => updateProperty('fontStyle', value)}
      />

      {/* Alignment */}
      <AlignmentInput
        label={String(t('alignment'))}
        value={block.properties.align}
        onChange={(value) => updateProperty('align', value)}
      />

      {/* Color */}
      <ColorInput
        label={String(t('text_color'))}
        value={block.properties.color}
        onChange={(value) => updateProperty('color', value)}
        defaultValue="#000000"
      />

      {/* Line Height */}
      <LineHeightInput
        label={String(t('line_height'))}
        value={block.properties.lineHeight}
        onChange={(value) => updateProperty('lineHeight', value)}
      />

      <SectionDivider label={String(t('spacing'))} />

      {/* Padding */}
      <TextInput
        label={String(t('padding'))}
        value={block.properties.padding}
        onChange={(value) => updateProperty('padding', value)}
        placeholder="0px"
        hint={String(t('css_padding_format'))}
      />
    </div>
  );
}
