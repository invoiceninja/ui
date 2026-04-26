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
import { useState, useMemo } from 'react';
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
import { useCustomField } from '$app/components/CustomField';
import { useColorScheme } from '$app/common/colors';
import { useLabelMapping } from '../../utils/label-variables';

export function InvoiceDetailsBlockProperties({
  block,
  onChange,
}: PropertyEditorProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const customField = useCustomField();
  const labelMapping = useLabelMapping();
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>(
    {}
  );

  // Get available fields with label variables
  // Label variables (e.g., $number_label) are replaced by backend based on entity type
  const AVAILABLE_FIELDS = useMemo(() => {
    // Base entity detail fields (non-custom) - using label variables for backend replacement
    const baseFields: Omit<FieldConfig, 'id'>[] = [
      {
        label: '$number_label',
        variable: '$number',
        prefix: '$number_label: ',
        hideIfEmpty: true,
      },
      {
        label: '$date_label',
        variable: '$date',
        prefix: '$date_label: ',
        hideIfEmpty: true,
      },
      {
        label: '$due_date_label',
        variable: '$due_date',
        prefix: '$due_date_label: ',
        hideIfEmpty: true,
      },
      {
        label: '$po_number_label',
        variable: '$po_number',
        prefix: '$po_number_label: ',
        hideIfEmpty: true,
      },
      {
        label: '$amount_label',
        variable: '$amount',
        prefix: '$amount_label: ',
        hideIfEmpty: true,
      },
      {
        label: '$balance_label',
        variable: '$balance',
        prefix: '$balance_label: ',
        hideIfEmpty: true,
      },
      {
        label: '$partial_label',
        variable: '$partial',
        prefix: '$partial_label: ',
        hideIfEmpty: true,
      },
    ];

    const customFieldConfigs: Array<{
      key: 'invoice1' | 'invoice2' | 'invoice3' | 'invoice4';
      variable: string;
      fallback: string;
    }> = [
      {
        key: 'invoice1',
        variable: '$entity.custom_value1',
        fallback: t('custom_field') + ' 1',
      },
      {
        key: 'invoice2',
        variable: '$entity.custom_value2',
        fallback: t('custom_field') + ' 2',
      },
      {
        key: 'invoice3',
        variable: '$entity.custom_value3',
        fallback: t('custom_field') + ' 3',
      },
      {
        key: 'invoice4',
        variable: '$entity.custom_value4',
        fallback: t('custom_field') + ' 4',
      },
    ];

    const customFields = customFieldConfigs
      .filter(({ key }) => customField(key).label())
      .map(({ key, variable, fallback }) => {
        const label = customField(key).label();
        return {
          label: label || fallback,
          variable,
          prefix: `${label || fallback}: `,
          hideIfEmpty: true,
        };
      });

    return [...baseFields, ...customFields];
  }, [customField, t]);

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
        <label
          className="block text-sm font-medium"
          style={{ color: colors.$3 }}
        >
          {t('field_order')}
        </label>

        <div className="space-y-2">
          {fieldConfigs.map((field, index) => (
            <div
              key={field.id}
              className="rounded-md overflow-hidden"
              style={{
                backgroundColor: colors.$1,
                border: `1px solid ${colors.$24}`,
              }}
            >
              {/* Field Header Row */}
              <div className="flex items-center gap-2 p-2">
                <div className="flex flex-col">
                  <button
                    onClick={() => moveFieldUp(index)}
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
                    onClick={() => moveFieldDown(index)}
                    disabled={index >= fieldConfigs.length - 1}
                    className="p-0.5 rounded transition-colors"
                    style={{
                      color:
                        index >= fieldConfigs.length - 1
                          ? colors.$24
                          : colors.$16,
                      cursor:
                        index >= fieldConfigs.length - 1
                          ? 'not-allowed'
                          : 'pointer',
                    }}
                    title={String(t('move_down'))}
                  >
                    <ChevronDown
                      className="w-4 h-4"
                      style={{
                        color:
                          index >= fieldConfigs.length - 1
                            ? colors.$24
                            : colors.$16,
                      }}
                    />
                  </button>
                </div>

                <span className="flex-1 text-sm" style={{ color: colors.$3 }}>
                  {labelMapping.getDisplayLabel(field.label)}
                </span>

                {/* Typography Toggle Button */}
                <button
                  onClick={() => toggleFieldExpand(field.id)}
                  className="p-1.5 rounded transition-colors"
                  style={{
                    backgroundColor: expandedFields[field.id]
                      ? colors.$25
                      : 'transparent',
                    color: expandedFields[field.id] ? colors.$3 : colors.$17,
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

              {/* Expanded Typography Controls */}
              {expandedFields[field.id] && (
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

                  <TextInput
                    label={String(t('prefix'))}
                    value={field.prefix || ''}
                    onChange={(value) =>
                      updateFieldTypography(index, 'prefix', value)
                    }
                    placeholder={String(t('prefix_placeholder'))}
                  />

                  <TextInput
                    label={String(t('suffix'))}
                    value={field.suffix || ''}
                    onChange={(value) =>
                      updateFieldTypography(index, 'suffix', value)
                    }
                    placeholder={String(t('suffix_placeholder'))}
                  />

                  {(field.prefix || field.suffix) && (
                    <div
                      className="text-xs p-2 rounded"
                      style={{
                        backgroundColor: colors.$1,
                        border: `1px solid ${colors.$24}`,
                        color: colors.$17,
                      }}
                    >
                      <span className="font-medium">{t('preview')}: </span>
                      <span style={{ color: colors.$24 }}>
                        {field.prefix}
                        {field.variable}
                        {field.suffix}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {fieldConfigs.length === 0 && (
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
                  key={field.variable}
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
