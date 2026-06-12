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
import { MemoizedTr, Table, Tbody, Td, Thead, Tr } from '$app/components/tables';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  sortRows,
  SortConfig,
  SortType,
  detectSortType,
  groupRows,
  parseNumericValue,
  extractDisplayValue,
} from '../utils/sortingUtils';
import { isSummableColumn } from '../constants/columns';
import { useNumericFormatter } from '$app/common/hooks/useNumericFormatter';
import {
  ColumnGroup,
  PreviewCell,
  PreviewTd,
  PreviewTh,
  useColumnSizingMap,
  usePreview,
  useResizeOverrideLifecycle,
} from './Preview';

interface EnhancedPreviewProps {
  enableMultiSort?: boolean;
  enableNaturalSort?: boolean;
  enableGrouping?: boolean;
}

export function EnhancedPreview({
  enableMultiSort = true,
  enableNaturalSort = true,
  enableGrouping = false,
}: EnhancedPreviewProps) {
  const [t] = useTranslation();

  const preview = usePreview();
  const colors = useColorScheme();
  const numericFormatter = useNumericFormatter();

  const [sortConfigs, setSortConfigs] = useState<SortConfig[]>([]);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortTypeOverrides] = useState<Record<string, SortType>>({});
  const [groupByColumn, setGroupByColumn] = useState<string | null>(null);

  const activeFilters = useMemo(
    () =>
      Object.entries(filterValues)
        .filter(([, value]) => value.trim() !== '')
        .map(([column, value]) => ({ column, search: value.toLowerCase() })),
    [filterValues]
  );

  const filtered = useMemo(() => {
    if (!preview) {
      return { columns: [], rows: [] };
    }

    let rows = preview.rows;

    if (activeFilters.length > 0) {
      rows = rows.filter((row) =>
        activeFilters.every(({ column, search }) => {
          const cell = row.find((item) => item.identifier === column);
          if (!cell) return false;

          const value = cell.display_value;

          if (typeof value === 'number') {
            return value.toString().toLowerCase().includes(search);
          }

          if (typeof value === 'string') {
            return value.toLowerCase().includes(search);
          }

          if (typeof value === 'object' && value?.props?.children) {
            const childContent =
              typeof value.props.children === 'string'
                ? value.props.children
                : String(value.props.children || '');
            return childContent.toLowerCase().includes(search);
          }

          return false;
        })
      );
    }

    if (sortConfigs.length > 0) {
      rows = sortRows(rows, sortConfigs);
    }

    return { columns: preview.columns, rows };
  }, [preview, activeFilters, sortConfigs]);

  const columnSizing = useColumnSizingMap(preview);
  useResizeOverrideLifecycle(columnSizing);

  const columnTotals = useMemo(() => {
    const summable = new Set<string>();
    const sums: Record<string, number> = {};

    if (!preview || filtered.columns.length === 0) {
      return { sums, summable };
    }

    preview.columns.forEach((column) => {
      if (isSummableColumn(column.identifier)) {
        summable.add(column.identifier);
        sums[column.identifier] = 0;
      }
    });

    if (summable.size === 0) {
      return { sums, summable };
    }

    filtered.rows.forEach((row) => {
      row.forEach((cell) => {
        if (!summable.has(cell.identifier)) {
          return;
        }

        const value = extractDisplayValue(cell);

        if (value === '' || value === null || value === undefined) {
          return;
        }

        sums[cell.identifier] += parseNumericValue(value);
      });
    });

    return { sums, summable };
  }, [preview, filtered]);

  if (!preview) {
    return null;
  }

  const filter = (column: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [column]: value }));
  };

  const handleSort = (column: string) => {
    let newConfigs: SortConfig[];

    const existingConfig = sortConfigs.find(
      (config) => config.column === column
    );
    const direction = existingConfig?.direction === 'asc' ? 'desc' : 'asc';

    const firstRow = filtered.rows.find((row) => {
      const cell = row.find((c) => c.identifier === column);
      return cell && cell.display_value !== '' && cell.display_value !== null;
    });

    const firstCell = firstRow?.find((c) => c.identifier === column);
    const detectedType = firstCell
      ? detectSortType(column, String(firstCell.display_value))
      : 'case-insensitive';
    const sortType = sortTypeOverrides[column] || detectedType;

    if (enableMultiSort) {
      if (existingConfig) {
        newConfigs = sortConfigs.map((config) =>
          config.column === column ? { ...config, direction, sortType } : config
        );
      } else {
        newConfigs = [...sortConfigs, { column, direction, sortType }];
      }
    } else {
      newConfigs = [{ column, direction, sortType }];
    }

    setSortConfigs(newConfigs);
  };

  const removeSortColumn = (column: string) => {
    setSortConfigs((prev) => prev.filter((config) => config.column !== column));
  };

  const clearAllSorts = () => {
    setSortConfigs([]);
  };

  const data = filtered;

  const downloadCsv = () => {
    if (!data || !data.rows || data.rows.length === 0) {
      return;
    }

    const rows = [
      preview.columns.map((column) => column.display_value).join(','),
    ];

    data.rows.map((row) => {
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
          
            return `"${displayStr || ''}"`;
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
          <MemoizedTr
            key={`${groupName}-${i}`}
            className="border-b"
            style={{ borderColor: colors.$20 }}
            memoValue={row}
          >
            {row.map((cell, j) => (
              <PreviewCell
                key={j}
                cell={cell}
                sizing={columnSizing.get(cell.identifier)}
              />
            ))}
          </MemoizedTr>
        );
      });
    });

    return elements;
  };

  const renderNormalData = () => {
    return data.rows.map((row, i) => (
      <MemoizedTr
        key={i}
        className="border-b"
        style={{ borderColor: colors.$20 }}
        memoValue={row}
      >
        {row.map((cell, j) => (
          <PreviewCell
            key={j}
            cell={cell}
            sizing={columnSizing.get(cell.identifier)}
          />
        ))}
      </MemoizedTr>
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
              {preview.columns.map((col) => (
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

      <Table resizable="report-preview">
        <ColumnGroup columns={preview.columns}>
          <Thead>
            {preview.columns.map((column, i) => {
              const sortConfig = sortConfigs.find(
                (config) => config.column === column.identifier
              );
              const sortIndex = sortConfig
                ? sortConfigs.indexOf(sortConfig) + 1
                : null;

              return (
                <PreviewTh
                  key={i}
                  identifier={column.identifier}
                  isCurrentlyUsed={!!sortConfig}
                  onSortClick={() => handleSort(column.identifier)}
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
                </PreviewTh>
              );
            })}
          </Thead>

          <Tbody>
            <Tr className="border-b" style={{ borderColor: colors.$20 }}>
              {preview.columns.map((column, i) => (
                <PreviewTd key={i}>
                  <InputField
                    value={filterValues[column.identifier] || ''}
                    onValueChange={(value) =>
                      filter(column.identifier, value)
                    }
                    changeOverride
                  />
                </PreviewTd>
              ))}
            </Tr>

            {columnTotals.summable.size > 0 && (
              <Tr
                className="border-b"
                style={{ borderColor: colors.$20, backgroundColor: colors.$2 }}
              >
                {preview.columns.map((column, i) => {
                  const isSummable = columnTotals.summable.has(
                    column.identifier
                  );

                  return (
                    <PreviewTd key={i}>
                      {isSummable ? (
                        <span className="font-semibold">
                          {numericFormatter(
                            columnTotals.sums[column.identifier].toString()
                          )}
                        </span>
                      ) : (
                        <span style={{ color: colors.$17 }}>—</span>
                      )}
                    </PreviewTd>
                  );
                })}
              </Tr>
            )}

            {enableGrouping && groupByColumn
              ? renderGroupedData()
              : renderNormalData()}
          </Tbody>
        </ColumnGroup>
      </Table>
    </div>
  );
}
