/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { PropertyEditorProps, SignatureBlock } from '../../types';
import {
  AlignmentInput,
  CheckboxInput,
  ColorInput,
  FontSizeInput,
  FontStyleInput,
  SectionDivider,
  SelectInput,
  TextInput,
} from './PropertyInputs';
import { DesignerPxNumberInput, mergePxOrOmit } from './DesignerPxNumberInput';

export function SignatureBlockProperties({
  block,
  onChange,
}: PropertyEditorProps<SignatureBlock>) {
  const [t] = useTranslation();

  const updateProperty = (key: string, value: unknown) => {
    onChange({
      ...block,
      properties: { ...block.properties, [key]: value },
    });
  };

  const updateLength = (key: string, value: string | undefined) => {
    onChange({
      ...block,
      properties: mergePxOrOmit(
        block.properties as Record<string, unknown>,
        key,
        value
      ),
    });
  };

  const showLine = block.properties.showLine !== false;

  return (
    <div className="space-y-4">
      <SectionDivider
        label={String(t('content', { defaultValue: 'Content' }))}
      />

      <TextInput
        label={String(t('label', { defaultValue: 'Label' }))}
        value={block.properties.label}
        placeholder={String(
          t('authorized_signature', { defaultValue: 'Authorized Signature' })
        )}
        changeOverride
        debounceTimeout={0}
        onChange={(value) => updateProperty('label', value)}
      />

      <CheckboxInput
        id="signature-show-line"
        label={String(t('show_line', { defaultValue: 'Show signature line' }))}
        checked={showLine}
        onChange={(value) => updateProperty('showLine', value)}
      />

      <CheckboxInput
        id="signature-show-date"
        label={String(t('show_date', { defaultValue: 'Show date' }))}
        checked={block.properties.showDate === true}
        onChange={(value) => updateProperty('showDate', value)}
      />

      <SectionDivider
        label={String(t('typography', { defaultValue: 'Typography' }))}
      />

      <FontSizeInput
        label={String(t('font_size'))}
        value={block.properties.fontSize}
        onChange={(value) => updateProperty('fontSize', value)}
      />

      <FontStyleInput
        label={String(t('text_style', { defaultValue: 'Text style' }))}
        fontWeight={block.properties.fontWeight || 'normal'}
        fontStyle={block.properties.fontStyle || 'normal'}
        onFontWeightChange={(value) =>
          updateProperty('fontWeight', value === 'normal' ? undefined : value)
        }
        onFontStyleChange={(value) =>
          updateProperty('fontStyle', value === 'normal' ? undefined : value)
        }
      />

      <ColorInput
        label={String(t('text_color'))}
        value={block.properties.color}
        defaultValue="#6B7280"
        onChange={(value) => updateProperty('color', value)}
      />

      <AlignmentInput
        label={String(t('alignment'))}
        value={block.properties.align || 'left'}
        onChange={(value) => updateProperty('align', value)}
      />

      {showLine && (
        <>
          <SectionDivider
            label={String(
              t('signature_line', { defaultValue: 'Signature line' })
            )}
          />

          <DesignerPxNumberInput
            label={String(t('width'))}
            value={block.properties.lineWidth}
            placeholder="200"
            min={1}
            onChange={(value) => updateLength('lineWidth', value)}
          />

          <DesignerPxNumberInput
            label={String(t('thickness', { defaultValue: 'Thickness' }))}
            value={block.properties.lineThickness}
            placeholder="1"
            min={1}
            onChange={(value) => updateLength('lineThickness', value)}
          />

          <SelectInput
            label={String(t('style'))}
            value={block.properties.lineStyle || 'solid'}
            onChange={(value) => updateProperty('lineStyle', value)}
            options={[
              {
                value: 'solid',
                label: String(t('solid', { defaultValue: 'Solid' })),
              },
              {
                value: 'dashed',
                label: String(t('dashed', { defaultValue: 'Dashed' })),
              },
              {
                value: 'dotted',
                label: String(t('dotted', { defaultValue: 'Dotted' })),
              },
            ]}
          />

          <ColorInput
            label={String(t('color'))}
            value={block.properties.lineColor}
            defaultValue="#000000"
            onChange={(value) => updateProperty('lineColor', value)}
          />
        </>
      )}

      <SectionDivider
        label={String(t('spacing', { defaultValue: 'Spacing' }))}
      />

      <DesignerPxNumberInput
        label={String(
          t('signature_height', { defaultValue: 'Signature area height' })
        )}
        value={block.properties.signatureHeight}
        placeholder="40"
        onChange={(value) => updateLength('signatureHeight', value)}
      />

      <DesignerPxNumberInput
        label={String(t('padding'))}
        value={block.properties.padding}
        placeholder="0"
        onChange={(value) => updateLength('padding', value)}
      />
    </div>
  );
}
