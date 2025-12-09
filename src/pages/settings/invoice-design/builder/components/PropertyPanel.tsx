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
import { Trash2, Clipboard } from 'lucide-react';
import { Button } from '$app/components/forms';
import { PropertyPanelProps } from '../types';
import { getBlockLabel, getBlockDescription } from '../block-library';
import { TextBlockProperties } from './properties/TextBlockProperties';
import { ImageBlockProperties } from './properties/ImageBlockProperties';
import { TableBlockProperties } from './properties/TableBlockProperties';
import { TotalBlockProperties } from './properties/TotalBlockProperties';

export function PropertyPanel({
  block,
  onChange,
  onDelete,
  onDuplicate,
}: PropertyPanelProps) {
  const [t] = useTranslation();

  return (
    <div className="p-4 space-y-6">
      {/* Header with Title and Copy Button */}
      <div className="flex items-start justify-between gap-2 pb-4 border-b">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-gray-900 mb-1">
            {getBlockLabel(block.type)}
          </h3>
          <p className="text-sm text-gray-600">{getBlockDescription(block.type)}</p>
        </div>
        <button
          onClick={onDuplicate}
          className="flex-shrink-0 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          title={t('duplicate')}
        >
          <Clipboard className="w-4 h-4" />
        </button>
      </div>

      {/* Block-specific properties */}
      <div className="space-y-4">
        {(block.type === 'text' || block.type === 'company-info' || block.type === 'client-info' || block.type === 'invoice-details') && (
          <TextBlockProperties block={block} onChange={onChange} />
        )}

        {(block.type === 'logo' || block.type === 'image') && (
          <ImageBlockProperties block={block} onChange={onChange} />
        )}

        {block.type === 'table' && (
          <TableBlockProperties block={block} onChange={onChange} />
        )}

        {block.type === 'total' && (
          <TotalBlockProperties block={block} onChange={onChange} />
        )}

        {block.type === 'divider' && (
          <DividerProperties block={block} onChange={onChange} />
        )}

        {block.type === 'spacer' && (
          <SpacerProperties block={block} onChange={onChange} />
        )}
      </div>

      {/* Actions */}
      <div className="pt-4 border-t">
        <Button
          type="secondary"
          behavior="button"
          onClick={onDelete}
          className="w-full flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700"
        >
          <Trash2 className="w-4 h-4" />
          {t('delete')}
        </Button>
      </div>
    </div>
  );
}

// Simple property editors for basic block types
function DividerProperties({ block, onChange }: any) {
  const [t] = useTranslation();

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('thickness')}
        </label>
        <input
          type="text"
          value={block.properties.thickness}
          onChange={(e) =>
            onChange({
              ...block,
              properties: { ...block.properties, thickness: e.target.value },
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('color')}
        </label>
        <input
          type="color"
          value={block.properties.color}
          onChange={(e) =>
            onChange({
              ...block,
              properties: { ...block.properties, color: e.target.value },
            })
          }
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('style')}
        </label>
        <select
          value={block.properties.style}
          onChange={(e) =>
            onChange({
              ...block,
              properties: { ...block.properties, style: e.target.value },
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="solid">{t('solid')}</option>
          <option value="dashed">{t('dashed')}</option>
          <option value="dotted">{t('dotted')}</option>
        </select>
      </div>
    </div>
  );
}

function SpacerProperties({ block, onChange }: any) {
  const [t] = useTranslation();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {t('height')}
      </label>
      <input
        type="text"
        value={block.properties.height}
        onChange={(e) =>
          onChange({
            ...block,
            properties: { ...block.properties, height: e.target.value },
          })
        }
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        placeholder="e.g., 40px"
      />
    </div>
  );
}
