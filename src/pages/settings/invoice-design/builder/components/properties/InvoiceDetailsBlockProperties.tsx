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
import { PropertyEditorProps } from '../../types';
import {
  FontSizeInput,
  AlignmentInput,
  ColorInput,
  LineHeightInput,
  TextInput,
  CheckboxInput,
  SectionDivider,
} from './PropertyInputs';

// Available invoice detail fields
const AVAILABLE_FIELDS = [
  { id: 'number', label: 'Invoice Number', variable: '$invoice.number', labelText: 'Invoice #:' },
  { id: 'date', label: 'Invoice Date', variable: '$invoice.date', labelText: 'Date:' },
  { id: 'due_date', label: 'Due Date', variable: '$invoice.due_date', labelText: 'Due Date:' },
  { id: 'po_number', label: 'PO Number', variable: '$invoice.po_number', labelText: 'PO Number:' },
  { id: 'amount', label: 'Amount', variable: '$invoice.amount', labelText: 'Amount:' },
  { id: 'balance', label: 'Balance Due', variable: '$invoice.balance', labelText: 'Balance Due:' },
  { id: 'partial', label: 'Partial/Deposit', variable: '$invoice.partial', labelText: 'Deposit:' },
  { id: 'custom_value1', label: 'Custom Field 1', variable: '$invoice.custom_value1', labelText: 'Custom 1:' },
  { id: 'custom_value2', label: 'Custom Field 2', variable: '$invoice.custom_value2', labelText: 'Custom 2:' },
  { id: 'custom_value3', label: 'Custom Field 3', variable: '$invoice.custom_value3', labelText: 'Custom 3:' },
  { id: 'custom_value4', label: 'Custom Field 4', variable: '$invoice.custom_value4', labelText: 'Custom 4:' },
];

export function InvoiceDetailsBlockProperties({ block, onChange }: PropertyEditorProps) {
  const [t] = useTranslation();

  // Parse current content to get fields in order
  const currentContent = block.properties.content || '';
  const contentLines = currentContent.split('\n').filter((line: string) => line.trim());
  const showLabels = block.properties.showLabels !== false;
  
  // Get enabled fields in their current order by finding which field each line contains
  const enabledFieldsOrdered = contentLines
    .map((line: string) => AVAILABLE_FIELDS.find(f => line.includes(f.variable)))
    .filter(Boolean) as typeof AVAILABLE_FIELDS;

  // Get fields not yet added
  const enabledVariables = enabledFieldsOrdered.map(f => f.variable);
  const availableToAdd = AVAILABLE_FIELDS.filter(
    field => !enabledVariables.includes(field.variable)
  );

  const updateProperty = (key: string, value: any) => {
    onChange({
      ...block,
      properties: { ...block.properties, [key]: value },
    });
  };

  const rebuildContent = (fields: typeof AVAILABLE_FIELDS, withLabels: boolean) => {
    const newContent = fields
      .map(field => withLabels ? `${field.labelText} ${field.variable}` : field.variable)
      .join('\n');
    updateProperty('content', newContent);
  };

  const addField = (field: typeof AVAILABLE_FIELDS[0]) => {
    rebuildContent([...enabledFieldsOrdered, field], showLabels);
  };

  const removeField = (index: number) => {
    const newFields = [...enabledFieldsOrdered];
    newFields.splice(index, 1);
    rebuildContent(newFields, showLabels);
  };

  const moveFieldUp = (index: number) => {
    if (index === 0) return;
    const newFields = [...enabledFieldsOrdered];
    [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
    rebuildContent(newFields, showLabels);
  };

  const moveFieldDown = (index: number) => {
    if (index >= enabledFieldsOrdered.length - 1) return;
    const newFields = [...enabledFieldsOrdered];
    [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
    rebuildContent(newFields, showLabels);
  };

  return (
    <div className="space-y-4">
      {/* Show Labels */}
      <CheckboxInput
        id="showLabels"
        label={t('show_labels')}
        value={showLabels}
        onChange={(value) => {
          updateProperty('showLabels', value);
          rebuildContent(enabledFieldsOrdered, value);
        }}
      />

      {/* Active Fields - Reorderable (custom implementation due to labelText handling) */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          {t('field_order')}
        </label>
        
        <div className="space-y-1">
          {enabledFieldsOrdered.map((field, index) => (
            <div
              key={field.id}
              className="flex items-center gap-1 p-2 border border-gray-200 rounded-md bg-white"
            >
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
                  disabled={index >= enabledFieldsOrdered.length - 1}
                  className={`p-0.5 rounded ${
                    index >= enabledFieldsOrdered.length - 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  title={t('move_down')}
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              <span className="flex-1 text-sm text-gray-700">{field.label}</span>

              <button
                onClick={() => removeField(index)}
                className="p-1 rounded hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors"
                title={t('remove')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {enabledFieldsOrdered.length === 0 && (
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

      <SectionDivider label={t('typography')} />

      {/* Font Size */}
      <FontSizeInput
        label={t('font_size')}
        value={block.properties.fontSize}
        onChange={(value) => updateProperty('fontSize', value)}
      />

      {/* Alignment */}
      <AlignmentInput
        label={t('alignment')}
        value={block.properties.align}
        onChange={(value) => updateProperty('align', value)}
      />

      {/* Text Color */}
      <ColorInput
        label={t('text_color')}
        value={block.properties.color}
        onChange={(value) => updateProperty('color', value)}
        defaultValue="#374151"
      />

      {/* Label Color */}
      <ColorInput
        label={t('label_color')}
        value={block.properties.labelColor}
        onChange={(value) => updateProperty('labelColor', value)}
        defaultValue="#6B7280"
      />

      {/* Line Height */}
      <LineHeightInput
        label={t('line_height')}
        value={block.properties.lineHeight}
        onChange={(value) => updateProperty('lineHeight', value)}
      />

      <SectionDivider label={t('spacing')} />

      {/* Padding */}
      <TextInput
        label={t('padding')}
        value={block.properties.padding}
        onChange={(value) => updateProperty('padding', value)}
        placeholder="0px"
        hint={t('css_padding_format')}
      />
    </div>
  );
}
