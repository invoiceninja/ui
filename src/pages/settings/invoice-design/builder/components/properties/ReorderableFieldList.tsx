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
import { useState, useCallback } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Settings2,
  Type,
} from 'lucide-react';
import { Button } from '$app/components/forms';
import { FieldConfig } from '../../types';
import { TextInput, ColorInput, FontStyleInput } from './PropertyInputs';
import { useColorScheme } from '$app/common/colors';

export interface FieldDefinition {
  id: string;
  label: string;
  variable?: string;
  [key: string]: any;
}

interface ReorderableFieldListProps {
  label?: string;
  fields: FieldConfig[];
  availableFields: FieldDefinition[];
  onChange: (fields: FieldConfig[]) => void;
  addFieldLabel?: string;
  emptyLabel?: string;
  showRemove?: boolean;
}

export function ReorderableFieldList({
  label,
  fields,
  availableFields,
  onChange,
  addFieldLabel = 'Add Field',
  emptyLabel = 'No fields selected',
  showRemove = true,
}: ReorderableFieldListProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const [expandedField, setExpandedField] = useState<string | null>(null);

  const addField = useCallback(
    (field: FieldDefinition) => {
      const newField: FieldConfig = {
        id: field.id,
        label: field.label,
        variable: field.variable || '',
        prefix: '',
        suffix: '',
        hideIfEmpty: true,
      };
      onChange([...fields, newField]);
    },
    [fields, onChange]
  );

  const removeField = useCallback(
    (index: number) => {
      const newFields = [...fields];
      newFields.splice(index, 1);
      onChange(newFields);
    },
    [fields, onChange]
  );

  const moveFieldUp = useCallback(
    (index: number) => {
      if (index === 0) return;
      const newFields = [...fields];
      [newFields[index - 1], newFields[index]] = [
        newFields[index],
        newFields[index - 1],
      ];
      onChange(newFields);
    },
    [fields, onChange]
  );

  const moveFieldDown = useCallback(
    (index: number) => {
      if (index >= fields.length - 1) return;
      const newFields = [...fields];
      [newFields[index], newFields[index + 1]] = [
        newFields[index + 1],
        newFields[index],
      ];
      onChange(newFields);
    },
    [fields, onChange]
  );

  const updateField = useCallback(
    (index: number, updates: Partial<FieldConfig>) => {
      const newFields = [...fields];
      newFields[index] = { ...newFields[index], ...updates };
      onChange(newFields);
    },
    [fields, onChange]
  );

  const toggleExpand = useCallback((fieldId: string) => {
    setExpandedField((current) => (current === fieldId ? null : fieldId));
  }, []);

  return (
    <div className="space-y-3">
      {label && (
        <label
          className="block text-sm font-medium"
          style={{ color: colors.$3 }}
        >
          {label}
        </label>
      )}

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div
            key={`${field.id}-${index}`}
            className="rounded-md overflow-hidden"
            style={{
              backgroundColor: colors.$1,
              border: `1px solid ${colors.$24}`,
            }}
          >
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
                  disabled={index >= fields.length - 1}
                  className="p-0.5 rounded transition-colors"
                  style={{
                    color: index >= fields.length - 1 ? colors.$24 : colors.$16,
                    cursor:
                      index >= fields.length - 1 ? 'not-allowed' : 'pointer',
                  }}
                  title={String(t('move_down'))}
                >
                  <ChevronDown
                    className="w-4 h-4"
                    style={{
                      color:
                        index >= fields.length - 1 ? colors.$24 : colors.$16,
                    }}
                  />
                </button>
              </div>

              <span className="flex-1 text-sm" style={{ color: colors.$3 }}>
                {field.label}
              </span>

              <button
                onClick={() => toggleExpand(`${field.id}-${index}`)}
                className="p-1.5 rounded transition-colors"
                style={{
                  backgroundColor:
                    expandedField === `${field.id}-${index}`
                      ? colors.$25
                      : 'transparent',
                  color:
                    expandedField === `${field.id}-${index}`
                      ? colors.$3
                      : colors.$17,
                }}
              >
                <Settings2 className="w-4 h-4" />
              </button>

              {showRemove && (
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
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {expandedField === `${field.id}-${index}` && (
              <div
                className="px-3 pb-3 pt-3 space-y-3"
                style={{
                  backgroundColor: colors.$23,
                  borderTop: `1px solid ${colors.$24}`,
                }}
              >
                <div className="space-y-3">
                  <div
                    className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider"
                    style={{ color: colors.$17 }}
                  >
                    <Type className="w-3 h-3" />
                    {t('typography')}
                  </div>

                  <TextInput
                    label={String(t('font_size'))}
                    value={field.fontSize || ''}
                    onChange={(value) =>
                      updateField(index, { fontSize: value || undefined })
                    }
                    placeholder="12px"
                    resettable
                  />

                  <FontStyleInput
                    label={String(t('font_style'))}
                    fontWeight={field.fontWeight || 'normal'}
                    fontStyle={field.fontStyle || 'normal'}
                    onFontWeightChange={(value) =>
                      updateField(index, {
                        fontWeight: value === 'normal' ? undefined : value,
                      })
                    }
                    onFontStyleChange={(value) =>
                      updateField(index, {
                        fontStyle: value === 'normal' ? undefined : value,
                      })
                    }
                  />

                  <ColorInput
                    label={String(t('text_color'))}
                    value={field.color || ''}
                    onChange={(value) =>
                      updateField(index, { color: value || undefined })
                    }
                    defaultValue="#374151"
                  />
                </div>

                <div
                  className="pt-3"
                  style={{ borderTop: `1px solid ${colors.$24}` }}
                >
                  <div
                    className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider mb-3"
                    style={{ color: colors.$17 }}
                  >
                    <Settings2 className="w-3 h-3" />
                    {t('field_options')}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        className="block text-xs font-medium mb-1"
                        style={{ color: colors.$17 }}
                      >
                        {t('prefix')}
                      </label>
                      <input
                        type="text"
                        value={field.prefix || ''}
                        onChange={(e) =>
                          updateField(index, { prefix: e.target.value })
                        }
                        placeholder={String(t('prefix_placeholder'))}
                        className="w-full px-2 py-1.5 text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{
                          backgroundColor: colors.$1,
                          border: `1px solid ${colors.$24}`,
                          color: colors.$3,
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs font-medium mb-1"
                        style={{ color: colors.$17 }}
                      >
                        {t('suffix')}
                      </label>
                      <input
                        type="text"
                        value={field.suffix || ''}
                        onChange={(e) =>
                          updateField(index, { suffix: e.target.value })
                        }
                        placeholder={String(t('suffix_placeholder'))}
                        className="w-full px-2 py-1.5 text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{
                          backgroundColor: colors.$1,
                          border: `1px solid ${colors.$24}`,
                          color: colors.$3,
                        }}
                      />
                    </div>
                  </div>

                  {(field.prefix || field.suffix) && (
                    <div
                      className="text-xs p-2 rounded mt-3"
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

                  <label className="flex items-center gap-2 mt-3">
                    <input
                      type="checkbox"
                      checked={field.hideIfEmpty !== false}
                      onChange={(e) =>
                        updateField(index, { hideIfEmpty: e.target.checked })
                      }
                      className="rounded focus:ring-blue-500"
                      style={{ accentColor: colors.$3 }}
                    />
                    <span className="text-sm" style={{ color: colors.$3 }}>
                      {t('hide_if_empty')}
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
        ))}

        {fields.length === 0 && (
          <div
            className="text-center py-4 text-sm border border-dashed rounded-md"
            style={{ color: colors.$17, borderColor: colors.$24 }}
          >
            {emptyLabel}
          </div>
        )}
      </div>

      {/* Add Fields */}
      {availableFields.length > 0 && (
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: colors.$3 }}
          >
            {addFieldLabel}
          </label>
          <div className="flex flex-wrap gap-2">
            {availableFields.map((field) => (
              <Button
                key={field.id}
                behavior="button"
                type="secondary"
                onClick={() => addField(field)}
                className="py-1.5 px-3 text-xs h-auto"
              >
                <Plus className="w-3 h-3 mr-1" />
                {field.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
