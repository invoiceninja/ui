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
  SectionDivider,
} from './PropertyInputs';
import { ReorderableFieldList } from './ReorderableFieldList';

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

  return (
    <div className="space-y-4">
      {/* Active Fields - Reorderable */}
      <ReorderableFieldList
        label={t('field_order')}
        fields={enabledFieldsOrdered}
        availableFields={availableToAdd}
        onReorder={rebuildContent}
        addFieldLabel={t('add_field')}
        emptyLabel={t('no_fields_selected')}
      />

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

