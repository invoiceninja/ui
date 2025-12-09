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
import { Building2 } from 'lucide-react';
import { PropertyEditorProps } from '../../types';
import { useLogo } from '$app/common/hooks/useLogo';
import {
  TextInput,
  AlignmentInput,
  SelectInput,
  SectionDivider,
} from './PropertyInputs';

export function ImageBlockProperties({ block, onChange }: PropertyEditorProps) {
  const [t] = useTranslation();
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
      {/* Company Logo Preview (for logo block type) */}
      {block.type === 'logo' && companyLogo && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t('company_logo_preview')}
          </label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src={companyLogo}
                alt="Company Logo"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="flex-1">
              <button
                onClick={useCompanyLogo}
                className={`
                  w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                  ${isUsingCompanyLogo
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }
                `}
              >
                <Building2 className="w-4 h-4" />
                {isUsingCompanyLogo ? t('using_company_logo') : t('use_company_logo')}
              </button>
              {isUsingCompanyLogo && (
                <p className="text-xs text-green-600 mt-2 text-center">
                  ✓ {t('company_logo_active')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Source */}
      <TextInput
        label={block.type === 'logo' ? t('logo_source') : t('image_source')}
        value={block.properties.source}
        onChange={(value) => updateProperty('source', value)}
        placeholder={block.type === 'logo' ? '$company.logo' : 'https://...'}
        hint={block.type === 'logo' ? t('use_variable_or_url') : t('enter_image_url')}
      />

      <SectionDivider label={t('dimensions')} />

      {/* Max Width */}
      <TextInput
        label={t('max_width')}
        value={block.properties.maxWidth}
        onChange={(value) => updateProperty('maxWidth', value)}
        placeholder="150px"
      />

      {/* Max Height */}
      <TextInput
        label={t('max_height')}
        value={block.properties.maxHeight}
        onChange={(value) => updateProperty('maxHeight', value)}
        placeholder="auto"
      />

      <SectionDivider label={t('layout')} />

      {/* Alignment */}
      <AlignmentInput
        label={t('alignment')}
        value={block.properties.align}
        onChange={(value) => updateProperty('align', value)}
      />

      {/* Object Fit */}
      <SelectInput
        label={t('object_fit')}
        value={block.properties.objectFit || 'contain'}
        onChange={(value) => updateProperty('objectFit', value)}
        options={[
          { value: 'contain', label: t('contain') },
          { value: 'cover', label: t('cover') },
          { value: 'fill', label: t('fill') },
          { value: 'none', label: t('none') },
        ]}
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
