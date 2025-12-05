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
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { PropertyEditorProps } from '../../types';

export function ImageBlockProperties({ block, onChange }: PropertyEditorProps) {
  const [t] = useTranslation();

  const updateProperty = (key: string, value: any) => {
    onChange({
      ...block,
      properties: { ...block.properties, [key]: value },
    });
  };

  return (
    <div className="space-y-4">
      {/* Image Source */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('image_source')}
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
            ? t('use_company_logo_variable')
            : t('enter_image_url_or_upload')
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
