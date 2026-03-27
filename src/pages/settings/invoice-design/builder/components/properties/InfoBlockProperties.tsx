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
} from './PropertyInputs';

interface FieldDefinition {
  id: string;
  label: string;
  variable: string;
}

interface InfoBlockPropertiesProps extends PropertyEditorProps {
  availableFields: FieldDefinition[];
  title?: string;
  showTitleOption?: boolean;
}

export function InfoBlockProperties({
  block,
  onChange,
  availableFields,
  title,
}: InfoBlockPropertiesProps) {
  const [t] = useTranslation();

  const updateProperty = (key: string, value: any) => {
    onChange({
      ...block,
      properties: { ...block.properties, [key]: value },
    });
  };

  return (
    <div className="space-y-4">
      {title && <h3 className="font-semibold text-gray-900">{title}</h3>}

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
    </div>
  );
}
