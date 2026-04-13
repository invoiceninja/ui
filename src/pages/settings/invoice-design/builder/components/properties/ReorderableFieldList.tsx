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
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div
            key={`${field.id}-${index}`}
            className="border border-gray-200 rounded-md bg-white overflow-hidden"
          >
            <div className="flex items-center gap-3 p-3">
              <div className="flex flex-col border border-gray-200 rounded overflow-hidden">
                <button
                  onClick={() => moveFieldUp(index)}
                  disabled={index === 0}
                  className="p-1 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title={String(t('move_up'))}
                >
                  <ChevronUp className="w-4 h-4 text-gray-600" />
                </button>
                <div className="border-t border-gray-200" />
                <button
                  onClick={() => moveFieldDown(index)}
                  disabled={index >= fields.length - 1}
                  className="p-1 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title={String(t('move_down'))}
                >
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <span className="flex-1 text-sm font-medium">{field.label}</span>

              <Button
                behavior="button"
                type="minimal"
                onClick={() => toggleExpand(`${field.id}-${index}`)}
                className={`p-1 h-auto transition-colors ${
                  expandedField === `${field.id}-${index}`
                    ? 'bg-blue-50 text-blue-600'
                    : ''
                }`}
              >
                <Settings2 className="w-4 h-4" />
              </Button>

              {showRemove && (
                <Button
                  behavior="button"
                  type="minimal"
                  onClick={() => removeField(index)}
                  className="p-1 h-auto"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            {expandedField === `${field.id}-${index}` && (
              <div className="px-3 pb-3 pt-1 border-t border-gray-100 bg-gray-50 space-y-3">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-600 uppercase tracking-wider">
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

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-600 uppercase tracking-wider mb-3">
                    <Settings2 className="w-3 h-3" />
                    {t('field_options')}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {t('prefix')}
                      </label>
                      <input
                        type="text"
                        value={field.prefix || ''}
                        onChange={(e) =>
                          updateField(index, { prefix: e.target.value })
                        }
                        placeholder={String(t('prefix_placeholder'))}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {t('suffix')}
                      </label>
                      <input
                        type="text"
                        value={field.suffix || ''}
                        onChange={(e) =>
                          updateField(index, { suffix: e.target.value })
                        }
                        placeholder={String(t('suffix_placeholder'))}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {(field.prefix || field.suffix) && (
                    <div className="text-xs text-gray-500 bg-white p-2 rounded border border-gray-200 mt-3">
                      <span className="font-medium">{t('preview')}: </span>
                      <span className="text-gray-400">
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
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {t('hide_if_empty')}
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
        ))}

        {fields.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm border border-dashed border-gray-300 rounded-md">
            {emptyLabel}
          </div>
        )}
      </div>

      {/* Add Fields */}
      {availableFields.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
