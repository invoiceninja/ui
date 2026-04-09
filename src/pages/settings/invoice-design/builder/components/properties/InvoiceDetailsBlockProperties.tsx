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
import { ChevronUp, ChevronDown, Trash2, Type } from 'lucide-react';
import { PropertyEditorProps, FieldConfig } from '../../types';
import {
  FontSizeInput,
  AlignmentInput,
  ColorInput,
  LineHeightInput,
  TextInput,
  CheckboxInput,
  SectionDivider,
  FontStyleInput,
} from './PropertyInputs';

// Available entity detail fields with entity-agnostic labels
const AVAILABLE_FIELDS: Omit<FieldConfig, 'id'>[] = [
  {
    label: 'Number',
    variable: '$entity.number',
    prefix: 'Number: ',
    hideIfEmpty: true,
  },
  {
    label: 'Date',
    variable: '$entity.date',
    prefix: 'Date: ',
    hideIfEmpty: true,
  },
  {
    label: 'Due Date',
    variable: '$entity.due_date',
    prefix: 'Due Date: ',
    hideIfEmpty: true,
  },
  {
    label: 'PO Number',
    variable: '$entity.po_number',
    prefix: 'PO Number: ',
    hideIfEmpty: true,
  },
  {
    label: 'Amount',
    variable: '$entity.amount',
    prefix: 'Amount: ',
    hideIfEmpty: true,
  },
  {
    label: 'Balance',
    variable: '$entity.balance',
    prefix: 'Balance: ',
    hideIfEmpty: true,
  },
  {
    label: 'Partial/Deposit',
    variable: '$entity.partial',
    prefix: 'Partial/Deposit: ',
    hideIfEmpty: true,
  },
  {
    label: 'Custom Field 1',
    variable: '$entity.custom_value1',
    prefix: 'Custom 1: ',
    hideIfEmpty: true,
  },
  {
    label: 'Custom Field 2',
    variable: '$entity.custom_value2',
    prefix: 'Custom 2: ',
    hideIfEmpty: true,
  },
  {
    label: 'Custom Field 3',
    variable: '$entity.custom_value3',
    prefix: 'Custom 3: ',
    hideIfEmpty: true,
  },
  {
    label: 'Custom Field 4',
    variable: '$entity.custom_value4',
    prefix: 'Custom 4: ',
    hideIfEmpty: true,
  },
];

export function InvoiceDetailsBlockProperties({
  block,
  onChange,
}: PropertyEditorProps) {
  const [t] = useTranslation();
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>(
    {}
  );

  // Migrate from old content-based format to fieldConfigs if needed
  const fieldConfigs: FieldConfig[] = block.properties.fieldConfigs || [];
  const showLabels = block.properties.showLabels !== false;

  const updateProperty = (key: string, value: any) => {
    onChange({
      ...block,
      properties: { ...block.properties, [key]: value },
    });
  };

  const updateFieldTypography = (index: number, key: string, value: any) => {
    const updatedConfigs = [...fieldConfigs];
    updatedConfigs[index] = {
      ...updatedConfigs[index],
      [key]: value || undefined,
    };
    updateProperty('fieldConfigs', updatedConfigs);
  };

  const addField = (fieldTemplate: (typeof AVAILABLE_FIELDS)[0]) => {
    const newField: FieldConfig = {
      id: `${fieldTemplate.variable}-${Date.now()}`,
      ...fieldTemplate,
    };
    updateProperty('fieldConfigs', [...fieldConfigs, newField]);
  };

  const removeField = (index: number) => {
    const newConfigs = [...fieldConfigs];
    newConfigs.splice(index, 1);
    updateProperty('fieldConfigs', newConfigs);
  };

  const moveFieldUp = (index: number) => {
    if (index === 0) return;
    const newConfigs = [...fieldConfigs];
    [newConfigs[index - 1], newConfigs[index]] = [
      newConfigs[index],
      newConfigs[index - 1],
    ];
    updateProperty('fieldConfigs', newConfigs);
  };

  const moveFieldDown = (index: number) => {
    if (index >= fieldConfigs.length - 1) return;
    const newConfigs = [...fieldConfigs];
    [newConfigs[index], newConfigs[index + 1]] = [
      newConfigs[index + 1],
      newConfigs[index],
    ];
    updateProperty('fieldConfigs', newConfigs);
  };

  const toggleFieldExpand = (fieldId: string) => {
    setExpandedFields((prev) => ({ ...prev, [fieldId]: !prev[fieldId] }));
  };

  // Get available fields not yet added
  const addedVariables = fieldConfigs.map((f) => f.variable);
  const availableToAdd = AVAILABLE_FIELDS.filter(
    (field) => !addedVariables.includes(field.variable)
  );

  return (
    <div className="space-y-4">
      {/* Show Labels - Toggle to hide/show all prefixes */}
      <CheckboxInput
        id="showLabels"
        label={String(t('show_labels'))}
        checked={showLabels}
        onChange={(value) => updateProperty('showLabels', value)}
      />

      {/* Active Fields - Reorderable with per-field typography */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          {t('field_order')}
        </label>

        <div className="space-y-2">
          {fieldConfigs.map((field, index) => (
            <div
              key={field.id}
              className="border border-gray-200 rounded-md bg-white overflow-hidden"
            >
              {/* Field Header Row */}
              <div className="flex items-center gap-1 p-2">
                <div className="flex flex-col">
                  <button
                    onClick={() => moveFieldUp(index)}
                    disabled={index === 0}
                    className={`p-0.5 rounded ${
                      index === 0
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                    title={String(t('move_up'))}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveFieldDown(index)}
                    disabled={index >= fieldConfigs.length - 1}
                    className={`p-0.5 rounded ${
                      index >= fieldConfigs.length - 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                    title={String(t('move_down'))}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <span className="flex-1 text-sm text-gray-700">
                  {field.label}
                </span>

                {/* Typography Toggle Button */}
                <button
                  onClick={() => toggleFieldExpand(field.id)}
                  className={`p-1.5 rounded transition-colors ${expandedFields[field.id] ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                  title={String(t('typography'))}
                >
                  <Type className="w-4 h-4" />
                </button>

                <button
                  onClick={() => removeField(index)}
                  className="p-1 rounded hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors"
                  title={String(t('remove'))}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Expanded Typography Controls */}
              {expandedFields[field.id] && (
                <div className="px-3 pb-3 pt-1 border-t border-gray-100 bg-gray-50 space-y-3">
                  {/* Font Size */}
                  <TextInput
                    label={String(t('font_size'))}
                    value={field.fontSize || ''}
                    onChange={(value) =>
                      updateFieldTypography(index, 'fontSize', value)
                    }
                    placeholder={block.properties.fontSize || '12px'}
                  />

                  {/* Font Weight & Style */}
                  <FontStyleInput
                    label={String(t('font_style'))}
                    fontWeight={field.fontWeight || 'normal'}
                    fontStyle={field.fontStyle || 'normal'}
                    onFontWeightChange={(value) =>
                      updateFieldTypography(
                        index,
                        'fontWeight',
                        value === 'normal' ? undefined : value
                      )
                    }
                    onFontStyleChange={(value) =>
                      updateFieldTypography(
                        index,
                        'fontStyle',
                        value === 'normal' ? undefined : value
                      )
                    }
                  />

                  {/* Text Color */}
                  <ColorInput
                    label={String(t('text_color'))}
                    value={field.color || ''}
                    onChange={(value) =>
                      updateFieldTypography(index, 'color', value || undefined)
                    }
                    defaultValue={block.properties.color || '#374151'}
                  />
                </div>
              )}
            </div>
          ))}

          {fieldConfigs.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm border border-dashed border-gray-300 rounded-md">
              {t('no_fields_selected')}
            </div>
          )}
        </div>

        {/* Add Fields */}
        {availableToAdd.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('add_field')}
            </label>
            <div className="flex flex-wrap gap-2">
              {availableToAdd.map((field) => (
                <button
                  key={field.variable}
                  onClick={() => addField(field)}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors"
                >
                  + {field.label}
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

      {/* Alignment */}
      <AlignmentInput
        label={String(t('alignment'))}
        value={block.properties.align}
        onChange={(value) => updateProperty('align', value)}
      />

      {/* Text Color */}
      <ColorInput
        label={String(t('text_color'))}
        value={block.properties.color}
        onChange={(value) => updateProperty('color', value)}
        defaultValue="#374151"
      />

      {/* Label Color */}
      <ColorInput
        label={String(t('label_color'))}
        value={block.properties.labelColor}
        onChange={(value) => updateProperty('labelColor', value)}
        defaultValue="#6B7280"
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
