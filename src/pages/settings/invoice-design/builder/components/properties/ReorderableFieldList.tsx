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
import { ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react';
import { Button } from '$app/components/forms';

export interface FieldDefinition {
  id: string;
  label: string;
  variable?: string;
  [key: string]: any;
}

interface ReorderableFieldListProps {
  label?: string;
  fields: FieldDefinition[];
  availableFields: FieldDefinition[];
  onReorder: (fields: FieldDefinition[]) => void;
  addFieldLabel?: string;
  emptyLabel?: string;
  showRemove?: boolean;
}

export function ReorderableFieldList({
  label,
  fields,
  availableFields,
  onReorder,
  addFieldLabel = 'Add Field',
  emptyLabel = 'No fields selected',
  showRemove = true,
}: ReorderableFieldListProps) {
  const [t] = useTranslation();

  const addField = (field: FieldDefinition) => {
    onReorder([...fields, field]);
  };

  const removeField = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    onReorder(newFields);
  };

  const moveFieldUp = (index: number) => {
    if (index === 0) return;
    const newFields = [...fields];
    [newFields[index - 1], newFields[index]] = [
      newFields[index],
      newFields[index - 1],
    ];
    onReorder(newFields);
  };

  const moveFieldDown = (index: number) => {
    if (index >= fields.length - 1) return;
    const newFields = [...fields];
    [newFields[index], newFields[index + 1]] = [
      newFields[index + 1],
      newFields[index],
    ];
    onReorder(newFields);
  };

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
            key={field.id}
            className="flex items-center gap-3 p-3 border border-gray-200 rounded-md bg-white"
          >
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

            <span className="flex-1 text-sm">{field.label}</span>

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
