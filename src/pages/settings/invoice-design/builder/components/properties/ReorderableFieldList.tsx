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
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

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
    [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
    onReorder(newFields);
  };

  const moveFieldDown = (index: number) => {
    if (index >= fields.length - 1) return;
    const newFields = [...fields];
    [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
    onReorder(newFields);
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="space-y-1">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex items-center gap-1 p-2 border border-gray-200 rounded-md bg-white"
          >
            {/* Reorder buttons */}
            <div className="flex flex-col">
              <button
                onClick={() => moveFieldUp(index)}
                disabled={index === 0}
                className={`p-0.5 rounded ${
                  index === 0
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                title={t('move_up')}
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => moveFieldDown(index)}
                disabled={index >= fields.length - 1}
                className={`p-0.5 rounded ${
                  index >= fields.length - 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                title={t('move_down')}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <span className="flex-1 text-sm text-gray-700">{field.label}</span>

            {showRemove && (
              <button
                onClick={() => removeField(index)}
                className="p-1 rounded hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors"
                title={t('remove')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
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
              <button
                key={field.id}
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
  );
}

