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
import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Type, Trash2 } from 'lucide-react';
import { PropertyEditorProps } from '../../types';
import {
  TextInput,
  AlignmentInput,
  ColorInput,
  FontSizeInput,
  SectionDivider,
  CheckboxInput,
} from './PropertyInputs';
import { CellTypographyEditor } from './CellTypographyEditor';
import { useColorScheme } from '$app/common/colors';
import { useLabelMapping } from '../../utils/label-variables';
import {
  DEFAULT_LABEL_TEXT_COLOR,
  DEFAULT_VALUE_TEXT_COLOR,
} from '../../constants/design-colors';

const AVAILABLE_TOTAL_ITEMS = [
  { label: '$subtotal_label', field: '$subtotal' },
  { label: '$discount_label', field: '$discount' },
  { label: '$custom_surcharge1_label', field: '$custom_surcharge1' },
  { label: '$custom_surcharge2_label', field: '$custom_surcharge2' },
  { label: '$custom_surcharge3_label', field: '$custom_surcharge3' },
  { label: '$custom_surcharge4_label', field: '$custom_surcharge4' },
  { label: '$taxes_label', field: '$taxes' },
  { label: '$total_label', field: '$total', isTotal: true },
  { label: '$paid_to_date_label', field: '$paid_to_date' },
  { label: '$balance_due_label', field: '$balance_due', isBalance: true },
];

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

  const items = block.properties.items || [];

  useEffect(() => {
    const hasHidden = items.some((item: any) => item.show === false);
    if (hasHidden) {
      const cleaned = items
        .filter((item: any) => item.show !== false)
        .map(({ show, ...rest }: any) => rest);
      updateProperty('items', cleaned);
    }
  }, []);

  const addField = (fieldTemplate: (typeof AVAILABLE_TOTAL_ITEMS)[0]) => {
    updateProperty('items', [...items, { ...fieldTemplate }]);
  };

  const removeField = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    updateProperty('items', newItems);
  };

  const moveItemUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [
      newItems[index],
      newItems[index - 1],
    ];
    updateProperty('items', newItems);
  };

  const moveItemDown = (index: number) => {
    if (index >= items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [
      newItems[index + 1],
      newItems[index],
    ];
    updateProperty('items', newItems);
  };

  const updateItemTypography = (index: number, key: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [key]: value || undefined };
    updateProperty('items', newItems);
  };

  const toggleItemExpand = (index: number) => {
    setExpandedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const addedFields = items.map((item: any) => item.field);
  const availableToAdd = AVAILABLE_TOTAL_ITEMS.filter(
    (field) => !addedFields.includes(field.field)
  );

  return (
    <div className="space-y-4">
      {/* Items to show */}
      <div className="space-y-3">
        <label
          className="block text-sm font-medium"
          style={{ color: colors.$3 }}
        >
          {t('items_to_display')}
        </label>

        <div className="space-y-2">
          {items.map((item: any, index: number) => (
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
                    disabled={index >= items.length - 1}
                    className="p-0.5 rounded transition-colors"
                    style={{
                      color:
                        index >= items.length - 1
                          ? colors.$24
                          : colors.$16,
                      cursor:
                        index >= items.length - 1
                          ? 'not-allowed'
                          : 'pointer',
                    }}
                    title={String(t('move_down'))}
                  >
                    <ChevronDown
                      className="w-4 h-4"
                      style={{
                        color:
                          index >= items.length - 1
                            ? colors.$24
                            : colors.$16,
                      }}
                    />
                  </button>
                </div>

                <span className="flex-1 text-sm" style={{ color: colors.$3 }}>
                  {labelMapping.getDisplayLabel(item.label)}
                </span>

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

                <button
                  onClick={() => removeField(index)}
                  className="p-1 rounded transition-colors"
                  style={{ color: colors.$17 }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.color = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.$17;
                  }}
                  title={String(t('remove'))}
                >
                  <Trash2 className="w-4 h-4" />
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
                  <CellTypographyEditor
                    heading={String(t('label'))}
                    value={item.labelStyle}
                    onChange={(next) =>
                      updateItemTypography(index, 'labelStyle', next)
                    }
                    fontSizePlaceholder={block.properties.fontSize || '13px'}
                    colorDefault={
                      item.isTotal
                        ? block.properties.totalColor || DEFAULT_VALUE_TEXT_COLOR
                        : item.isBalance
                          ? block.properties.balanceColor || DEFAULT_VALUE_TEXT_COLOR
                          : block.properties.labelColor || DEFAULT_LABEL_TEXT_COLOR
                    }
                  />

                  <CellTypographyEditor
                    heading={String(t('value'))}
                    value={item.valueStyle}
                    onChange={(next) =>
                      updateItemTypography(index, 'valueStyle', next)
                    }
                    fontSizePlaceholder={block.properties.fontSize || '13px'}
                    colorDefault={
                      item.isTotal
                        ? block.properties.totalColor || DEFAULT_VALUE_TEXT_COLOR
                        : item.isBalance
                          ? block.properties.balanceColor || DEFAULT_VALUE_TEXT_COLOR
                          : block.properties.amountColor || DEFAULT_VALUE_TEXT_COLOR
                    }
                  />
                </div>
              )}
            </div>
          ))}

          {items.length === 0 && (
            <div
              className="text-center py-4 text-sm rounded-md border border-dashed"
              style={{ color: colors.$17, borderColor: colors.$24 }}
            >
              {t('no_fields_selected')}
            </div>
          )}
        </div>

        {/* Add Fields */}
        {availableToAdd.length > 0 && (
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.$3 }}
            >
              {t('add_field')}
            </label>
            <div className="flex flex-wrap gap-2">
              {availableToAdd.map((field) => (
                <button
                  key={field.field}
                  onClick={() => addField(field)}
                  className="px-3 py-1.5 text-xs rounded-md transition-colors"
                  style={{
                    border: `1px solid ${colors.$24}`,
                    color: colors.$3,
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.$20;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  + {labelMapping.getDisplayLabel(field.label)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <SectionDivider label={String(t('typography'))} />

      {/* Global Font Size */}
      <FontSizeInput
        label={String(t('font_size'))}
        value={block.properties.fontSize}
        onChange={(value) => updateProperty('fontSize', value)}
      />

      {/* Block-level alignment (drives table position within the block) */}
      <AlignmentInput
        label={String(t('alignment'))}
        value={block.properties.align}
        onChange={(value) => updateProperty('align', value)}
      />

      {/* Text Color (default value color, mirrors InvoiceDetails) */}
      <ColorInput
        label={String(t('text_color'))}
        value={block.properties.amountColor}
        onChange={(value) => updateProperty('amountColor', value)}
        defaultValue={DEFAULT_VALUE_TEXT_COLOR}
      />

      {/* Label Color */}
      <ColorInput
        label={String(t('label_color'))}
        value={block.properties.labelColor}
        onChange={(value) => updateProperty('labelColor', value)}
        defaultValue={DEFAULT_LABEL_TEXT_COLOR}
      />

      {/* Total Row Color — used when item.isTotal is true */}
      <ColorInput
        label={String(t('total_color'))}
        value={block.properties.totalColor}
        onChange={(value) => updateProperty('totalColor', value)}
        defaultValue={DEFAULT_VALUE_TEXT_COLOR}
      />

      {/* Balance Row Color — used when item.isBalance is true */}
      <ColorInput
        label={String(t('balance_color'))}
        value={block.properties.balanceColor}
        onChange={(value) => updateProperty('balanceColor', value)}
        defaultValue={DEFAULT_VALUE_TEXT_COLOR}
      />

      <SectionDivider label={String(t('columns'))} />

      <AlignmentInput
        label={String(t('label_alignment'))}
        value={block.properties.labelAlign || 'right'}
        onChange={(value) => updateProperty('labelAlign', value)}
      />

      <AlignmentInput
        label={String(t('value_alignment'))}
        value={block.properties.valueAlign || 'right'}
        onChange={(value) => updateProperty('valueAlign', value)}
      />

      <SectionDivider label={String(t('spacing'))} />

      {/* Block-level padding (mirrors InvoiceDetails) */}
      <TextInput
        label={String(t('padding'))}
        value={block.properties.padding}
        onChange={(value) => updateProperty('padding', value)}
        placeholder="0px"
        hint={String(t('css_padding_format'))}
      />

      <TextInput
        label={String(t('label_padding'))}
        value={block.properties.labelPadding}
        onChange={(value) => updateProperty('labelPadding', value)}
        placeholder="0px"
        hint={String(t('css_padding_format'))}
      />

      <TextInput
        label={String(t('value_padding'))}
        value={block.properties.valuePadding}
        onChange={(value) => updateProperty('valuePadding', value)}
        placeholder="0px"
        hint={String(t('css_padding_format'))}
      />

      <TextInput
        label={String(t('label_value_gap'))}
        value={block.properties.labelValueGap}
        onChange={(value) => updateProperty('labelValueGap', value)}
        placeholder="20px"
      />

      {/* Row spacing — historical storage key on the Total block is `spacing`. */}
      <TextInput
        label={String(t('row_spacing'))}
        value={block.properties.spacing}
        onChange={(value) => updateProperty('spacing', value)}
        placeholder="8px"
      />

      <TextInput
        label={String(t('value_min_width'))}
        value={block.properties.valueMinWidth}
        onChange={(value) => updateProperty('valueMinWidth', value)}
        placeholder={String(t('auto'))}
        hint={String(t('leave_empty_for_auto'))}
      />

      <SectionDivider label={String(t('page_break') || 'Page Break')} />

      <CheckboxInput
        label={
          String(t('keep_together') || 'Force page break before this block')
        }
        checked={Boolean(block.properties.keepTogether)}
        onChange={(value) => updateProperty('keepTogether', value)}
      />
    </div>
  );
}
