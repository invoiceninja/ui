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
import {
  ColorInput,
  TextInput,
  AlignmentInput,
  SectionDivider,
} from './PropertyInputs';

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

      <SectionDivider label={t('alignment')} />

      {/* Alignment */}
      <AlignmentInput
        label={t('alignment')}
        value={block.properties.align}
        onChange={(value) => updateProperty('align', value)}
      />

      <SectionDivider label={t('typography')} />

      {/* Font Size */}
      <TextInput
        label={t('font_size')}
        value={block.properties.fontSize}
        onChange={(value) => updateProperty('fontSize', value)}
        placeholder="13px"
      />

      {/* Total Font Size */}
      <TextInput
        label={t('total_font_size')}
        value={block.properties.totalFontSize}
        onChange={(value) => updateProperty('totalFontSize', value)}
        placeholder="18px"
      />

      <SectionDivider label={t('colors')} />

      {/* Label Color */}
      <ColorInput
        label={t('label_color')}
        value={block.properties.labelColor}
        onChange={(value) => updateProperty('labelColor', value)}
        defaultValue="#6B7280"
      />

      {/* Amount Color */}
      <ColorInput
        label={t('amount_color')}
        value={block.properties.amountColor}
        onChange={(value) => updateProperty('amountColor', value)}
        defaultValue="#111827"
      />

      {/* Total Color */}
      <ColorInput
        label={t('total_color')}
        value={block.properties.totalColor}
        onChange={(value) => updateProperty('totalColor', value)}
        defaultValue="#111827"
      />

      {/* Balance Color */}
      <ColorInput
        label={t('balance_color')}
        value={block.properties.balanceColor}
        onChange={(value) => updateProperty('balanceColor', value)}
        defaultValue="#DC2626"
      />

      <SectionDivider label={t('spacing')} />

      {/* Row Spacing */}
      <TextInput
        label={t('row_spacing')}
        value={block.properties.spacing}
        onChange={(value) => updateProperty('spacing', value)}
        placeholder="8px"
      />

      {/* Label Padding */}
      <TextInput
        label={t('label_padding')}
        value={block.properties.labelPadding}
        onChange={(value) => updateProperty('labelPadding', value)}
        placeholder="0px"
        hint={t('css_padding_format')}
      />

      {/* Value Padding */}
      <TextInput
        label={t('value_padding')}
        value={block.properties.valuePadding}
        onChange={(value) => updateProperty('valuePadding', value)}
        placeholder="0px"
        hint={t('css_padding_format')}
      />

      {/* Gap Between Label and Value */}
      <TextInput
        label={t('label_value_gap')}
        value={block.properties.labelValueGap}
        onChange={(value) => updateProperty('labelValueGap', value)}
        placeholder="20px"
      />

      {/* Value Column Min Width */}
      <TextInput
        label={t('value_min_width')}
        value={block.properties.valueMinWidth}
        onChange={(value) => updateProperty('valueMinWidth', value)}
        placeholder={t('auto')}
        hint={t('leave_empty_for_auto')}
      />
    </div>
  );
}
