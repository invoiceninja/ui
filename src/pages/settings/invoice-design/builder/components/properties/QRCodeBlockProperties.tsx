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
import { TextInput, SectionDivider, SelectInput } from './PropertyInputs';
import { useColorScheme } from '$app/common/colors';

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
  const currentTypeConfig = QR_CODE_TYPES.find((t) => t.value === currentType);

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
      <SelectInput
        label={String(t('qr_code_type'))}
        value={currentType}
        onChange={(value) => handleTypeChange(value)}
        options={QR_CODE_TYPES.map((type) => ({
          value: type.value,
          label: type.label,
        }))}
      />

      <SectionDivider label={String(t('appearance'))} />

      <TextInput
        label={String(t('size'))}
        value={block.properties.size}
        onChange={(value) => updateProperty('size', value)}
        placeholder="100px"
      />

      {/* Alignment */}
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: colors.$3 }}
        >
          {t('alignment')}
        </label>
        <div className="flex gap-1">
          {['left', 'center', 'right'].map((align) => (
            <button
              key={align}
              onClick={() => updateProperty('align', align)}
              className="flex-1 px-3 py-2 text-xs rounded border transition-all"
              style={{
                borderColor:
                  block.properties.align === align ? colors.$3 : colors.$24,
                backgroundColor:
                  block.properties.align === align ? colors.$25 : 'transparent',
                color:
                  block.properties.align === align ? colors.$3 : colors.$17,
              }}
            >
              {t(align)}
            </button>
          ))}
        </div>
      </div>

      <SectionDivider label={String(t('advanced'))} />

      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: colors.$3 }}
        >
          {t('data_variable')}
        </label>
        <input
          type="text"
          value={
            block.properties.data ||
            currentTypeConfig?.variable ||
            '$payment_qrcode'
          }
          readOnly
          className="w-full px-3 py-2 rounded-md text-sm"
          style={{
            backgroundColor: colors.$23,
            border: `1px solid ${colors.$24}`,
            color: colors.$17,
          }}
        />
        <p className="text-xs mt-1" style={{ color: colors.$17 }}>
          {t('variable_determined_by_qr_type')}
        </p>
      </div>
    </div>
  );
}
