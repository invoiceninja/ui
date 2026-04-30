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
import { X, ImageIcon } from 'lucide-react';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
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
      
      {block.type !== 'logo' && (
        <ImageUploader
          value={block.properties.source}
          onChange={(value) => updateProperty('source', value)}
        />
      )}

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

interface ImageUploaderProps {
  value: string;
  onChange: (value: string) => void;
}

function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (result) {
        onChange(result);
      }
    };
    reader.readAsDataURL(file);
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
    },
  });

  const handleRemove = useCallback(() => {
    onChange('');
  }, [onChange]);

  const hasImage = value?.startsWith('data:image') || value?.startsWith('http');

  return (
    <div className="space-y-3">
      <label
        className="block text-sm font-medium"
        style={{ color: colors.$3 }}
      >
        {t('image')}
      </label>

      {hasImage && (
        <div className="relative">
          <div
            className="w-full h-32 rounded-lg flex items-center justify-center overflow-hidden"
            style={{
              backgroundColor: colors.$23,
              border: `2px solid ${colors.$24}`,
            }}
          >
            <img
              src={value}
              alt={String(t('preview'))}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: colors.$20,
              color: colors.$3,
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div
        {...getRootProps()}
        className="relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer"
        style={{
          borderColor: isDragActive ? colors.$3 : colors.$24,
          backgroundColor: isDragActive ? colors.$20 : colors.$1,
        }}
      >
        <input {...getInputProps()} />
        
        <ImageIcon
          className="w-8 h-8"
          style={{ color: colors.$17 }}
        />
        
        <div className="text-center">
          <p
            className="text-sm font-medium"
            style={{ color: colors.$3 }}
          >
            {hasImage ? t('upload') : t('drag_and_drop_to_add')}
          </p>
        </div>
      </div>
    </div>
  );
}
