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
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { PropertyEditorProps } from '../../types';

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

  // Parse current content to determine which fields are enabled
  const currentContent = block.properties.content || '';
  const enabledFields = AVAILABLE_FIELDS.filter(field => 
    currentContent.includes(field.variable)
  ).map(f => f.id);

  const updateProperty = (key: string, value: any) => {
    onChange({
      ...block,
      properties: { ...block.properties, [key]: value },
    });
  };

  const toggleField = (fieldId: string, enabled: boolean) => {
    const field = AVAILABLE_FIELDS.find(f => f.id === fieldId);
    if (!field) return;

    let newContent = currentContent;
    const showLabels = block.properties.showLabels !== false;
    const lineToAdd = showLabels ? `${field.labelText} ${field.variable}` : field.variable;
    
    if (enabled) {
      // Add field if not already present
      if (!newContent.includes(field.variable)) {
        newContent = newContent ? `${newContent}\n${lineToAdd}` : lineToAdd;
      }
    } else {
      // Remove field - filter out lines containing the variable
      newContent = newContent
        .split('\n')
        .filter(line => !line.includes(field.variable))
        .join('\n');
    }
    
    updateProperty('content', newContent);
  };

  const isFieldEnabled = (fieldId: string) => {
    return enabledFields.includes(fieldId);
  };

  const rebuildContent = (showLabels: boolean) => {
    const enabledFieldDefs = AVAILABLE_FIELDS.filter(f => enabledFields.includes(f.id));
    const newContent = enabledFieldDefs
      .map(field => showLabels ? `${field.labelText} ${field.variable}` : field.variable)
      .join('\n');
    updateProperty('content', newContent);
  };

  return (
    <div className="space-y-4">
      {/* Show Labels */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showLabels"
          checked={block.properties.showLabels !== false}
          onChange={(e) => {
            updateProperty('showLabels', e.target.checked);
            rebuildContent(e.target.checked);
          }}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
        />
        <label htmlFor="showLabels" className="text-sm font-medium text-gray-700">
          {t('show_labels')}
        </label>
      </div>

      {/* Fields to Display */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t('fields_to_display')}
        </label>
        <div className="space-y-2">
          {AVAILABLE_FIELDS.map((field) => (
            <div key={field.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`invoice-${field.id}`}
                checked={isFieldEnabled(field.id)}
                onChange={(e) => toggleField(field.id, e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor={`invoice-${field.id}`} className="text-sm text-gray-700">
                {field.label}
              </label>
            </div>
          ))}
        </div>
      </div>

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

      {/* Label Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('label_color')}
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            value={block.properties.labelColor || '#6B7280'}
            onChange={(e) => updateProperty('labelColor', e.target.value)}
            className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
          />
          <input
            type="text"
            value={block.properties.labelColor || '#6B7280'}
            onChange={(e) => updateProperty('labelColor', e.target.value)}
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
          value={block.properties.lineHeight || '1.8'}
          onChange={(e) => updateProperty('lineHeight', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="1.8"
        />
      </div>
    </div>
  );
}

