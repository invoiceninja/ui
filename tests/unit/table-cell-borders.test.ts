import { describe, expect, it } from 'vitest';
import {
  coerceBorderWidthPx,
  resolveTableBorderProps,
  tableHeaderCellBorderStyles,
} from '../../src/pages/settings/invoice-design/builder/utils/table-cell-borders';

describe('table cell borders', () => {
  it('preserves half-pixel border widths', () => {
    expect(coerceBorderWidthPx(0.5)).toBe(0.5);
    expect(coerceBorderWidthPx('1.5px')).toBe(1.5);
  });

  it('uses the default border width when no width has been saved', () => {
    const resolved = resolveTableBorderProps({});

    expect(resolved.header.widthPx).toBe(1);
    expect(resolved.row.widthPx).toBe(1);
  });

  it('snaps arbitrary values to the nearest half pixel', () => {
    expect(coerceBorderWidthPx(0.74)).toBe(0.5);
    expect(coerceBorderWidthPx(0.76)).toBe(1);
  });

  it('emits hairline inset shadows for sub-pixel widths', () => {
    const resolved = resolveTableBorderProps({
      headerBorders: { width: 0.5 },
    });

    expect(tableHeaderCellBorderStyles(resolved, 0, 1).boxShadow).toContain(
      'inset'
    );
  });
});
