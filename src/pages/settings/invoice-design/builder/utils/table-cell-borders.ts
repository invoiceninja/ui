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

export interface TableBorderSidesInput {
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
}

export interface TableRegionBordersInput {
  color?: string;
  /** Integer 0–20 (pixels); strings like `"2px"` or `"3"` are accepted when resolving. */
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
  showBorders: boolean;
  header: ResolvedTableRegionBorders;
  row: ResolvedTableRegionBorders;
}

const DEFAULT_BORDER_COLOR = '#E5E7EB';

function clampWidthPx(n: number): number {
  if (!Number.isFinite(n)) {
    return 1;
  }
  return Math.max(
    TABLE_BORDER_WIDTH_MIN,
    Math.min(TABLE_BORDER_WIDTH_MAX, Math.round(n))
  );
}

/** Normalize stored JSON to 0–20 px (integers only in normal operation). */
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
  return 1;
}

/** Saved on new table / tasks-table blocks alongside `showBorders`. */
export const DEFAULT_TABLE_REGION_BORDER_PROPS: TableRegionBordersInput = {
  color: DEFAULT_BORDER_COLOR,
  width: 1,
  sides: { top: true, right: true, bottom: true, left: true },
};

function resolveSides(input?: TableBorderSidesInput): ResolvedTableRegionBorders['sides'] {
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
  const color =
    overrides?.color ?? input?.color ?? DEFAULT_BORDER_COLOR;
  const widthPx =
    overrides?.widthPx ??
    coerceBorderWidthPx(
      input?.width !== undefined ? input.width : DEFAULT_TABLE_REGION_BORDER_PROPS.width
    );
  const resolvedSides =
    overrides?.sides ?? resolveSides(input?.sides);
  return { color, widthPx, sides: resolvedSides };
}

/** Read raw block properties JSON for table / tasks-table borders. */
export function resolveTableBorderProps(properties: {
  showBorders?: boolean;
  headerBorders?: TableRegionBordersInput;
  rowBorders?: TableRegionBordersInput;
}): ResolvedTableBorders {
  const showBorders = properties.showBorders === true;
  return {
    showBorders,
    header: resolveRegion(properties.headerBorders),
    row: resolveRegion(properties.rowBorders),
  };
}

function borderLine(enabled: boolean, region: ResolvedTableRegionBorders): string {
  if (!enabled) {
    return 'none';
  }
  return `${region.widthPx}px solid ${region.color}`;
}

/** Border styles for a header cell (`th`). */
export function tableHeaderCellBorderStyles(
  resolved: ResolvedTableBorders,
  _colIndex: number,
  _numCols: number
): Pick<
  CSSProperties,
  'borderTop' | 'borderRight' | 'borderBottom' | 'borderLeft'
> {
  if (!resolved.showBorders) {
    return {
      borderTop: 'none',
      borderRight: 'none',
      borderBottom: 'none',
      borderLeft: 'none',
    };
  }
  const h = resolved.header;
  const { sides } = h;
  return {
    borderTop: borderLine(sides.top, h),
    borderRight: borderLine(sides.right, h),
    borderBottom: borderLine(sides.bottom, h),
    borderLeft: borderLine(sides.left, h),
  };
}

/** Border styles for a body cell (`td`). Seam under header follows OR rule strictly on header.bottom vs row.top. */
export function tableBodyCellBorderStyles(
  resolved: ResolvedTableBorders,
  bodyRowIndex: number,
  _colIndex: number,
  _numCols: number
): Pick<
  CSSProperties,
  'borderTop' | 'borderRight' | 'borderBottom' | 'borderLeft'
> {
  if (!resolved.showBorders) {
    return {
      borderTop: 'none',
      borderRight: 'none',
      borderBottom: 'none',
      borderLeft: 'none',
    };
  }
  const r = resolved.row;
  const { sides } = r;
  const hb = resolved.header.sides.bottom;
  const seamFromHeader = hb;
  const showFirstRowTop = bodyRowIndex === 0 && sides.top && !seamFromHeader;

  const topSide =
    bodyRowIndex === 0 ? showFirstRowTop : sides.top;

  return {
    borderTop: borderLine(topSide, r),
    borderRight: borderLine(sides.right, r),
    borderBottom: borderLine(sides.bottom, r),
    borderLeft: borderLine(sides.left, r),
  };
}

/** Inline CSS border-* fragments for HTML generator (`style` attribute fragments). */
export function tableHeaderCellBorderCssFragments(
  resolved: ResolvedTableBorders
): string {
  const b = tableHeaderCellBorderStyles(resolved, 0, 1);
  return `border-top:${b.borderTop};border-right:${b.borderRight};border-bottom:${b.borderBottom};border-left:${b.borderLeft};`;
}

export function tableBodyCellBorderCssFragments(
  resolved: ResolvedTableBorders,
  bodyRowIndex: number,
  numCols: number
): string {
  const b = tableBodyCellBorderStyles(
    resolved,
    bodyRowIndex,
    0,
    numCols
  );
  return `border-top:${b.borderTop};border-right:${b.borderRight};border-bottom:${b.borderBottom};border-left:${b.borderLeft};`;
}
