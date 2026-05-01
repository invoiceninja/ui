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
import type { TFunction } from 'i18next';
import { ChevronUp, ChevronDown, Settings2, Trash2 } from 'lucide-react';
import { PropertyEditorProps } from '../../types';
import {
  TextInput,
  ColorInput,
  CheckboxInput,
  SectionDivider,
  RangeSliderInput,
} from './PropertyInputs';
import { useColorScheme } from '$app/common/colors';

// Available columns that can be added to the table
// Maps field to canonical ID for consistent matching
const getAvailableColumns = (isTasksTable: boolean, t: TFunction) => [
  {
    id: 'product_key',
    header: isTasksTable ? 'Service' : 'Item',
    field: 'item.product_key',
    width: '25%',
    align: 'left' as const,
  },
  {
    id: 'notes',
    header: 'Description',
    field: 'item.notes',
    width: '30%',
    align: 'left' as const,
  },
  {
    id: 'quantity',
    header: isTasksTable ? 'Hours' : 'Qty',
    field: 'item.quantity',
    width: '10%',
    align: 'center' as const,
  },
  {
    id: 'cost',
    header: isTasksTable ? 'Rate' : 'Rate',
    field: 'item.cost',
    width: '15%',
    align: 'right' as const,
  },
  {
    id: 'net_cost',
    header: 'Net Cost',
    field: 'item.net_cost',
    width: '15%',
    align: 'right' as const,
  },
  {
    id: 'line_total',
    header: String(t('line_total')),
    field: 'item.line_total',
    width: '15%',
    align: 'right' as const,
  },
  {
    id: 'gross_line_total',
    header: String(t('gross_line_total')),
    field: 'item.gross_line_total',
    width: '15%',
    align: 'right' as const,
  },
  {
    id: 'discount',
    header: 'Discount',
    field: 'item.discount',
    width: '10%',
    align: 'right' as const,
  },
  {
    id: 'tax_rate1',
    header: 'Tax',
    field: 'item.tax_rate1',
    width: '10%',
    align: 'right' as const,
  },
  {
    id: 'custom_value1',
    header: 'Custom 1',
    field: 'item.custom_value1',
    width: '15%',
    align: 'left' as const,
  },
  {
    id: 'custom_value2',
    header: 'Custom 2',
    field: 'item.custom_value2',
    width: '15%',
    align: 'left' as const,
  },
];

export function TableBlockProperties({ block, onChange }: PropertyEditorProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const [expandedColumn, setExpandedColumn] = useState<string | null>(null);

  const isTasksTable = block.type === 'tasks-table';

  const AVAILABLE_COLUMNS = getAvailableColumns(isTasksTable, t);

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
  const addColumn = (columnDef: (typeof AVAILABLE_COLUMNS)[0]) => {
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
    [newColumns[index - 1], newColumns[index]] = [
      newColumns[index],
      newColumns[index - 1],
    ];
    updateProperty('columns', newColumns);
  };

  // Move column down
  const moveColumnDown = (index: number) => {
    if (index >= currentColumns.length - 1) return;
    const newColumns = [...currentColumns];
    [newColumns[index], newColumns[index + 1]] = [
      newColumns[index + 1],
      newColumns[index],
    ];
    updateProperty('columns', newColumns);
  };

  // Update a column property
  const updateColumnProp = (index: number, prop: string, value: any) => {
    const newColumns = [...currentColumns];
    newColumns[index] = { ...newColumns[index], [prop]: value };
    updateProperty('columns', newColumns);
  };

  // Get columns not yet added
  const availableToAdd = AVAILABLE_COLUMNS.filter(
    (col) => !isColumnEnabled(col.field)
  );

  return (
    <div className="space-y-4">
      {/* Active Columns - Reorderable */}
      <div>
        <label
          className="block text-sm font-medium mb-3"
          style={{ color: colors.$3 }}
        >
          {t('order')}
        </label>
        <div className="space-y-1">
          {currentColumns.map((column: any, index: number) => {
            const isExpanded = expandedColumn === column.field;

            return (
              <div
                key={`${column.field}-${index}`}
                className="rounded-md"
                style={{
                  backgroundColor: colors.$1,
                  border: `1px solid ${colors.$24}`,
                }}
              >
                <div className="flex items-center gap-2 p-2">
                  {/* Reorder buttons */}
                  <div className="flex flex-col">
                    <button
                      onClick={() => moveColumnUp(index)}
                      disabled={index === 0}
                      className="p-0.5 rounded transition-colors"
                      style={{
                        color: index === 0 ? colors.$24 : colors.$16,
                        cursor: index === 0 ? 'not-allowed' : 'pointer',
                      }}
                      title={String(t('move_up'))}
                    >
                      <ChevronUp
                        className="w-4 h-4"
                        style={{ color: index === 0 ? colors.$24 : colors.$16 }}
                      />
                    </button>
                    <button
                      onClick={() => moveColumnDown(index)}
                      disabled={index >= currentColumns.length - 1}
                      className="p-0.5 rounded transition-colors"
                      style={{
                        color:
                          index >= currentColumns.length - 1
                            ? colors.$24
                            : colors.$16,
                        cursor:
                          index >= currentColumns.length - 1
                            ? 'not-allowed'
                            : 'pointer',
                      }}
                      title={String(t('move_down'))}
                    >
                      <ChevronDown
                        className="w-4 h-4"
                        style={{
                          color:
                            index >= currentColumns.length - 1
                              ? colors.$24
                              : colors.$16,
                        }}
                      />
                    </button>
                  </div>

                  {/* Column info */}
                  <div className="flex-1 min-w-0">
                    <span
                      className="text-sm font-medium truncate block"
                      style={{ color: colors.$3 }}
                    >
                      {column.header}
                    </span>
                    <span className="text-xs" style={{ color: colors.$17 }}>
                      {column.width} · {column.align}
                    </span>
                  </div>

                  {/* Settings toggle */}
                  <button
                    onClick={() =>
                      setExpandedColumn(isExpanded ? null : column.field)
                    }
                    className="p-1.5 rounded transition-colors"
                    style={{
                      backgroundColor: isExpanded ? colors.$25 : 'transparent',
                      color: isExpanded ? colors.$3 : colors.$17,
                    }}
                    title={String(t('settings'))}
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>

                  {/* Remove button */}
                  <button
                    onClick={() => removeColumn(index)}
                    className="p-1.5 rounded transition-colors"
                    style={{ color: colors.$17 }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        'rgba(239, 68, 68, 0.1)';
                      e.currentTarget.style.color = '#ef4444';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = colors.$17;
                    }}
                    title={String(t('remove'))}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Expanded settings */}
                {isExpanded && (
                  <div
                    className="px-3 pb-3 pt-3 space-y-3"
                    style={{
                      backgroundColor: colors.$23,
                      borderTop: `1px solid ${colors.$24}`,
                    }}
                  >
                    <div>
                      <label
                        className="block text-xs mb-1"
                        style={{ color: colors.$17 }}
                      >
                        {t('header')}
                      </label>
                      <input
                        type="text"
                        value={column.header}
                        onChange={(e) =>
                          updateColumnProp(index, 'header', e.target.value)
                        }
                        className="w-full px-2 py-1 rounded text-xs"
                        style={{
                          backgroundColor: colors.$1,
                          border: `1px solid ${colors.$24}`,
                          color: colors.$3,
                        }}
                      />
                    </div>
                    <div>
                      <RangeSliderInput
                        label={String(t('width'))}
                        value={column.width}
                        onChange={(value) =>
                          updateColumnProp(index, 'width', value)
                        }
                        min={5}
                        max={50}
                        step={1}
                        unit="%"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs mb-1"
                        style={{ color: colors.$17 }}
                      >
                        {t('alignment')}
                      </label>
                      <div className="flex gap-1">
                        {['left', 'center', 'right'].map((align) => (
                          <button
                            key={align}
                            onClick={() =>
                              updateColumnProp(index, 'align', align)
                            }
                            className="flex-1 px-2 py-1 text-xs rounded border transition-all"
                            style={{
                              borderColor:
                                column.align === align ? colors.$3 : colors.$24,
                              backgroundColor:
                                column.align === align
                                  ? colors.$25
                                  : 'transparent',
                              color:
                                column.align === align ? colors.$3 : colors.$17,
                            }}
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
            <div
              className="text-center py-4 text-sm border border-dashed rounded-md"
              style={{ color: colors.$17, borderColor: colors.$24 }}
            >
              {t('no_columns_selected')}
            </div>
          )}
        </div>
      </div>

      {/* Add Columns */}
      {availableToAdd.length > 0 && (
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: colors.$3 }}
          >
            {t('add_column')}
          </label>
          <div className="flex flex-wrap gap-2">
            {availableToAdd.map((colDef) => (
              <button
                key={colDef.id}
                onClick={() => addColumn(colDef)}
                className="px-3 py-1.5 text-xs rounded-md transition-colors"
                style={{
                  border: `1px solid ${colors.$24}`,
                  color: colors.$3,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.$20;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                + {colDef.header}
              </button>
            ))}
          </div>
        </div>
      )}

      <SectionDivider label={String(t('typography'))} />

      {/* Font Size */}
      <TextInput
        label={String(t('font_size'))}
        value={block.properties.fontSize}
        onChange={(value) => updateProperty('fontSize', value)}
        placeholder="12px"
        resettable
      />

      <SectionDivider label={String(t('header'))} />

      {/* Header Background */}
      <ColorInput
        label={String(t('background'))}
        value={block.properties.headerBg}
        onChange={(value) => updateProperty('headerBg', value)}
        defaultValue="#F3F4F6"
      />

      {/* Header Text Color */}
      <ColorInput
        label={String(t('text_color'))}
        value={block.properties.headerColor}
        onChange={(value) => updateProperty('headerColor', value)}
        defaultValue="#111827"
      />

      <SectionDivider label={String(t('row'))} />

      {/* Alternate Rows */}
      <CheckboxInput
        id="alternateRows"
        label={String(t('alternate_row_colors'))}
        checked={block.properties.alternateRows}
        onChange={(value) => updateProperty('alternateRows', value)}
      />

      {block.properties.alternateRows && (
        <ColorInput
          label={String(t('background'))}
          value={block.properties.alternateRowBg}
          onChange={(value) => updateProperty('alternateRowBg', value)}
          defaultValue="#F9FAFB"
        />
      )}

      {/* Row Text Color */}
      <ColorInput
        label={String(t('text_color'))}
        value={block.properties.rowColor}
        onChange={(value) => updateProperty('rowColor', value)}
        defaultValue="#374151"
      />

      <SectionDivider label={String(t('borders'))} />

      {/* Show Borders */}
      <CheckboxInput
        id="showBorders"
        label={String(t('show_borders'))}
        checked={block.properties.showBorders}
        onChange={(value) => updateProperty('showBorders', value)}
      />

      {block.properties.showBorders && (
        <ColorInput
          label={String(t('color'))}
          value={block.properties.borderColor}
          onChange={(value) => updateProperty('borderColor', value)}
          defaultValue="#E5E7EB"
        />
      )}

      <SectionDivider label={String(t('spacing'))} />

      {/* Cell Padding */}
      <TextInput
        label={String(t('cell_padding'))}
        value={block.properties.padding}
        onChange={(value) => updateProperty('padding', value)}
        placeholder="8px"
        hint={String(t('css_padding_format'))}
      />
    </div>
  );
}
