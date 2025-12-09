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
import { GripVertical } from 'lucide-react';
import { PropertyEditorProps } from '../../types';

// Available columns that can be added to the table
const AVAILABLE_COLUMNS = [
  { id: 'product_key', header: 'Item', field: 'item.product_key', width: '25%', align: 'left' as const },
  { id: 'notes', header: 'Description', field: 'item.notes', width: '30%', align: 'left' as const },
  { id: 'quantity', header: 'Qty', field: 'item.quantity', width: '10%', align: 'center' as const },
  { id: 'cost', header: 'Rate', field: 'item.cost', width: '15%', align: 'right' as const },
  { id: 'line_total', header: 'Amount', field: 'item.line_total', width: '15%', align: 'right' as const },
  { id: 'discount', header: 'Discount', field: 'item.discount', width: '10%', align: 'right' as const },
  { id: 'tax_rate1', header: 'Tax', field: 'item.tax_rate1', width: '10%', align: 'right' as const },
  { id: 'custom_value1', header: 'Custom 1', field: 'item.custom_value1', width: '15%', align: 'left' as const },
  { id: 'custom_value2', header: 'Custom 2', field: 'item.custom_value2', width: '15%', align: 'left' as const },
];

export function TableBlockProperties({ block, onChange }: PropertyEditorProps) {
  const [t] = useTranslation();

  const updateProperty = (key: string, value: any) => {
    onChange({
      ...block,
      properties: { ...block.properties, [key]: value },
    });
  };

  const toggleColumn = (columnDef: typeof AVAILABLE_COLUMNS[0], enabled: boolean) => {
    const currentColumns = [...(block.properties.columns || [])];
    
    if (enabled) {
      // Add column if not already present
      if (!currentColumns.find((c: any) => c.id === columnDef.id)) {
        currentColumns.push({ ...columnDef });
      }
    } else {
      // Remove column
      const index = currentColumns.findIndex((c: any) => c.id === columnDef.id);
      if (index > -1) {
        currentColumns.splice(index, 1);
      }
    }
    
    updateProperty('columns', currentColumns);
  };

  const updateColumn = (columnId: string, field: string, value: any) => {
    const currentColumns = [...(block.properties.columns || [])];
    const index = currentColumns.findIndex((c: any) => c.id === columnId);
    if (index > -1) {
      currentColumns[index] = { ...currentColumns[index], [field]: value };
      updateProperty('columns', currentColumns);
    }
  };

  const isColumnEnabled = (columnId: string) => {
    return block.properties.columns?.some((c: any) => c.id === columnId) || false;
  };

  const getColumn = (columnId: string) => {
    return block.properties.columns?.find((c: any) => c.id === columnId);
  };

  return (
    <div className="space-y-4">
      {/* Columns to Display */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t('columns_to_display')}
        </label>
        <div className="space-y-2">
          {AVAILABLE_COLUMNS.map((colDef) => {
            const enabled = isColumnEnabled(colDef.id);
            const column = getColumn(colDef.id);
            
            return (
              <div key={colDef.id} className="border border-gray-200 rounded-md">
                <div className="flex items-center gap-2 p-2">
                  <input
                    type="checkbox"
                    id={`col-${colDef.id}`}
                    checked={enabled}
                    onChange={(e) => toggleColumn(colDef, e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor={`col-${colDef.id}`} className="flex-1 text-sm text-gray-700">
                    {colDef.header}
                  </label>
                  {enabled && (
                    <GripVertical className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                
                {/* Column settings when enabled */}
                {enabled && column && (
                  <div className="px-2 pb-2 pt-1 border-t border-gray-100 bg-gray-50 space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">{t('header_label')}</label>
                        <input
                          type="text"
                          value={column.header}
                          onChange={(e) => updateColumn(colDef.id, 'header', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                      </div>
                      <div className="w-20">
                        <label className="block text-xs text-gray-500 mb-1">{t('width')}</label>
                        <input
                          type="text"
                          value={column.width}
                          onChange={(e) => updateColumn(colDef.id, 'width', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                          placeholder="15%"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t('alignment')}</label>
                      <div className="flex gap-1">
                        {['left', 'center', 'right'].map((align) => (
                          <button
                            key={align}
                            onClick={() => updateColumn(colDef.id, 'align', align)}
                            className={`flex-1 px-2 py-1 text-xs rounded border transition-all ${
                              column.align === align
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {t(align)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('font_size')}
        </label>
        <input
          type="text"
          value={block.properties.fontSize || '12px'}
          onChange={(e) => updateProperty('fontSize', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="12px"
        />
      </div>

      {/* Header Background */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('header_background')}
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            value={block.properties.headerBg || '#F3F4F6'}
            onChange={(e) => updateProperty('headerBg', e.target.value)}
            className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
          />
          <input
            type="text"
            value={block.properties.headerBg || '#F3F4F6'}
            onChange={(e) => updateProperty('headerBg', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
          />
        </div>
      </div>

      {/* Header Text Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('header_text_color')}
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            value={block.properties.headerColor || '#111827'}
            onChange={(e) => updateProperty('headerColor', e.target.value)}
            className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
          />
          <input
            type="text"
            value={block.properties.headerColor || '#111827'}
            onChange={(e) => updateProperty('headerColor', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
          />
        </div>
      </div>

      {/* Alternate Rows */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="alternateRows"
          checked={block.properties.alternateRows || false}
          onChange={(e) => updateProperty('alternateRows', e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
        />
        <label htmlFor="alternateRows" className="text-sm font-medium text-gray-700">
          {t('alternate_row_colors')}
        </label>
      </div>

      {block.properties.alternateRows && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('alternate_row_background')}
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={block.properties.alternateRowBg || '#F9FAFB'}
              onChange={(e) => updateProperty('alternateRowBg', e.target.value)}
              className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
            />
            <input
              type="text"
              value={block.properties.alternateRowBg || '#F9FAFB'}
              onChange={(e) => updateProperty('alternateRowBg', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
            />
          </div>
        </div>
      )}

      {/* Show Borders */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showBorders"
          checked={block.properties.showBorders || false}
          onChange={(e) => updateProperty('showBorders', e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
        />
        <label htmlFor="showBorders" className="text-sm font-medium text-gray-700">
          {t('show_borders')}
        </label>
      </div>

      {block.properties.showBorders && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('border_color')}
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={block.properties.borderColor || '#E5E7EB'}
              onChange={(e) => updateProperty('borderColor', e.target.value)}
              className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
            />
            <input
              type="text"
              value={block.properties.borderColor || '#E5E7EB'}
              onChange={(e) => updateProperty('borderColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
            />
          </div>
        </div>
      )}

      {/* Cell Padding */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('cell_padding')}
        </label>
        <input
          type="text"
          value={block.properties.padding || '8px'}
          onChange={(e) => updateProperty('padding', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="8px"
        />
      </div>
    </div>
  );
}
