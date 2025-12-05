/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { PropertyEditorProps } from '../../types';

export function TextBlockProperties({ block, onChange }: PropertyEditorProps) {
  const [t] = useTranslation();

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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {String(t('content'))}
        </label>
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

      {/* Font Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {String(t('font_size'))}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['12px', '14px', '16px', '18px', '24px', '32px'].map((size) => (
            <button
              key={size}
              onClick={() => updateProperty('fontSize', size)}
              className={`
                px-3 py-2 border rounded-md text-sm transition-all
                ${
                  block.properties.fontSize === size
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }
              `}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Font Weight & Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {String(t('text_style'))}
        </label>
        <div className="flex gap-2">
          <button
            onClick={() =>
              updateProperty(
                'fontWeight',
                block.properties.fontWeight === 'bold' ? 'normal' : 'bold'
              )
            }
            className={`
              flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-md transition-all
              ${
                block.properties.fontWeight === 'bold'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }
            `}
          >
            <Bold className="w-4 h-4" />
            {String(t('bold'))}
          </button>

          <button
            onClick={() =>
              updateProperty(
                'fontStyle',
                block.properties.fontStyle === 'italic' ? 'normal' : 'italic'
              )
            }
            className={`
              flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-md transition-all
              ${
                block.properties.fontStyle === 'italic'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }
            `}
          >
            <Italic className="w-4 h-4" />
            {String(t('italic'))}
          </button>
        </div>
      </div>

      {/* Alignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {String(t('alignment'))}
        </label>
        <div className="flex gap-2">
          {[
            { value: 'left', icon: AlignLeft, label: t('left') },
            { value: 'center', icon: AlignCenter, label: t('center') },
            { value: 'right', icon: AlignRight, label: t('right') },
          ].map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => updateProperty('align', value)}
              className={`
                flex-1 flex items-center justify-center px-3 py-2 border rounded-md transition-all
                ${
                  block.properties.align === value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }
              `}
              title={label}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {String(t('text_color'))}
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            value={block.properties.color || '#000000'}
            onChange={(e) => updateProperty('color', e.target.value)}
            className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
          />
          <input
            type="text"
            value={block.properties.color || '#000000'}
            onChange={(e) => updateProperty('color', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* Line Height */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {String(t('line_height'))}
        </label>
        <input
          type="text"
          value={block.properties.lineHeight || '1.5'}
          onChange={(e) => updateProperty('lineHeight', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="1.5"
        />
      </div>
    </div>
  );
}
