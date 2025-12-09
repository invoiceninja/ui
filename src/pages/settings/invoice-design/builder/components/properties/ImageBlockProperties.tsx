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
import { AlignLeft, AlignCenter, AlignRight, Building2 } from 'lucide-react';
import { PropertyEditorProps } from '../../types';
import { useLogo } from '$app/common/hooks/useLogo';

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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {block.type === 'logo' ? t('logo_source') : t('image_source')}
        </label>
        <input
          type="text"
          value={block.properties.source || ''}
          onChange={(e) => updateProperty('source', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
          placeholder={block.type === 'logo' ? '$company.logo' : 'https://...'}
        />
        <p className="text-xs text-gray-500 mt-1">
          {block.type === 'logo'
            ? t('use_variable_or_url')
            : t('enter_image_url')
          }
        </p>
      </div>

      {/* Max Width */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('max_width')}
        </label>
        <input
          type="text"
          value={block.properties.maxWidth || ''}
          onChange={(e) => updateProperty('maxWidth', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="150px"
        />
      </div>

      {/* Alignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('alignment')}
        </label>
        <div className="flex gap-2">
          {[
            { value: 'left', icon: AlignLeft, label: t('left') },
            { value: 'center', icon: AlignCenter, label: t('center') },
            { value: 'right', icon: AlignRight, label: t('right') },
          ].map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => updateProperty('align', value)}
              className={`
                flex-1 flex items-center justify-center px-3 py-2 border rounded-md transition-all
                ${
                  block.properties.align === value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }
              `}
              title={label}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Object Fit */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('object_fit')}
        </label>
        <select
          value={block.properties.objectFit || 'contain'}
          onChange={(e) => updateProperty('objectFit', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="contain">{t('contain')}</option>
          <option value="cover">{t('cover')}</option>
          <option value="fill">{t('fill')}</option>
          <option value="none">{t('none')}</option>
        </select>
      </div>
    </div>
  );
}
