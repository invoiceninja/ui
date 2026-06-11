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
import { Tooltip } from '$app/components/Tooltip';
import { atom, useAtom } from 'jotai';
import { cloneDeep } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  compareValues,
  detectSortType,
  extractDisplayValue,
} from '../utils/sortingUtils';
import { resolveCellWidth } from '../constants/column-widths';

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

    const hasReplacements = preview.columns.some((column) =>
      replacements.some((r) => r.identifier === column.identifier)
    );

    if (!hasReplacements) {
      setProcessed(preview);
      return;
    }

    const replacementByIdentifier = new Map(
      replacements.map((replacement) => [replacement.identifier, replacement])
    );

    setProcessed({
      columns: preview.columns,
      rows: preview.rows.map((row) =>
        row.map((cell) => {
          const replacement = replacementByIdentifier.get(cell.identifier);

          return replacement
            ? { ...cell, display_value: replacement.format(cell) }
            : cell;
        })
      ),
    });
  }, [preview]);

  return processed;
}

export function Preview() {
  const [t] = useTranslation();

  const preview = usePreview();
  const colors = useColorScheme();

  const [sorts, setSorts] = useState<Record<string, string>>();
  const [filtered, setFiltered] = useState<Preview | null>(null);

  const columnWidths = useMemo(() => {
    if (!preview) {
      return new Map<string, ReturnType<typeof resolveCellWidth>>();
    }

    return new Map(
      preview.columns.map((column) => [
        column.identifier,
        resolveCellWidth(column.identifier, column.display_value),
      ])
    );
  }, [preview]);

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

  const sort = (column: string) => {
    const direction = sorts?.[column] === 'asc' ? 'desc' : 'asc';

    setSorts((current) => ({ ...current, [column]: direction }));

    const copy = cloneDeep(preview);

    // Detect the sort type from the first non-empty cell in this column
    const sampleCell = copy.rows
      .map((row) => row.find((cell) => cell.identifier === column))
      .find(
        (cell) =>
          cell && cell.display_value !== '' && cell.display_value !== null
      );

    const sortType = sampleCell
      ? detectSortType(column, extractDisplayValue(sampleCell))
      : 'case-insensitive';

    copy.rows = copy.rows.sort((first, second) => {
      const cellA = first.find((cell) => cell.identifier === column);
      const cellB = second.find((cell) => cell.identifier === column);

      if (cellA && cellB) {
        const valueA = extractDisplayValue(cellA);
        const valueB = extractDisplayValue(cellB);

        return compareValues(valueA, valueB, sortType, direction);
      }

      return 0;
    });

    setFiltered(copy);
  };

  const data = filtered?.rows || preview.rows;

  const downloadCsv = () => {
    const rows = [
      preview.columns.map((column) => column.display_value).join(','),
    ];

    const data = filtered ? filtered.rows : preview.rows;

    data.map((row) => {
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
    link.setAttribute('download', 'example.csv');

    link.click();
  };

  if (preview) {
    return (
      <div id="preview-table" className="my-4">
        <div className="flex justify-end">
          <Button behavior="button" onClick={downloadCsv}>
            {t('download')} {t('csv_file')}
          </Button>
        </div>

        <Table>
          <Thead>
            {preview.columns.map((column, i) => {
              const sizing = columnWidths.get(column.identifier);

              return (
                <Th
                  key={i}
                  style={{
                    borderBottom: `1px solid ${colors.$20}`,
                    width: sizing?.width,
                    minWidth: sizing?.minWidth,
                  }}
                  isCurrentlyUsed={Boolean(sorts?.[column.identifier])}
                  onColumnClick={() => sort(column.identifier)}
                >
                  {column.display_value}
                </Th>
              );
            })}
          </Thead>

          <Tbody>
            <Tr
              className="border-b"
              style={{
                borderColor: colors.$20,
              }}
            >
              {preview.columns.map((column, i) => {
                const sizing = columnWidths.get(column.identifier);

                return (
                  <Td
                    key={i}
                    style={{
                      width: sizing?.width,
                      minWidth: sizing?.minWidth,
                    }}
                  >
                    <InputField
                      onValueChange={(value) =>
                        filter(column.identifier, value)
                      }
                      changeOverride
                    />
                  </Td>
                );
              })}
            </Tr>

            {data.map((row, i) => (
              <Tr
                key={i}
                className="border-b"
                style={{
                  borderColor: colors.$20,
                }}
              >
                {row.map((cell, j) => (
                  <PreviewCell
                    key={j}
                    cell={cell}
                    sizing={columnWidths.get(cell.identifier)}
                  />
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    );
  }

  return null;
}

interface PreviewCellProps {
  cell: Cell;
  sizing: ReturnType<typeof resolveCellWidth> | undefined;
}

export function PreviewCell({ cell, sizing }: PreviewCellProps) {
  const tdStyle = sizing
    ? { width: sizing.width, minWidth: sizing.minWidth }
    : undefined;

  const value = cell.display_value;
  const tooltipText = typeof value === 'string' ? value : null;
  const shouldTruncate =
    sizing?.truncate &&
    tooltipText !== null &&
    tooltipText.trim().length > 0;

  if (shouldTruncate) {
    return (
      <Td style={tdStyle}>
        <div style={{ maxWidth: sizing!.width }}>
          <Tooltip
            message={tooltipText}
            size="regular"
            placement="top"
            truncate
          >
            <span>{value}</span>
          </Tooltip>
        </div>
      </Td>
    );
  }

  return <Td style={tdStyle}>{value}</Td>;
}
