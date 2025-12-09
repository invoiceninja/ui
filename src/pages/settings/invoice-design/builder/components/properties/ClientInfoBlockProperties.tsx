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
import { AlignLeft, AlignCenter, AlignRight, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { PropertyEditorProps } from '../../types';

// Available client info fields
const AVAILABLE_FIELDS = [
  { id: 'name', label: 'Client Name', variable: '$client.name' },
  { id: 'number', label: 'Client Number', variable: '$client.number' },
  { id: 'address1', label: 'Address Line 1', variable: '$client.address1' },
  { id: 'address2', label: 'Address Line 2', variable: '$client.address2' },
  { id: 'city_state_postal', label: 'City, State, Postal', variable: '$client.city_state_postal' },
  { id: 'country', label: 'Country', variable: '$client.country' },
  { id: 'phone', label: 'Phone', variable: '$client.phone' },
  { id: 'email', label: 'Email', variable: '$client.email' },
  { id: 'vat_number', label: 'VAT Number', variable: '$client.vat_number' },
  { id: 'id_number', label: 'ID Number', variable: '$client.id_number' },
  { id: 'custom_value1', label: 'Custom Field 1', variable: '$client.custom_value1' },
  { id: 'custom_value2', label: 'Custom Field 2', variable: '$client.custom_value2' },
];

export function ClientInfoBlockProperties({ block, onChange }: PropertyEditorProps) {
  const [t] = useTranslation();

  // Parse current content to get fields in order
  const currentContent = block.properties.content || '';
  const contentLines = currentContent.split('\n').filter((line: string) => line.trim());
  
  // Get enabled fields in their current order
  const enabledFieldsOrdered = contentLines
    .map((line: string) => AVAILABLE_FIELDS.find(f => f.variable === line.trim()))
    .filter(Boolean) as typeof AVAILABLE_FIELDS;

  // Get fields not yet added
  const availableToAdd = AVAILABLE_FIELDS.filter(
    field => !contentLines.includes(field.variable)
  );

  const updateProperty = (key: string, value: any) => {
    onChange({
      ...block,
      properties: { ...block.properties, [key]: value },
    });
  };

  const rebuildContent = (fields: typeof AVAILABLE_FIELDS) => {
    updateProperty('content', fields.map(f => f.variable).join('\n'));
  };

  const addField = (field: typeof AVAILABLE_FIELDS[0]) => {
    rebuildContent([...enabledFieldsOrdered, field]);
  };

  const removeField = (index: number) => {
    const newFields = [...enabledFieldsOrdered];
    newFields.splice(index, 1);
    rebuildContent(newFields);
  };

  const moveFieldUp = (index: number) => {
    if (index === 0) return;
    const newFields = [...enabledFieldsOrdered];
    [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
    rebuildContent(newFields);
  };

  const moveFieldDown = (index: number) => {
    if (index >= enabledFieldsOrdered.length - 1) return;
    const newFields = [...enabledFieldsOrdered];
    [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
    rebuildContent(newFields);
  };

  return (
    <div className="space-y-4">
      {/* Show Title */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showTitle"
          checked={block.properties.showTitle || false}
          onChange={(e) => updateProperty('showTitle', e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
        />
        <label htmlFor="showTitle" className="text-sm font-medium text-gray-700">
          {t('show_title')}
        </label>
      </div>

      {block.properties.showTitle && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('title_text')}
          </label>
          <input
            type="text"
            value={block.properties.title || 'Bill To:'}
            onChange={(e) => updateProperty('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Bill To:"
          />
        </div>
      )}

      {/* Active Fields - Reorderable */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t('field_order')}
        </label>
        <div className="space-y-1">
          {enabledFieldsOrdered.map((field, index) => (
            <div key={field.id} className="flex items-center gap-1 p-2 border border-gray-200 rounded-md bg-white">
              {/* Reorder buttons */}
              <div className="flex flex-col">
                <button
                  onClick={() => moveFieldUp(index)}
                  disabled={index === 0}
                  className={`p-0.5 rounded ${index === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                  title={t('move_up')}
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveFieldDown(index)}
                  disabled={index >= enabledFieldsOrdered.length - 1}
                  className={`p-0.5 rounded ${index >= enabledFieldsOrdered.length - 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
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

      {/* Font Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('font_size')}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['10px', '12px', '14px', '16px', '18px', '20px'].map((size) => (
            <button
              key={size}
              onClick={() => updateProperty('fontSize', size)}
              className={`
                px-3 py-2 border rounded-md text-sm transition-all
                ${block.properties.fontSize === size
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Alignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('alignment')}
        </label>
        <div className="flex gap-2">
          {[
            { value: 'left', icon: AlignLeft },
            { value: 'center', icon: AlignCenter },
            { value: 'right', icon: AlignRight },
          ].map(({ value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => updateProperty('align', value)}
              className={`
                flex-1 flex items-center justify-center px-3 py-2 border rounded-md transition-all
                ${block.properties.align === value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Text Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('text_color')}
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            value={block.properties.color || '#374151'}
            onChange={(e) => updateProperty('color', e.target.value)}
            className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
          />
          <input
            type="text"
            value={block.properties.color || '#374151'}
            onChange={(e) => updateProperty('color', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
          />
        </div>
      </div>

      {/* Line Height */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('line_height')}
        </label>
        <input
          type="text"
          value={block.properties.lineHeight || '1.6'}
          onChange={(e) => updateProperty('lineHeight', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="1.6"
        />
      </div>
    </div>
  );
}

