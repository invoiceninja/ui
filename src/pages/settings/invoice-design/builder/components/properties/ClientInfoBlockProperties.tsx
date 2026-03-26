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
import { ReorderableFieldList } from './ReorderableFieldList';

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

  const rebuildContent = (fields: Array<{ id: string; label: string; variable?: string }>) => {
    updateProperty('content', fields.map(f => f.variable || '').filter(Boolean).join('\n'));
  };

  return (
    <div className="space-y-4">
      {/* Show Title */}
      <CheckboxInput
        id="showTitle"
        label={String(t('show_title'))}
        value={block.properties.showTitle}
        onChange={(value) => updateProperty('showTitle', value)}
      />

      {block.properties.showTitle && (
        <TextInput
          label={String(t('title_text'))}
          value={block.properties.title}
          onChange={(value) => updateProperty('title', value)}
          placeholder="Bill To:"
        />
      )}

      {/* Active Fields - Reorderable */}
      <ReorderableFieldList
        label={String(t('field_order'))}
        fields={enabledFieldsOrdered}
        availableFields={availableToAdd}
        onReorder={rebuildContent}
        addFieldLabel={String(t('add_field'))}
        emptyLabel={String(t('no_fields_selected'))}
      />

      <SectionDivider label={String(t('typography'))} />

      {/* Font Size */}
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

