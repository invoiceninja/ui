/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { Button, InputField, Link } from '$app/components/forms';
import { Table, Tbody, Td, Th, Thead, Tr } from '$app/components/tables';
import { atom, useAtom } from 'jotai';
import { cloneDeep } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sortRows, SortConfig, SortType, detectSortType, groupRows } from '../utils/sortingUtils';

export const previewAtom = atom<Preview | null>(null);

export interface PreviewResponse {
  columns: Column[];
  [key: number]: Cell[];
}

export interface Preview {
  columns: Column[];
  rows: Cell[][];
}

export interface Column {
  identifier: string;
  display_value: string;
}

export interface Cell {
  entity: string;
  id: string;
  hashed_id: null;
  value: string;
  display_value: string | JSX.Element | number;
  identifier: string;
}

interface Replacement {
  identifier: string;
  format: (cell: Cell) => string | number | JSX.Element;
}

export function usePreview() {
  const [preview] = useAtom(previewAtom);
  const [processed, setProcessed] = useState<Preview | null>(null);

  const replacements: Replacement[] = [
    {
      identifier: 'credit.number',
      format: (cell) => (
        <Link to={`/credits/${cell.value}`}>{cell.display_value}</Link>
      ),
    },
  ];

  useEffect(() => {
    if (!preview) {
      return;
    }

    const copy = cloneDeep(preview);

    copy.rows.map((row) => {
      row.map((cell) => {
        const replacement = replacements.find(
          (replacement) => replacement.identifier === cell.identifier
        );

        if (replacement) {
          cell.display_value = replacement.format(cell);
        }
      });
    });

    setProcessed(copy);
  }, [preview]);

  return processed;
}

interface EnhancedPreviewProps {
  enableMultiSort?: boolean;
  enableNaturalSort?: boolean;
  enableGrouping?: boolean;
}

export function EnhancedPreview({ 
  enableMultiSort = true,
  enableNaturalSort = true,
  enableGrouping = false 
}: EnhancedPreviewProps) {
  const [t] = useTranslation();

  const preview = usePreview();
  const colors = useColorScheme();

  const [sortConfigs, setSortConfigs] = useState<SortConfig[]>([]);
  const [filtered, setFiltered] = useState<Preview | null>(null);
  const [sortTypeOverrides, setSortTypeOverrides] = useState<Record<string, SortType>>({});
  const [groupByColumn, setGroupByColumn] = useState<string | null>(null);

  if (!preview) {
    return null;
  }

  const filter = (column: string, value: string) => {
    const copy = cloneDeep(preview);

    copy.rows = copy.rows.filter((sub) =>
      sub.some((item) => {
        if (item.identifier !== column) {
          return false;
        }

        if (typeof item.display_value === 'number') {
          return item.display_value
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase());
        }

        if (typeof item.display_value === 'string') {
          return item.display_value.toLowerCase().includes(value.toLowerCase());
        }

        if (typeof item.display_value === 'object') {
          return item.display_value.props.children
            .toLowerCase()
            .includes(value.toLowerCase());
        }
      })
    );

    setFiltered(copy);
  };

  const handleSort = (column: string, shiftKey: boolean = false) => {
    let newConfigs: SortConfig[];
    
    const existingConfig = sortConfigs.find(config => config.column === column);
    const direction = existingConfig?.direction === 'asc' ? 'desc' : 'asc';
    
    // Detect sort type based on first non-empty value
    const firstRow = (filtered || preview).rows.find(row => {
      const cell = row.find(c => c.identifier === column);
      return cell && cell.display_value !== '' && cell.display_value !== null;
    });
    
    const firstCell = firstRow?.find(c => c.identifier === column);
    const detectedType = firstCell ? detectSortType(column, String(firstCell.display_value)) : 'case-insensitive';
    const sortType = sortTypeOverrides[column] || detectedType;

    if (enableMultiSort && shiftKey) {
      // Multi-column sort with Shift key
      if (existingConfig) {
        newConfigs = sortConfigs.map(config =>
          config.column === column
            ? { ...config, direction, sortType }
            : config
        );
      } else {
        newConfigs = [...sortConfigs, { column, direction, sortType }];
      }
    } else {
      // Single column sort
      newConfigs = [{ column, direction, sortType }];
    }

    setSortConfigs(newConfigs);

    const copy = cloneDeep(filtered || preview);
    copy.rows = sortRows(copy.rows, newConfigs);
    setFiltered(copy);
  };

  const removeSortColumn = (column: string) => {
    const newConfigs = sortConfigs.filter(config => config.column !== column);
    setSortConfigs(newConfigs);
    
    if (newConfigs.length > 0) {
      const copy = cloneDeep(filtered || preview);
      copy.rows = sortRows(copy.rows, newConfigs);
      setFiltered(copy);
    } else {
      setFiltered(null);
    }
  };

  const clearAllSorts = () => {
    setSortConfigs([]);
    setFiltered(null);
  };

  const setSortType = (column: string, sortType: SortType) => {
    setSortTypeOverrides(current => ({ ...current, [column]: sortType }));
    
    // Re-sort if this column is already in sort configs
    const configIndex = sortConfigs.findIndex(config => config.column === column);
    if (configIndex !== -1) {
      const newConfigs = [...sortConfigs];
      newConfigs[configIndex] = { ...newConfigs[configIndex], sortType };
      setSortConfigs(newConfigs);
      
      const copy = cloneDeep(filtered || preview);
      copy.rows = sortRows(copy.rows, newConfigs);
      setFiltered(copy);
    }
  };

  const data = filtered?.rows || preview.rows;

  const downloadCsv = () => {
    const rows = [
      preview.columns.map((column) => column.display_value).join(','),
    ];

    const dataToExport = filtered ? filtered.rows : preview.rows;

    dataToExport.map((row) => {
      rows.push(
        row
          .map((cell) => {
            if (cell.display_value.toString() === 'true') {
              return 'Yes';
            }

            if (cell.display_value.toString() === 'false') {
              return 'No';
            }

            return `"${cell.display_value}"`;
          })
          .join(',')
      );
    });

    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'report.csv');
    link.click();
  };

  const renderGroupedData = () => {
    if (!groupByColumn) return renderNormalData();
    
    const groups = groupRows(data, groupByColumn);
    const elements: JSX.Element[] = [];
    
    groups.forEach((rows, groupName) => {
      elements.push(
        <Tr key={`group-${groupName}`} className="bg-gray-100">
          <Td colSpan={preview.columns.length}>
            <strong>{groupName}</strong> ({rows.length} items)
          </Td>
        </Tr>
      );
      
      rows.forEach((row, i) => {
        elements.push(
          <Tr
            key={`${groupName}-${i}`}
            className="border-b"
            style={{ borderColor: colors.$20 }}
          >
            {row.map((cell, j) => (
              <Td key={j}>{cell.display_value}</Td>
            ))}
          </Tr>
        );
      });
    });
    
    return elements;
  };

  const renderNormalData = () => {
    return data.map((row, i) => (
      <Tr
        key={i}
        className="border-b"
        style={{ borderColor: colors.$20 }}
      >
        {row.map((cell, j) => (
          <Td key={j}>{cell.display_value}</Td>
        ))}
      </Tr>
    ));
  };

  return (
    <div id="preview-table my-4">
      <div className="flex justify-between mb-4">
        <div className="flex gap-2">
          {sortConfigs.length > 0 && (
            <Button behavior="button" onClick={clearAllSorts}>
              {t('clear')} {t('sort')}
            </Button>
          )}
          {enableGrouping && (
            <select
              className="form-select"
              value={groupByColumn || ''}
              onChange={(e) => setGroupByColumn(e.target.value || null)}
            >
              <option value="">No grouping</option>
              {preview.columns.map(col => (
                <option key={col.identifier} value={col.identifier}>
                  Group by {col.display_value}
                </option>
              ))}
            </select>
          )}
        </div>
        <Button behavior="button" onClick={downloadCsv}>
          {t('download')} {t('csv_file')}
        </Button>
      </div>

      <Table>
        <Thead>
          {preview.columns.map((column, i) => {
            const sortConfig = sortConfigs.find(config => config.column === column.identifier);
            const sortIndex = sortConfig ? sortConfigs.indexOf(sortConfig) + 1 : null;
            
            return (
              <Th
                key={i}
                style={{ borderBottom: `1px solid ${colors.$20}` }}
                isCurrentlyUsed={!!sortConfig}
                onColumnClick={(e: React.MouseEvent) => handleSort(column.identifier, e.shiftKey)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>{column.display_value}</span>
                  {sortConfig && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                      {enableMultiSort && sortConfigs.length > 1 && (
                        <span className="text-xs bg-gray-200 rounded px-1">
                          {sortIndex}
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSortColumn(column.identifier);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </Th>
            );
          })}
        </Thead>

        <Tbody>
          <Tr
            className="border-b"
            style={{ borderColor: colors.$20 }}
          >
            {preview.columns.map((column, i) => (
              <Td key={i}>
                <InputField
                  onValueChange={(value) => filter(column.identifier, value)}
                  changeOverride
                />
              </Td>
            ))}
          </Tr>

          {enableGrouping && groupByColumn 
            ? renderGroupedData()
            : renderNormalData()
          }
        </Tbody>
      </Table>
      
      {enableMultiSort && (
        <div className="mt-2 text-sm text-gray-600">
          {t('tip')}: Hold Shift while clicking to sort by multiple columns
        </div>
      )}
    </div>
  );
}
