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
import { PropertyEditorProps } from '../../types';

export function TableBlockProperties({ block, onChange }: PropertyEditorProps) {
  const [t] = useTranslation();

  const updateProperty = (key: string, value: any) => {
    onChange({
      ...block,
      properties: { ...block.properties, [key]: value },
    });
  };

  return (
    <div className="space-y-4">
      {/* Font Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('font_size')}
        </label>
        <input
          type="text"
          value={block.properties.fontSize || '12px'}
          onChange={(e) => updateProperty('fontSize', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="12px"
        />
      </div>

      {/* Header Background */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('header_background')}
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            value={block.properties.headerBg || '#F3F4F6'}
            onChange={(e) => updateProperty('headerBg', e.target.value)}
            className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
          />
          <input
            type="text"
            value={block.properties.headerBg || '#F3F4F6'}
            onChange={(e) => updateProperty('headerBg', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
          />
        </div>
      </div>

      {/* Header Text Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('header_text_color')}
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            value={block.properties.headerColor || '#111827'}
            onChange={(e) => updateProperty('headerColor', e.target.value)}
            className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
          />
          <input
            type="text"
            value={block.properties.headerColor || '#111827'}
            onChange={(e) => updateProperty('headerColor', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
          />
        </div>
      </div>

      {/* Alternate Rows */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="alternateRows"
          checked={block.properties.alternateRows || false}
          onChange={(e) => updateProperty('alternateRows', e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
        />
        <label htmlFor="alternateRows" className="text-sm font-medium text-gray-700">
          {t('alternate_row_colors')}
        </label>
      </div>

      {block.properties.alternateRows && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('alternate_row_background')}
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={block.properties.alternateRowBg || '#F9FAFB'}
              onChange={(e) => updateProperty('alternateRowBg', e.target.value)}
              className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
            />
            <input
              type="text"
              value={block.properties.alternateRowBg || '#F9FAFB'}
              onChange={(e) => updateProperty('alternateRowBg', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
            />
          </div>
        </div>
      )}

      {/* Show Borders */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showBorders"
          checked={block.properties.showBorders || false}
          onChange={(e) => updateProperty('showBorders', e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
        />
        <label htmlFor="showBorders" className="text-sm font-medium text-gray-700">
          {t('show_borders')}
        </label>
      </div>

      {block.properties.showBorders && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('border_color')}
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={block.properties.borderColor || '#E5E7EB'}
              onChange={(e) => updateProperty('borderColor', e.target.value)}
              className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
            />
            <input
              type="text"
              value={block.properties.borderColor || '#E5E7EB'}
              onChange={(e) => updateProperty('borderColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
            />
          </div>
        </div>
      )}

      {/* Cell Padding */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('cell_padding')}
        </label>
        <input
          type="text"
          value={block.properties.padding || '8px'}
          onChange={(e) => updateProperty('padding', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="8px"
        />
      </div>
    </div>
  );
}
