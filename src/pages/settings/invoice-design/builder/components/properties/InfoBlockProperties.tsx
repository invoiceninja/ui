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
  SectionDivider,
  TextInput,
  CheckboxInput,
} from './PropertyInputs';
import { ReorderableFieldList, FieldDefinition } from './ReorderableFieldList';

interface InfoBlockPropertiesProps extends PropertyEditorProps {
  availableFields: FieldDefinition[];
  title?: string;
  showTitleOption?: boolean;
  addFieldLabel?: string;
  fieldOrderLabel?: string;
  emptyLabel?: string;
}

export function InfoBlockProperties({
  block,
  onChange,
  availableFields,
  title,
  showTitleOption,
  addFieldLabel,
  fieldOrderLabel,
  emptyLabel,
}: InfoBlockPropertiesProps) {
  const [t] = useTranslation();

  const currentContent = block.properties.content || '';
  const contentLines = currentContent.split('\n').filter((line: string) => line.trim());

  const enabledFieldsOrdered = contentLines
    .map((line: string) => availableFields.find((f) => f.variable === line.trim()))
    .filter(Boolean) as FieldDefinition[];

  const availableToAdd = availableFields.filter(
    (field) => !contentLines.includes(field.variable)
  );

  const updateProperty = (key: string, value: any) => {
    onChange({
      ...block,
      properties: { ...block.properties, [key]: value },
    });
  };

  const rebuildContent = (fields: FieldDefinition[]) => {
    updateProperty(
      'content',
      fields.map((f) => f.variable || '').filter(Boolean).join('\n')
    );
  };

  return (
    <div className="space-y-4">
      {title && <h3 className="font-semibold text-gray-900">{title}</h3>}

      {showTitleOption && (
        <div className="space-y-3">
          <CheckboxInput
            id="show_title"
            label={String(t('show_title'))}
            checked={block.properties.showTitle ?? true}
            onChange={(value) => updateProperty('showTitle', value)}
          />

          {block.properties.showTitle !== false && (
            <TextInput
              label={String(t('title_text'))}
              value={block.properties.title || ''}
              onChange={(value) => updateProperty('title', value)}
              placeholder={String(t('title_text_placeholder'))}
            />
          )}
        </div>
      )}

      <ReorderableFieldList
        label={fieldOrderLabel || String(t('field_order'))}
        fields={enabledFieldsOrdered}
        availableFields={availableToAdd}
        onReorder={rebuildContent}
        addFieldLabel={addFieldLabel || String(t('add_field'))}
        emptyLabel={emptyLabel || String(t('no_fields_selected'))}
      />

      <SectionDivider label={String(t('typography'))} />

      <div className="space-y-4">
        <FontSizeInput
          value={block.properties.fontSize || '12px'}
          onChange={(value: string) => updateProperty('fontSize', value)}
        />

        <LineHeightInput
          value={block.properties.lineHeight || '1.5'}
          onChange={(value: string) => updateProperty('lineHeight', value)}
        />

        <AlignmentInput
          value={block.properties.align || 'left'}
          onChange={(value: string) => updateProperty('align', value)}
        />

        <ColorInput
          label={String(t('text_color'))}
          value={block.properties.color || '#374151'}
          onChange={(value: string) => updateProperty('color', value)}
        />
      </div>

      <SectionDivider label={String(t('spacing'))} />

      <TextInput
        label={String(t('padding'))}
        value={block.properties.padding}
        onChange={(value) => updateProperty('padding', value)}
        placeholder="0px"
      />
      <p className="text-xs text-gray-500 -mt-3">{t('css_padding_format')}</p>
    </div>
  );
}
