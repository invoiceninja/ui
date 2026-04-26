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
import { useState } from 'react';
import { ChevronUp, ChevronDown, Type } from 'lucide-react';
import { PropertyEditorProps } from '../../types';
import {
  ColorInput,
  TextInput,
  AlignmentInput,
  SectionDivider,
  FontStyleInput,
} from './PropertyInputs';
import { useColorScheme } from '$app/common/colors';
import { useLabelMapping } from '../../utils/label-variables';
import { Checkbox } from '$app/components/forms';

export function TotalBlockProperties({ block, onChange }: PropertyEditorProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const labelMapping = useLabelMapping();
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>(
    {}
  );

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

  const updateItemTypography = (index: number, key: string, value: any) => {
    const updatedItems = [...block.properties.items];
    updatedItems[index] = { ...updatedItems[index], [key]: value };
    updateProperty('items', updatedItems);
  };

  const moveItemUp = (index: number) => {
    if (index === 0) return;
    const updatedItems = [...block.properties.items];
    [updatedItems[index - 1], updatedItems[index]] = [
      updatedItems[index],
      updatedItems[index - 1],
    ];
    updateProperty('items', updatedItems);
  };

  const moveItemDown = (index: number) => {
    const items = block.properties.items;
    if (index >= items.length - 1) return;
    const updatedItems = [...items];
    [updatedItems[index], updatedItems[index + 1]] = [
      updatedItems[index + 1],
      updatedItems[index],
    ];
    updateProperty('items', updatedItems);
  };

  const toggleItemExpand = (index: number) => {
    setExpandedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="space-y-4">
      <div
        className="p-3 rounded-md"
        style={{ backgroundColor: colors.$23, border: `1px solid ${colors.$24}` }}
      >
        <Checkbox
          id="show-paid-stamp"
          label={t('show_paid_stamp')}
          checked={block.properties.showPaidStamp || false}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => updateProperty('showPaidStamp', event.target.checked)}
        />
      </div>

      {/* Items to show */}
      <div>
        <label
          className="block text-sm font-medium mb-3"
          style={{ color: colors.$3 }}
        >
          {t('items_to_display')}
        </label>
        <div className="space-y-2">
          {block.properties.items?.map((item: any, index: number) => (
            <div
              key={index}
              className="rounded-md overflow-hidden"
              style={{
                backgroundColor: colors.$1,
                border: `1px solid ${colors.$24}`,
              }}
            >
              <div className="flex items-center gap-2 p-2">
                <div className="flex flex-col">
                  <button
                    onClick={() => moveItemUp(index)}
                    disabled={index === 0}
                    className="p-0.5 rounded transition-colors"
                    style={{
                      color: index === 0 ? colors.$24 : colors.$16,
                      cursor: index === 0 ? 'not-allowed' : 'pointer',
                    }}
                    title={String(t('move_up'))}
                  >
                    <ChevronUp
                      className="w-4 h-4"
                      style={{ color: index === 0 ? colors.$24 : colors.$16 }}
                    />
                  </button>
                  <button
                    onClick={() => moveItemDown(index)}
                    disabled={index >= block.properties.items.length - 1}
                    className="p-0.5 rounded transition-colors"
                    style={{
                      color:
                        index >= block.properties.items.length - 1
                          ? colors.$24
                          : colors.$16,
                      cursor:
                        index >= block.properties.items.length - 1
                          ? 'not-allowed'
                          : 'pointer',
                    }}
                    title={String(t('move_down'))}
                  >
                    <ChevronDown
                      className="w-4 h-4"
                      style={{
                        color:
                          index >= block.properties.items.length - 1
                            ? colors.$24
                            : colors.$16,
                      }}
                    />
                  </button>
                </div>

                <input
                  type="checkbox"
                  id={`item-${index}`}
                  checked={item.show}
                  onChange={(e) =>
                    updateItemVisibility(index, e.target.checked)
                  }
                  className="w-4 h-4 rounded"
                  style={{ accentColor: colors.$3 }}
                />
                <label
                  htmlFor={`item-${index}`}
                  className="flex-1 text-sm"
                  style={{ color: colors.$3 }}
                >
                  {labelMapping.getDisplayLabel(item.label)}
                </label>

                <button
                  onClick={() => toggleItemExpand(index)}
                  className="p-1.5 rounded transition-colors"
                  style={{
                    backgroundColor: expandedItems[index]
                      ? colors.$25
                      : 'transparent',
                    color: expandedItems[index] ? colors.$3 : colors.$17,
                  }}
                  title={String(t('typography'))}
                >
                  <Type className="w-4 h-4" />
                </button>
              </div>

              {expandedItems[index] && (
                <div
                  className="px-3 pb-3 pt-3 space-y-3"
                  style={{
                    backgroundColor: colors.$23,
                    borderTop: `1px solid ${colors.$24}`,
                  }}
                >
                  {/* Font Size */}
                  <TextInput
                    label={String(t('font_size'))}
                    value={item.fontSize || ''}
                    onChange={(value) =>
                      updateItemTypography(
                        index,
                        'fontSize',
                        value || undefined
                      )
                    }
                    placeholder={
                      item.isTotal
                        ? block.properties.totalFontSize || '18px'
                        : block.properties.fontSize || '13px'
                    }
                  />

                  <FontStyleInput
                    label={String(t('font_style'))}
                    fontWeight={
                      item.fontWeight ||
                      (item.isTotal
                        ? block.properties.totalFontWeight
                        : 'normal')
                    }
                    fontStyle={item.fontStyle || 'normal'}
                    onFontWeightChange={(value) =>
                      updateItemTypography(
                        index,
                        'fontWeight',
                        value === 'normal' ? undefined : value
                      )
                    }
                    onFontStyleChange={(value) =>
                      updateItemTypography(
                        index,
                        'fontStyle',
                        value === 'normal' ? undefined : value
                      )
                    }
                  />

                  <ColorInput
                    label={String(t('label_color'))}
                    value={item.color || ''}
                    onChange={(value) =>
                      updateItemTypography(index, 'color', value || undefined)
                    }
                    defaultValue={
                      item.isTotal
                        ? block.properties.totalColor || '#111827'
                        : item.isBalance
                          ? block.properties.balanceColor || '#DC2626'
                          : block.properties.labelColor || '#6B7280'
                    }
                  />

                  <ColorInput
                    label={String(t('amount_color'))}
                    value={item.amountColor || ''}
                    onChange={(value) =>
                      updateItemTypography(index, 'amountColor', value || undefined)
                    }
                    defaultValue={
                      item.isTotal
                        ? block.properties.totalColor || '#111827'
                        : item.isBalance
                          ? block.properties.balanceColor || '#DC2626'
                          : block.properties.amountColor || '#111827'
                    }
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <SectionDivider label={String(t('alignment'))} />

      {/* Alignment */}
      <AlignmentInput
        label={String(t('alignment'))}
        value={block.properties.align}
        onChange={(value) => updateProperty('align', value)}
      />

      <SectionDivider label={String(t('typography'))} />

      {/* Font Size */}
      <TextInput
        label={String(t('font_size'))}
        value={block.properties.fontSize}
        onChange={(value) => updateProperty('fontSize', value)}
        placeholder="13px"
      />

      {/* Total Font Size */}
      <TextInput
        label={String(t('total_font_size'))}
        value={block.properties.totalFontSize}
        onChange={(value) => updateProperty('totalFontSize', value)}
        placeholder="18px"
      />

      <SectionDivider label={String(t('spacing'))} />

      {/* Row Spacing */}
      <TextInput
        label={String(t('row_spacing'))}
        value={block.properties.spacing}
        onChange={(value) => updateProperty('spacing', value)}
        placeholder="8px"
      />

      {/* Label Padding */}
      <TextInput
        label={String(t('label_padding'))}
        value={block.properties.labelPadding}
        onChange={(value) => updateProperty('labelPadding', value)}
        placeholder="0px"
        hint={String(t('css_padding_format'))}
      />

      {/* Value Padding */}
      <TextInput
        label={String(t('value_padding'))}
        value={block.properties.valuePadding}
        onChange={(value) => updateProperty('valuePadding', value)}
        placeholder="0px"
        hint={String(t('css_padding_format'))}
      />

      {/* Gap Between Label and Value */}
      <TextInput
        label={String(t('label_value_gap'))}
        value={block.properties.labelValueGap}
        onChange={(value) => updateProperty('labelValueGap', value)}
        placeholder="20px"
      />

      {/* Value Column Min Width */}
      <TextInput
        label={String(t('value_min_width'))}
        value={block.properties.valueMinWidth}
        onChange={(value) => updateProperty('valueMinWidth', value)}
        placeholder={String(t('auto'))}
        hint={String(t('leave_empty_for_auto'))}
      />
    </div>
  );
}
