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
import { Button, InputField } from '$app/components/forms';
import { Table, Tbody, Td, Th, Thead, Tr } from '$app/components/tables';
import { cloneDeep } from 'lodash';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { sortRows, SortConfig, SortType, detectSortType, groupRows } from '../utils/sortingUtils';
// Import the preview types and hook from Preview.tsx
import { usePreview } from './Preview';

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
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortTypeOverrides, setSortTypeOverrides] = useState<Record<string, SortType>>({});
  const [groupByColumn, setGroupByColumn] = useState<string | null>(null);

  // Apply cumulative filters to the original data
  const filtered = useMemo(() => {
    // If no preview data, return empty structure
    if (!preview) {
      return { columns: [], rows: [] };
    }
    
    // Always start with the preview data
    const copy = cloneDeep(preview);
    
    // Apply filters only if there are any active filters with values
    const hasActiveFilters = Object.values(filterValues).some(value => value.trim() !== '');
    
    if (hasActiveFilters) {
      copy.rows = copy.rows.filter((row) => {
        // Row must match ALL filters
        return Object.entries(filterValues).every(([column, value]) => {
          if (!value || value.trim() === '') return true; // Skip empty filters
          
          const cell = row.find((item) => item.identifier === column);
          if (!cell) return false;
          
          const searchValue = value.toLowerCase();
          
          if (typeof cell.display_value === 'number') {
            return cell.display_value
              .toString()
              .toLowerCase()
              .includes(searchValue);
          }
          
          if (typeof cell.display_value === 'string') {
            return cell.display_value.toLowerCase().includes(searchValue);
          }
          
          if (typeof cell.display_value === 'object' && cell.display_value?.props?.children) {
            const childContent = typeof cell.display_value.props.children === 'string' 
              ? cell.display_value.props.children
              : String(cell.display_value.props.children || '');
            return childContent.toLowerCase().includes(searchValue);
          }
          
          return false;
        });
      });
    }
    
    // Apply sorting after filtering
    if (sortConfigs.length > 0) {
      copy.rows = sortRows(copy.rows, sortConfigs);
    }
    
    return copy;
  }, [preview, filterValues, sortConfigs]); // Dependencies ensure re-computation when any change
  
  // Early return AFTER all hooks have been called
  if (!preview) {
    return null;
  }
  
  const filter = (column: string, value: string) => {
    setFilterValues(prev => ({
      ...prev,
      [column]: value
    }));
  };

  const handleSort = (column: string, shiftKey: boolean = false) => {
    let newConfigs: SortConfig[];
    
    const existingConfig = sortConfigs.find(config => config.column === column);
    const direction = existingConfig?.direction === 'asc' ? 'desc' : 'asc';
    
    // Detect sort type based on first non-empty value
    const dataToSort = filtered;
    const firstRow = dataToSort.rows.find(row => {
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
  };

  const removeSortColumn = (column: string) => {
    const newConfigs = sortConfigs.filter(config => config.column !== column);
    setSortConfigs(newConfigs);
  };

  const clearAllSorts = () => {
    setSortConfigs([]);
  };

  // Use filtered data if any filters are applied, otherwise use preview
  const data = filtered;

  const downloadCsv = () => {
    if (!data || !data.rows || data.rows.length === 0) {
      return;
    }
    
    const rows = [
      preview.columns.map((column) => column.display_value).join(','),
    ];

    const dataToExport = data.rows;

    dataToExport.map((row) => {
      rows.push(
        row
          .map((cell) => {
            const displayStr = String(cell.display_value || '');
            if (displayStr === 'true') {
              return 'Yes';
            }

            if (displayStr === 'false') {
              return 'No';
            }

            return `"${displayStr || ""}"`; 
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
    
    const groups = groupRows(data.rows, groupByColumn);
    const elements: JSX.Element[] = [];
    
    groups.forEach((rows, groupName) => {
      elements.push(
        <Tr key={`group-${groupName}`} style={{ backgroundColor: colors.$5 }}>
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
    return data.rows.map((row, i) => (
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
    <div id="preview-table" className="my-4">
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
                  value={filterValues[column.identifier] || ''}
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
