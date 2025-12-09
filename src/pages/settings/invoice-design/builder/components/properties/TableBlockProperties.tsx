/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronUp, ChevronDown, Settings2, Trash2 } from 'lucide-react';
import { PropertyEditorProps } from '../../types';
import {
  TextInput,
  ColorInput,
  CheckboxInput,
  SectionDivider,
} from './PropertyInputs';

// Available columns that can be added to the table
// Maps field to canonical ID for consistent matching
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
  const [expandedColumn, setExpandedColumn] = useState<string | null>(null);

  const updateProperty = (key: string, value: any) => {
    onChange({
      ...block,
      properties: { ...block.properties, [key]: value },
    });
  };

  // Get current columns from block
  const currentColumns = block.properties.columns || [];

  // Check if a column is enabled
  const isColumnEnabled = (field: string) => {
    return currentColumns.some((c: any) => c.field === field);
  };

  // Add a column
  const addColumn = (columnDef: typeof AVAILABLE_COLUMNS[0]) => {
    if (!isColumnEnabled(columnDef.field)) {
      updateProperty('columns', [...currentColumns, { ...columnDef }]);
    }
  };

  // Remove a column by index
  const removeColumn = (index: number) => {
    const newColumns = [...currentColumns];
    newColumns.splice(index, 1);
    updateProperty('columns', newColumns);
  };

  // Move column up
  const moveColumnUp = (index: number) => {
    if (index === 0) return;
    const newColumns = [...currentColumns];
    [newColumns[index - 1], newColumns[index]] = [newColumns[index], newColumns[index - 1]];
    updateProperty('columns', newColumns);
  };

  // Move column down
  const moveColumnDown = (index: number) => {
    if (index >= currentColumns.length - 1) return;
    const newColumns = [...currentColumns];
    [newColumns[index], newColumns[index + 1]] = [newColumns[index + 1], newColumns[index]];
    updateProperty('columns', newColumns);
  };

  // Update a column property
  const updateColumnProp = (index: number, prop: string, value: any) => {
    const newColumns = [...currentColumns];
    newColumns[index] = { ...newColumns[index], [prop]: value };
    updateProperty('columns', newColumns);
  };

  // Get columns not yet added
  const availableToAdd = AVAILABLE_COLUMNS.filter(col => !isColumnEnabled(col.field));

  return (
    <div className="space-y-4">
      {/* Active Columns - Reorderable */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t('column_order')}
        </label>
        <div className="space-y-1">
          {currentColumns.map((column: any, index: number) => {
            const isExpanded = expandedColumn === column.field;
            
            return (
              <div key={`${column.field}-${index}`} className="border border-gray-200 rounded-md bg-white">
                <div className="flex items-center gap-1 p-2">
                  {/* Reorder buttons */}
                  <div className="flex flex-col">
                    <button
                      onClick={() => moveColumnUp(index)}
                      disabled={index === 0}
                      className={`p-0.5 rounded ${index === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                      title={t('move_up')}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveColumnDown(index)}
                      disabled={index >= currentColumns.length - 1}
                      className={`p-0.5 rounded ${index >= currentColumns.length - 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                      title={t('move_down')}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Column info */}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-700 truncate block">
                      {column.header}
                    </span>
                    <span className="text-xs text-gray-400">
                      {column.width} · {column.align}
                    </span>
                  </div>
                  
                  {/* Settings toggle */}
                  <button
                    onClick={() => setExpandedColumn(isExpanded ? null : column.field)}
                    className={`p-1.5 rounded transition-colors ${isExpanded ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-500'}`}
                    title={t('settings')}
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>
                  
                  {/* Remove button */}
                  <button
                    onClick={() => removeColumn(index)}
                    className="p-1.5 rounded hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors"
                    title={t('remove')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Expanded settings */}
                {isExpanded && (
                  <div className="px-2 pb-2 pt-1 border-t border-gray-100 bg-gray-50 space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">{t('header_label')}</label>
                        <input
                          type="text"
                          value={column.header}
                          onChange={(e) => updateColumnProp(index, 'header', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                      </div>
                      <div className="w-20">
                        <label className="block text-xs text-gray-500 mb-1">{t('width')}</label>
                        <input
                          type="text"
                          value={column.width}
                          onChange={(e) => updateColumnProp(index, 'width', e.target.value)}
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
                            onClick={() => updateColumnProp(index, 'align', align)}
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
          
          {currentColumns.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm border border-dashed border-gray-300 rounded-md">
              {t('no_columns_selected')}
            </div>
          )}
        </div>
      </div>

      {/* Add Columns */}
      {availableToAdd.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('add_column')}
          </label>
          <div className="flex flex-wrap gap-2">
            {availableToAdd.map((colDef) => (
              <button
                key={colDef.id}
                onClick={() => addColumn(colDef)}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                + {colDef.header}
              </button>
            ))}
          </div>
        </div>
      )}

      <SectionDivider label={t('typography')} />

      {/* Font Size */}
      <TextInput
        label={t('font_size')}
        value={block.properties.fontSize}
        onChange={(value) => updateProperty('fontSize', value)}
        placeholder="12px"
      />

      <SectionDivider label={t('header_style')} />

      {/* Header Background */}
      <ColorInput
        label={t('header_background')}
        value={block.properties.headerBg}
        onChange={(value) => updateProperty('headerBg', value)}
        defaultValue="#F3F4F6"
      />

      {/* Header Text Color */}
      <ColorInput
        label={t('header_text_color')}
        value={block.properties.headerColor}
        onChange={(value) => updateProperty('headerColor', value)}
        defaultValue="#111827"
      />

      <SectionDivider label={t('row_style')} />

      {/* Alternate Rows */}
      <CheckboxInput
        id="alternateRows"
        label={t('alternate_row_colors')}
        value={block.properties.alternateRows}
        onChange={(value) => updateProperty('alternateRows', value)}
      />

      {block.properties.alternateRows && (
        <ColorInput
          label={t('alternate_row_background')}
          value={block.properties.alternateRowBg}
          onChange={(value) => updateProperty('alternateRowBg', value)}
          defaultValue="#F9FAFB"
        />
      )}

      <SectionDivider label={t('borders')} />

      {/* Show Borders */}
      <CheckboxInput
        id="showBorders"
        label={t('show_borders')}
        value={block.properties.showBorders}
        onChange={(value) => updateProperty('showBorders', value)}
      />

      {block.properties.showBorders && (
        <ColorInput
          label={t('border_color')}
          value={block.properties.borderColor}
          onChange={(value) => updateProperty('borderColor', value)}
          defaultValue="#E5E7EB"
        />
      )}

      <SectionDivider label={t('spacing')} />

      {/* Cell Padding */}
      <TextInput
        label={t('cell_padding')}
        value={block.properties.padding}
        onChange={(value) => updateProperty('padding', value)}
        placeholder="8px"
        hint={t('css_padding_format')}
      />
    </div>
  );
}
