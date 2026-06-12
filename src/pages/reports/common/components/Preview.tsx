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
import { MemoizedTr, Table, Tbody, Thead, Tr } from '$app/components/tables';
import { Tooltip } from '$app/components/Tooltip';
import { currentWidthAtom } from '$app/common/hooks/useResizeColumn';
import { atom, getDefaultStore, useAtom, useSetAtom } from 'jotai';
import { cloneDeep } from 'lodash';
import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  compareValues,
  detectSortType,
  extractDisplayValue,
} from '../utils/sortingUtils';
import {
  ResolvedCellSizing,
  resolveCellSizing,
} from '../constants/column-widths';

export const previewAtom = atom<Preview | null>(null);

const RESIZE_KEY_PREFIX = 'report-preview.';
const RESIZE_HANDLE_THRESHOLD = 15;
const RESIZE_MIN_WIDTH = 40;

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

export function useColumnSizingMap(
  preview: Preview | null
): Map<string, ResolvedCellSizing> {
  return useMemo(() => {
    if (!preview) {
      return new Map();
    }

    return new Map(
      preview.columns.map((column) => [
        column.identifier,
        resolveCellSizing(column.identifier, column.display_value),
      ])
    );
  }, [preview]);
}

export function resizeKey(identifier: string) {
  return `${RESIZE_KEY_PREFIX}${identifier}`;
}

export function useResizeOverrideLifecycle(
  columnSizing: Map<string, ResolvedCellSizing>
) {
  const setWidths = useSetAtom(currentWidthAtom);

  useLayoutEffect(() => {
    if (columnSizing.size === 0) {
      return;
    }

    setWidths((prev) => {
      const next = { ...prev };
      let mutated = false;

      columnSizing.forEach((sizing, identifier) => {
        const key = resizeKey(identifier);
        const existing = prev[key];

        if (typeof existing === 'number' && existing > 0) {
          return;
        }

        next[key] = Math.max(sizing.width, sizing.minWidth);
        mutated = true;
      });

      return mutated ? next : prev;
    });
  }, [columnSizing, setWidths]);

  useEffect(() => {
    return () => {
      setWidths((prev) => {
        const next: Record<string, number> = {};
        let mutated = false;

        for (const key of Object.keys(prev)) {
          if (key.startsWith(RESIZE_KEY_PREFIX)) {
            mutated = true;
            continue;
          }

          next[key] = prev[key];
        }

        return mutated ? next : prev;
      });
    };
  }, [setWidths]);
}

type GetColElement = (identifier: string) => HTMLTableColElement | null;

const ColumnGroupContext = React.createContext<GetColElement | null>(null);

interface ColumnGroupProps {
  columns: Column[];
  children?: React.ReactNode;
}

export function ColumnGroup({ columns, children }: ColumnGroupProps) {
  const colRefs = useRef<Record<string, HTMLTableColElement | null>>({});

  const getColEl = useMemo<GetColElement>(
    () => (identifier) => colRefs.current[identifier] ?? null,
    []
  );

  useLayoutEffect(() => {
    const store = getDefaultStore();

    const applyWidths = (widths: Record<string, number>) => {
      columns.forEach((column) => {
        const w = widths[resizeKey(column.identifier)];
        const el = colRefs.current[column.identifier];

        if (!el) return;

        if (typeof w === 'number' && w > 0) {
          el.style.width = `${w}px`;
          el.style.minWidth = `${w}px`;
        } else {
          el.style.width = '';
          el.style.minWidth = '';
        }
      });
    };

    applyWidths(store.get(currentWidthAtom));

    const unsubscribe = store.sub(currentWidthAtom, () => {
      applyWidths(store.get(currentWidthAtom));
    });

    return unsubscribe;
  }, [columns]);

  return (
    <ColumnGroupContext.Provider value={getColEl}>
      <colgroup>
        {columns.map((column) => (
          <col
            key={column.identifier}
            ref={(el) => {
              colRefs.current[column.identifier] = el;
            }}
          />
        ))}
      </colgroup>
      {children}
    </ColumnGroupContext.Provider>
  );
}

interface PreviewTdProps {
  children?: React.ReactNode;
}

export const PreviewTd = memo(function PreviewTd({ children }: PreviewTdProps) {
  return (
    <td className="text-sm px-2 lg:px-2.5 xl:px-4 py-2 overflow-hidden whitespace-nowrap text-ellipsis">
      {children}
    </td>
  );
});

interface PreviewCellProps {
  cell: Cell;
  sizing: ResolvedCellSizing | undefined;
}

export const PreviewCell = memo(function PreviewCell({
  cell,
  sizing,
}: PreviewCellProps) {
  if (
    sizing?.truncate &&
    typeof cell.display_value === 'string' &&
    cell.display_value.trim().length > 0
  ) {
    return (
      <PreviewTd>
        <Tooltip
          message={cell.display_value}
          size="regular"
          placement="top"
          truncate
        >
          <span>{cell.display_value}</span>
        </Tooltip>
      </PreviewTd>
    );
  }

  return <PreviewTd>{cell.display_value}</PreviewTd>;
});

interface PreviewThProps {
  identifier: string;
  isCurrentlyUsed?: boolean;
  onSortClick?: () => void;
  children: React.ReactNode;
}

export const PreviewTh = memo(function PreviewTh({
  identifier,
  isCurrentlyUsed,
  onSortClick,
  children,
}: PreviewThProps) {
  const colors = useColorScheme();
  const getColEl = React.useContext(ColumnGroupContext);
  const thRef = useRef<HTMLTableCellElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const suppressNextClickRef = useRef(false);

  const dragRef = useRef<{
    startX: number;
    startWidth: number;
    rafId: number | null;
    latestWidth: number;
    moved: boolean;
  } | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0 || !thRef.current) return;

      const rect = thRef.current.getBoundingClientRect();
      const clickPosition = e.clientX - rect.left;
      const inResizeZone = clickPosition > rect.width - RESIZE_HANDLE_THRESHOLD;

      if (!inResizeZone) return;

      e.preventDefault();
      e.stopPropagation();

      const colEl = getColEl?.(identifier);
      const startWidth = colEl?.offsetWidth ?? rect.width;

      dragRef.current = {
        startX: e.clientX,
        startWidth,
        rafId: null,
        latestWidth: startWidth,
        moved: false,
      };

      setIsResizing(true);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      const onMove = (event: MouseEvent) => {
        const drag = dragRef.current;
        if (!drag) return;

        const dx = event.clientX - drag.startX;
        const next = Math.max(RESIZE_MIN_WIDTH, drag.startWidth + dx);
        drag.latestWidth = next;
        drag.moved = true;

        if (drag.rafId !== null) return;

        drag.rafId = requestAnimationFrame(() => {
          if (!dragRef.current) return;
          dragRef.current.rafId = null;

          const el = getColEl?.(identifier);
          if (el) {
            el.style.width = `${dragRef.current.latestWidth}px`;
            el.style.minWidth = `${dragRef.current.latestWidth}px`;
          }
        });
      };

      const onUp = () => {
        const drag = dragRef.current;
        if (drag?.rafId !== null && drag?.rafId !== undefined) {
          cancelAnimationFrame(drag.rafId);
        }

        const finalWidth = drag?.latestWidth ?? startWidth;
        const didMove = drag?.moved ?? false;
        dragRef.current = null;

        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);

        if (didMove) {
          const store = getDefaultStore();
          store.set(currentWidthAtom, {
            ...store.get(currentWidthAtom),
            [resizeKey(identifier)]: finalWidth,
          });
          suppressNextClickRef.current = true;
        }

        setIsResizing(false);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [getColEl, identifier]
  );

  const handleClick = useCallback(() => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      return;
    }
    onSortClick?.();
  }, [onSortClick]);

  return (
    <th
      ref={thRef}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className="relative text-left font-normal tracking-wider whitespace-nowrap text-sm px-2 lg:px-2.5 xl:px-4 py-2.5 select-none overflow-hidden text-ellipsis cursor-pointer"
      style={{
        color: isCurrentlyUsed ? colors.$3 : colors.$17,
        borderColor: colors.$20,
        borderBottom: `1px solid ${colors.$20}`,
        borderRight: `1px solid ${colors.$20}`,
      }}
    >
      {children}
      <span
        className="absolute inset-y-0 cursor-col-resize"
        style={{
          right: -1,
          width: 3,
          backgroundColor: isResizing ? colors.$3 : 'transparent',
          transition: 'background-color 120ms ease',
        }}
        onMouseEnter={(e) => {
          if (!isResizing) {
            e.currentTarget.style.backgroundColor = colors.$3;
          }
        }}
        onMouseLeave={(e) => {
          if (!isResizing) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      />
    </th>
  );
});

export function Preview() {
  const [t] = useTranslation();

  const preview = usePreview();
  const colors = useColorScheme();

  const [sorts, setSorts] = useState<Record<string, string>>();
  const [filtered, setFiltered] = useState<Preview | null>(null);

  const columnSizing = useColumnSizingMap(preview);
  useResizeOverrideLifecycle(columnSizing);

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

    const exported = filtered ? filtered.rows : preview.rows;

    exported.map((row) => {
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

  return (
    <div id="preview-table" className="my-4">
      <div className="flex justify-end">
        <Button behavior="button" onClick={downloadCsv}>
          {t('download')} {t('csv_file')}
        </Button>
      </div>

      <Table resizable="report-preview">
        <ColumnGroup columns={preview.columns}>
          <Thead>
            {preview.columns.map((column, i) => (
              <PreviewTh
                key={i}
                identifier={column.identifier}
                isCurrentlyUsed={Boolean(sorts?.[column.identifier])}
                onSortClick={() => sort(column.identifier)}
              >
                {column.display_value}
              </PreviewTh>
            ))}
          </Thead>

          <Tbody>
            <Tr className="border-b" style={{ borderColor: colors.$20 }}>
              {preview.columns.map((column, i) => (
                <PreviewTd key={i}>
                  <InputField
                    onValueChange={(value) =>
                      filter(column.identifier, value)
                    }
                    changeOverride
                  />
                </PreviewTd>
              ))}
            </Tr>

            {data.map((row, i) => (
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
            ))}
          </Tbody>
        </ColumnGroup>
      </Table>
    </div>
  );
}
