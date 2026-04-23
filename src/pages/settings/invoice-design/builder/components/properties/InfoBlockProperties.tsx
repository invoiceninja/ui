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
import { useMemo, useCallback } from 'react';
import { PropertyEditorProps, FieldConfig } from '../../types';
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
import { useColorScheme } from '$app/common/colors';

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
  const colors = useColorScheme();

  const migrateFromLegacy = useCallback((): FieldConfig[] => {
    const content = block.properties.content || '';
    if (!content) return [];

    const lines = content.split('\n').filter((line: string) => line.trim());

    return lines
      .map((line: string) => {
        const variable = line.trim();
        const fieldDef = availableFields.find((f) => f.variable === variable);
        if (fieldDef) {
          return {
            id: fieldDef.id,
            label: fieldDef.label,
            variable: fieldDef.variable || '',
            prefix: '',
            suffix: '',
            hideIfEmpty: true,
          };
        }

        const variableMatch = variable.match(/\$([^.]+)\.(.+)/);

        if (variableMatch) {
          return {
            id: variable.replace(/\$/g, '').replace(/\./g, '_'),
            label: variableMatch[2]
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (l: string) => l.toUpperCase()),
            variable: variable,
            prefix: '',
            suffix: '',
            hideIfEmpty: true,
          };
        }
        return null;
      })
      .filter((f: FieldConfig | null): f is FieldConfig => f !== null);
  }, [block.properties.content, availableFields]);

  const fieldConfigs: FieldConfig[] = useMemo(
    () => block.properties.fieldConfigs || migrateFromLegacy(),
    [block.properties.fieldConfigs, migrateFromLegacy]
  );

  const availableToAdd = useMemo(
    () =>
      availableFields.filter(
        (field: FieldDefinition) =>
          !fieldConfigs.some((config) => config.id === field.id)
      ),
    [availableFields, fieldConfigs]
  );

  const updateProperty = useCallback(
    (key: string, value: any) => {
      onChange({
        ...block,
        properties: { ...block.properties, [key]: value },
      });
    },
    [block, onChange]
  );

  const handleFieldConfigsChange = useCallback(
    (newConfigs: FieldConfig[]) => {
      const content = newConfigs
        .map((c) => c.variable)
        .filter(Boolean)
        .join('\n');

      onChange({
        ...block,
        properties: {
          ...block.properties,
          fieldConfigs: newConfigs,
          content,
        },
      });
    },
    [block, onChange]
  );

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="font-semibold" style={{ color: colors.$3 }}>
          {title}
        </h3>
      )}

      {showTitleOption && (
        <div className="space-y-3">
          <CheckboxInput
            id="show_title"
            label={String(t('show_header'))}
            checked={block.properties.showTitle ?? true}
            onChange={(value) => updateProperty('showTitle', value)}
          />

          {block.properties.showTitle !== false && (
            <TextInput
              label={String(t('header'))}
              value={block.properties.title || ''}
              onChange={(value) => updateProperty('title', value)}
              placeholder={String(t('bill_to'))}
            />
          )}
        </div>
      )}

      <ReorderableFieldList
        label={fieldOrderLabel || String(t('fields'))}
        fields={fieldConfigs}
        availableFields={availableToAdd}
        onChange={handleFieldConfigsChange}
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
      <p className="text-xs -mt-3" style={{ color: colors.$17 }}>
        {t('css_padding_format')}
      </p>
    </div>
  );
}
