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

// Available company info fields
const AVAILABLE_FIELDS = [
  { id: 'name', label: 'Company Name', variable: '$company.name' },
  { id: 'address1', label: 'Address Line 1', variable: '$company.address1' },
  { id: 'address2', label: 'Address Line 2', variable: '$company.address2' },
  { id: 'city_state_postal', label: 'City, State, Postal', variable: '$company.city_state_postal' },
  { id: 'country', label: 'Country', variable: '$company.country' },
  { id: 'phone', label: 'Phone', variable: '$company.phone' },
  { id: 'email', label: 'Email', variable: '$company.email' },
  { id: 'website', label: 'Website', variable: '$company.website' },
  { id: 'vat_number', label: 'VAT Number', variable: '$company.vat_number' },
  { id: 'id_number', label: 'ID Number', variable: '$company.id_number' },
];

export function CompanyInfoBlockProperties({ block, onChange }: PropertyEditorProps) {
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
    
    if (enabled) {
      // Add field if not already present
      if (!newContent.includes(field.variable)) {
        newContent = newContent ? `${newContent}\n${field.variable}` : field.variable;
      }
    } else {
      // Remove field - handle both with and without newline
      newContent = newContent
        .split('\n')
        .filter(line => line.trim() !== field.variable)
        .join('\n');
    }
    
    updateProperty('content', newContent);
  };

  const isFieldEnabled = (fieldId: string) => {
    return enabledFields.includes(fieldId);
  };

  return (
    <div className="space-y-4">
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
                id={`company-${field.id}`}
                checked={isFieldEnabled(field.id)}
                onChange={(e) => toggleField(field.id, e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor={`company-${field.id}`} className="text-sm text-gray-700">
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

