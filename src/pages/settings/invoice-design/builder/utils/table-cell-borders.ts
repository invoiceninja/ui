/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import type { CSSProperties } from 'react';

export const TABLE_BORDER_WIDTH_MIN = 0;
export const TABLE_BORDER_WIDTH_MAX = 20;
export const TABLE_BORDER_WIDTH_STEP = 0.5;
export const TABLE_BORDER_WIDTH_DEFAULT = 1;

export interface TableBorderSidesInput {
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
}

export interface TableRegionBordersInput {
  color?: string;
  /** 0–20 pixels in 0.5px increments; strings like `"0.5px"` are accepted. */
  width?: number | string;
  sides?: TableBorderSidesInput;
}

export interface ResolvedTableRegionBorders {
  color: string;
  /** Clamped pixel width for CSS borders. */
  widthPx: number;
  sides: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
}

export interface ResolvedTableBorders {
  header: ResolvedTableRegionBorders;
  row: ResolvedTableRegionBorders;
}

const DEFAULT_BORDER_COLOR = '#E5E7EB';

function clampWidthPx(n: number): number {
  if (!Number.isFinite(n)) {
    return TABLE_BORDER_WIDTH_DEFAULT;
  }
  const snapped =
    Math.round(n / TABLE_BORDER_WIDTH_STEP) * TABLE_BORDER_WIDTH_STEP;

  return Math.max(
    TABLE_BORDER_WIDTH_MIN,
    Math.min(TABLE_BORDER_WIDTH_MAX, snapped)
  );
}

/** Normalize stored JSON to 0–20 px in half-pixel increments. */
export function coerceBorderWidthPx(raw: unknown): number {
  if (typeof raw === 'number') {
    return clampWidthPx(raw);
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    const bare = trimmed.replace(/px\s*$/i, '').trim();
    const parsed = Number.parseFloat(bare);
    if (Number.isFinite(parsed)) {
      return clampWidthPx(parsed);
    }
  }
  return TABLE_BORDER_WIDTH_DEFAULT;
}

/** Saved on new table / tasks-table blocks. */
export const DEFAULT_TABLE_REGION_BORDER_PROPS: TableRegionBordersInput = {
  color: DEFAULT_BORDER_COLOR,
  width: TABLE_BORDER_WIDTH_DEFAULT,
  sides: { top: true, right: true, bottom: true, left: true },
};

function resolveSides(
  input?: TableBorderSidesInput
): ResolvedTableRegionBorders['sides'] {
  return {
    top: input?.top !== false,
    right: input?.right !== false,
    bottom: input?.bottom !== false,
    left: input?.left !== false,
  };
}

/** Defaults only for missing nested keys — tolerates legacy string widths. */
function resolveRegion(
  input?: TableRegionBordersInput | null,
  overrides?: Partial<ResolvedTableRegionBorders>
): ResolvedTableRegionBorders {
  const color = overrides?.color ?? input?.color ?? DEFAULT_BORDER_COLOR;
  const widthPx =
    overrides?.widthPx ??
    coerceBorderWidthPx(
      input?.width !== undefined
        ? input.width
        : DEFAULT_TABLE_REGION_BORDER_PROPS.width
    );
  const resolvedSides = overrides?.sides ?? resolveSides(input?.sides);
  return { color, widthPx, sides: resolvedSides };
}

/** Read raw block properties JSON for table / tasks-table borders. */
export function resolveTableBorderProps(properties: {
  headerBorders?: TableRegionBordersInput;
  rowBorders?: TableRegionBordersInput;
}): ResolvedTableBorders {
  return {
    header: resolveRegion(properties.headerBorders),
    row: resolveRegion(properties.rowBorders),
  };
}

function borderLine(
  enabled: boolean,
  region: ResolvedTableRegionBorders
): string {
  if (!enabled) {
    return 'none';
  }
  return `${region.widthPx}px solid ${region.color}`;
}

type TableCellBorderStyles = Pick<
  CSSProperties,
  'borderTop' | 'borderRight' | 'borderBottom' | 'borderLeft' | 'boxShadow'
>;

function noBorderStyles(): TableCellBorderStyles {
  return {
    borderTop: 'none',
    borderRight: 'none',
    borderBottom: 'none',
    borderLeft: 'none',
    boxShadow: 'none',
  };
}

/**
 * Chromium snaps native CSS borders to whole CSS pixels before PDF layout.
 * Inset shadows retain fractional geometry, so use them for true hairlines.
 */
function hairlineBorderStyles(
  region: ResolvedTableRegionBorders,
  sides: ResolvedTableRegionBorders['sides']
): TableCellBorderStyles {
  const styles = noBorderStyles();

  if (region.widthPx <= 0) {
    return styles;
  }

  const width = `${region.widthPx}px`;
  const shadows: string[] = [];

  if (sides.top) {
    shadows.push(`inset 0 ${width} 0 0 ${region.color}`);
  }
  if (sides.right) {
    shadows.push(`inset -${width} 0 0 0 ${region.color}`);
  }
  if (sides.bottom) {
    shadows.push(`inset 0 -${width} 0 0 ${region.color}`);
  }
  if (sides.left) {
    shadows.push(`inset ${width} 0 0 0 ${region.color}`);
  }

  styles.boxShadow = shadows.length > 0 ? shadows.join(', ') : 'none';

  return styles;
}

function ownedColumnSides(
  sides: ResolvedTableRegionBorders['sides'],
  colIndex: number,
  numCols: number
): Pick<ResolvedTableRegionBorders['sides'], 'left' | 'right'> {
  const isFirstColumn = colIndex === 0;
  const isLastColumn = colIndex === Math.max(0, numCols - 1);

  return {
    left: isFirstColumn && sides.left,
    // A single cell owns each internal seam. Either adjacent-side toggle can
    // enable it, matching collapsed-border behavior without doubling width.
    right: isLastColumn ? sides.right : sides.right || sides.left,
  };
}

/** Border styles for a header cell (`th`). */
export function tableHeaderCellBorderStyles(
  resolved: ResolvedTableBorders,
  colIndex: number,
  numCols: number
): TableCellBorderStyles {
  const h = resolved.header;
  const { sides } = h;

  if (h.widthPx < 1) {
    const columnSides = ownedColumnSides(sides, colIndex, numCols);

    return hairlineBorderStyles(h, {
      top: sides.top,
      right: columnSides.right,
      bottom: sides.bottom,
      left: columnSides.left,
    });
  }

  return {
    borderTop: borderLine(sides.top, h),
    borderRight: borderLine(sides.right, h),
    borderBottom: borderLine(sides.bottom, h),
    borderLeft: borderLine(sides.left, h),
    boxShadow: 'none',
  };
}

/** Border styles for a body cell (`td`). Seam under header follows OR rule strictly on header.bottom vs row.top. */
export function tableBodyCellBorderStyles(
  resolved: ResolvedTableBorders,
  bodyRowIndex: number,
  colIndex: number,
  numCols: number
): TableCellBorderStyles {
  const r = resolved.row;
  const { sides } = r;
  const hb = resolved.header.sides.bottom;
  const seamFromHeader = hb;
  const showFirstRowTop = bodyRowIndex === 0 && sides.top && !seamFromHeader;

  const topSide = bodyRowIndex === 0 ? showFirstRowTop : sides.top;

  if (r.widthPx < 1) {
    const columnSides = ownedColumnSides(sides, colIndex, numCols);
    const ownedTopSide =
      bodyRowIndex === 0 ? showFirstRowTop : sides.top && !sides.bottom;

    return hairlineBorderStyles(r, {
      top: ownedTopSide,
      right: columnSides.right,
      bottom: sides.bottom,
      left: columnSides.left,
    });
  }

  return {
    borderTop: borderLine(topSide, r),
    borderRight: borderLine(sides.right, r),
    borderBottom: borderLine(sides.bottom, r),
    borderLeft: borderLine(sides.left, r),
    boxShadow: 'none',
  };
}

function cellBorderCssFragments(styles: TableCellBorderStyles): string {
  return `border-top:${styles.borderTop};border-right:${styles.borderRight};border-bottom:${styles.borderBottom};border-left:${styles.borderLeft};box-shadow:${styles.boxShadow};`;
}

/** Inline CSS border-* fragments for HTML generator (`style` attribute fragments). */
export function tableHeaderCellBorderCssFragments(
  resolved: ResolvedTableBorders,
  colIndex: number,
  numCols: number
): string {
  return cellBorderCssFragments(
    tableHeaderCellBorderStyles(resolved, colIndex, numCols)
  );
}

export function tableBodyCellBorderCssFragments(
  resolved: ResolvedTableBorders,
  bodyRowIndex: number,
  colIndex: number,
  numCols: number
): string {
  return cellBorderCssFragments(
    tableBodyCellBorderStyles(resolved, bodyRowIndex, colIndex, numCols)
  );
}
