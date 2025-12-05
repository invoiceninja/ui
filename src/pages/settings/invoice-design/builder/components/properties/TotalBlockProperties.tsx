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

export function TotalBlockProperties({ block, onChange }: PropertyEditorProps) {
  const [t] = useTranslation();

  const updateProperty = (key: string, value: any) => {
    onChange({
      ...block,
      properties: { ...block.properties, [key]: value },
    });
  };

  const updateItemVisibility = (index: number, show: boolean) => {
    const updatedItems = [...block.properties.items];
    updatedItems[index] = { ...updatedItems[index], show };
    updateProperty('items', updatedItems);
  };

  return (
    <div className="space-y-4">
      {/* Items to show */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t('items_to_display')}
        </label>
        <div className="space-y-2">
          {block.properties.items?.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`item-${index}`}
                checked={item.show}
                onChange={(e) => updateItemVisibility(index, e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor={`item-${index}`} className="text-sm text-gray-700">
                {item.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('font_size')}
        </label>
        <input
          type="text"
          value={block.properties.fontSize || '13px'}
          onChange={(e) => updateProperty('fontSize', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="13px"
        />
      </div>

      {/* Label Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('label_color')}
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            value={block.properties.labelColor || '#6B7280'}
            onChange={(e) => updateProperty('labelColor', e.target.value)}
            className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
          />
          <input
            type="text"
            value={block.properties.labelColor || '#6B7280'}
            onChange={(e) => updateProperty('labelColor', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
          />
        </div>
      </div>

      {/* Amount Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('amount_color')}
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            value={block.properties.amountColor || '#111827'}
            onChange={(e) => updateProperty('amountColor', e.target.value)}
            className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
          />
          <input
            type="text"
            value={block.properties.amountColor || '#111827'}
            onChange={(e) => updateProperty('amountColor', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
          />
        </div>
      </div>

      {/* Total Font Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('total_font_size')}
        </label>
        <input
          type="text"
          value={block.properties.totalFontSize || '18px'}
          onChange={(e) => updateProperty('totalFontSize', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="18px"
        />
      </div>

      {/* Total Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('total_color')}
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            value={block.properties.totalColor || '#111827'}
            onChange={(e) => updateProperty('totalColor', e.target.value)}
            className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
          />
          <input
            type="text"
            value={block.properties.totalColor || '#111827'}
            onChange={(e) => updateProperty('totalColor', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
          />
        </div>
      </div>

      {/* Balance Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('balance_color')}
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            value={block.properties.balanceColor || '#DC2626'}
            onChange={(e) => updateProperty('balanceColor', e.target.value)}
            className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
          />
          <input
            type="text"
            value={block.properties.balanceColor || '#DC2626'}
            onChange={(e) => updateProperty('balanceColor', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
          />
        </div>
      </div>

      {/* Spacing */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('spacing')}
        </label>
        <input
          type="text"
          value={block.properties.spacing || '8px'}
          onChange={(e) => updateProperty('spacing', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="8px"
        />
      </div>
    </div>
  );
}
