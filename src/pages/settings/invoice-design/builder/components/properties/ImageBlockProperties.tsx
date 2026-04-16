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
import { Building2, Check } from 'lucide-react';
import { PropertyEditorProps } from '../../types';
import { useLogo } from '$app/common/hooks/useLogo';
import {
  TextInput,
  AlignmentInput,
  SelectInput,
  SectionDivider,
} from './PropertyInputs';
import { useColorScheme } from '$app/common/colors';

export function ImageBlockProperties({ block, onChange }: PropertyEditorProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const companyLogo = useLogo();

  const updateProperty = (key: string, value: any) => {
    onChange({
      ...block,
      properties: { ...block.properties, [key]: value },
    });
  };

  const useCompanyLogo = () => {
    updateProperty('source', '$company.logo');
  };

  const isUsingCompanyLogo = block.properties.source === '$company.logo';

  return (
    <div className="space-y-4">
      {block.type === 'logo' && companyLogo && (
        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: colors.$23,
            border: `1px solid ${colors.$24}`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <label
              className="text-sm font-semibold"
              style={{ color: colors.$3 }}
            >
              {t('company_logo_preview')}
            </label>
            {isUsingCompanyLogo && (
              <span
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full"
                style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                  color: '#22c55e',
                }}
              >
                <Check className="w-3 h-3" />
                {t('active')}
              </span>
            )}
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div
                className="w-32 h-32 rounded-2xl shadow-sm flex items-center justify-center overflow-hidden"
                style={{
                  backgroundColor: colors.$1,
                  border: `2px solid ${colors.$24}`,
                }}
              >
                <img
                  src={companyLogo}
                  alt={String(t('company_logo'))}
                  className="max-w-[80%] max-h-[80%] object-contain"
                />
              </div>

              {isUsingCompanyLogo && (
                <div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 shadow-sm"
                  style={{ borderColor: colors.$1 }}
                />
              )}
            </div>

            <button
              onClick={useCompanyLogo}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: isUsingCompanyLogo
                  ? 'rgba(34, 197, 94, 0.1)'
                  : colors.$3,
                color: isUsingCompanyLogo ? '#22c55e' : colors.$1,
                border: isUsingCompanyLogo
                  ? '1px solid rgba(34, 197, 94, 0.3)'
                  : 'none',
              }}
            >
              <Building2 className="w-4 h-4" />
              {isUsingCompanyLogo
                ? t('using_company_logo')
                : t('use_company_logo')}
            </button>
          </div>
        </div>
      )}

      {/* Image Source */}
      <TextInput
        label={
          block.type === 'logo'
            ? String(t('logo_source'))
            : String(t('image_source'))
        }
        value={block.properties.source}
        onChange={(value) => updateProperty('source', value)}
        placeholder={block.type === 'logo' ? '$company.logo' : 'https://...'}
        hint={
          block.type === 'logo'
            ? String(t('use_variable_or_url'))
            : String(t('enter_image_url'))
        }
      />

      <SectionDivider label={String(t('dimensions'))} />

      {/* Max Width */}
      <TextInput
        label={String(t('max_width'))}
        value={block.properties.maxWidth}
        onChange={(value) => updateProperty('maxWidth', value)}
        placeholder="150px"
      />

      {/* Max Height */}
      <TextInput
        label={String(t('max_height'))}
        value={block.properties.maxHeight}
        onChange={(value) => updateProperty('maxHeight', value)}
        placeholder="auto"
      />

      <SectionDivider label={String(t('layout'))} />

      {/* Alignment */}
      <AlignmentInput
        label={String(t('alignment'))}
        value={block.properties.align}
        onChange={(value) => updateProperty('align', value)}
      />

      {/* Object Fit */}
      <SelectInput
        label={String(t('object_fit'))}
        value={block.properties.objectFit || 'contain'}
        onChange={(value) => updateProperty('objectFit', value)}
        options={[
          { value: 'contain', label: String(t('contain')) },
          { value: 'cover', label: String(t('cover')) },
          { value: 'fill', label: String(t('fill')) },
          { value: 'none', label: String(t('none')) },
        ]}
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
