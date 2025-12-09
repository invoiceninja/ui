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
import { ChevronUp, ChevronDown } from 'lucide-react';
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

  const moveItemUp = (index: number) => {
    if (index === 0) return;
    const updatedItems = [...block.properties.items];
    [updatedItems[index - 1], updatedItems[index]] = [updatedItems[index], updatedItems[index - 1]];
    updateProperty('items', updatedItems);
  };

  const moveItemDown = (index: number) => {
    const items = block.properties.items;
    if (index >= items.length - 1) return;
    const updatedItems = [...items];
    [updatedItems[index], updatedItems[index + 1]] = [updatedItems[index + 1], updatedItems[index]];
    updateProperty('items', updatedItems);
  };

  return (
    <div className="space-y-4">
      {/* Items to show */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t('items_to_display')}
        </label>
        <div className="space-y-1">
          {block.properties.items?.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-1 p-2 border border-gray-200 rounded-md bg-white">
              {/* Reorder buttons */}
              <div className="flex flex-col">
                <button
                  onClick={() => moveItemUp(index)}
                  disabled={index === 0}
                  className={`p-0.5 rounded ${index === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                  title={t('move_up')}
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveItemDown(index)}
                  disabled={index >= block.properties.items.length - 1}
                  className={`p-0.5 rounded ${index >= block.properties.items.length - 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                  title={t('move_down')}
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              
              <input
                type="checkbox"
                id={`item-${index}`}
                checked={item.show}
                onChange={(e) => updateItemVisibility(index, e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor={`item-${index}`} className="flex-1 text-sm text-gray-700">
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

      {/* Row Spacing */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('row_spacing')}
        </label>
        <input
          type="text"
          value={block.properties.spacing || '8px'}
          onChange={(e) => updateProperty('spacing', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="8px"
        />
      </div>

      {/* Label Padding */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('label_padding')}
        </label>
        <input
          type="text"
          value={block.properties.labelPadding || '0px'}
          onChange={(e) => updateProperty('labelPadding', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="0px"
        />
        <p className="text-xs text-gray-500 mt-1">
          {t('padding_hint')} (e.g., 5px, 10px 5px, 5px 10px 5px 10px)
        </p>
      </div>

      {/* Value Padding */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('value_padding')}
        </label>
        <input
          type="text"
          value={block.properties.valuePadding || '0px'}
          onChange={(e) => updateProperty('valuePadding', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="0px"
        />
        <p className="text-xs text-gray-500 mt-1">
          {t('padding_hint')} (e.g., 5px, 10px 5px, 5px 10px 5px 10px)
        </p>
      </div>

      {/* Gap Between Label and Value */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('label_value_gap')}
        </label>
        <input
          type="text"
          value={block.properties.labelValueGap || '20px'}
          onChange={(e) => updateProperty('labelValueGap', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="20px"
        />
      </div>

      {/* Value Column Min Width */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('value_min_width')}
        </label>
        <input
          type="text"
          value={block.properties.valueMinWidth || ''}
          onChange={(e) => updateProperty('valueMinWidth', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder={t('auto')}
        />
        <p className="text-xs text-gray-500 mt-1">
          {t('leave_empty_for_auto')}
        </p>
      </div>
    </div>
  );
}
