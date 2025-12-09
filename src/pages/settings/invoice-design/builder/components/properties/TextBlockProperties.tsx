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
import { Code } from 'lucide-react';
import { PropertyEditorProps } from '../../types';
import { VariablePicker } from '../VariablePicker';
import {
  FontSizeInput,
  FontStyleInput,
  AlignmentInput,
  ColorInput,
  LineHeightInput,
  TextInput,
  SectionDivider,
} from './PropertyInputs';

export function TextBlockProperties({ block, onChange }: PropertyEditorProps) {
  const [t] = useTranslation();
  const [showVariablePicker, setShowVariablePicker] = useState(false);

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
          <label className="block text-sm font-medium text-gray-700">
            {String(t('content'))}
          </label>
          <button
            onClick={() => setShowVariablePicker(true)}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Code className="w-3 h-3" />
            {String(t('insert_variable'))}
          </button>
        </div>
        <textarea
          value={block.properties.content || ''}
          onChange={(e) => updateProperty('content', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
          rows={4}
          placeholder={String(t('enter_your_text'))}
        />
        <p className="text-xs text-gray-500 mt-1">
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

      <SectionDivider label={t('typography')} />

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

      <SectionDivider label={t('spacing')} />

      {/* Padding */}
      <TextInput
        label={t('padding')}
        value={block.properties.padding}
        onChange={(value) => updateProperty('padding', value)}
        placeholder="0px"
        hint={t('css_padding_format')}
      />
    </div>
  );
}
