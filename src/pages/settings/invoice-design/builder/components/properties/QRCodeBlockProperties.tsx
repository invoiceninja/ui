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
import { TextInput, SectionDivider, AlignmentInput } from './PropertyInputs';
import { useColorScheme } from '$app/common/colors';
import { Button } from '$app/components/forms';

const QR_CODE_TYPES = [
  {
    value: 'payment_link',
    label: 'Payment Link',
    variable: '$payment_qrcode',
  },
  { value: 'sepa', label: 'SEPA/EPC QR', variable: '$sepa_qr_code' },
  { value: 'swiss', label: 'Swiss QR Bill', variable: '$swiss_qr' },
  { value: 'spc', label: 'SPC QR (Legacy Swiss)', variable: '$spc_qr_code' },
  {
    value: 'verifactu',
    label: 'Verifactu (Spain)',
    variable: '$verifactu_qr_code',
  },
];

export function QRCodeBlockProperties({
  block,
  onChange,
}: PropertyEditorProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const updateProperty = (key: string, value: any) => {
    onChange({
      ...block,
      properties: { ...block.properties, [key]: value },
    });
  };

  const currentType = block.properties.qrType || 'payment_link';

  const handleTypeChange = (newType: string) => {
    const typeConfig = QR_CODE_TYPES.find((t) => t.value === newType);
    if (typeConfig) {
      onChange({
        ...block,
        properties: {
          ...block.properties,
          qrType: newType,
          data: typeConfig.variable,
        },
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="grid grid-cols-2 gap-2">
          {QR_CODE_TYPES.map((type) => (
            <Button
              key={type.value}
              behavior="button"
              type={currentType === type.value ? 'primary' : 'secondary'}
              onClick={() => handleTypeChange(type.value)}
              className="justify-start text-xs py-3 px-3"
            >
              <span className="truncate">{type.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <SectionDivider label={String(t('appearance'))} />

      <TextInput
        label={String(t('size'))}
        value={block.properties.size}
        onChange={(value) => updateProperty('size', value)}
        placeholder="100px"
      />

      <AlignmentInput
        label={String(t('alignment'))}
        value={block.properties.align}
        onChange={(value) => updateProperty('align', value)}
      />

    </div>
  );
}
