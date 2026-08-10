/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Block } from '../types';

/**
 * Per-block annotations the API needs to position a block within its
 * flex-row when building the rendered HTML. Derived from `gridPosition`
 * at save time — never stored on the in-memory builder state, so a user
 * who drags a block to a new column always saves a fresh value.
 */
export interface RowLayout {
  /**
   * Where the block sits in its row. Drives margin-auto on the API's
   * flex-col wrapper:
   *   left   → default packing (or margin-right: auto)
   *   center → margin-left: auto; margin-right: auto;
   *   right  → margin-left: auto;
   */
  rowAlign: 'left' | 'center' | 'right';
  /** Percentage of the page width the block should occupy. */
  rowWidth: string;
  /** First column the block occupies (1-indexed, matches CSS grid-column). */
  colStart: number;
  /** Number of columns the block spans. */
  colSpan: number;
}

const TOTAL_COLS = 12;

function widthForCols(w: number): string {
  // 4 → "33.333333%"; mirrors what the API was already emitting.
  return `${((w / TOTAL_COLS) * 100).toFixed(6)}%`;
}

function deriveRowAlign(
  block: Block,
  blocksInRow: Block[]
): 'left' | 'center' | 'right' {
  const { x, w } = block.gridPosition;

  // Block fills the row → alignment is moot, treat as left.
  if (w >= TOTAL_COLS) return 'left';

  // Block hugs the left edge of the grid.
  if (x === 0) return 'left';

  // Block hugs the right edge of the grid.
  if (x + w === TOTAL_COLS) return 'right';

  // For a single block sitting somewhere mid-row, "center" is the closest
  // approximation flex margins can express. If the row contains multiple
  // blocks and this one is sandwiched between them, also fall through to
  // center — the API will place it after its left siblings.
  void blocksInRow;
  return 'center';
}

/**
 * Walk all blocks, group by row (y-coordinate), and annotate each block
 * with the row-layout fields the API consumes when building HTML.
 *
 * Annotations are non-destructive: the original `block.properties` and
 * `gridPosition` are unchanged. Existing fields on the block are
 * preserved; the four `rowAlign` / `rowWidth` / `colStart` / `colSpan`
 * keys are added (or overwritten if previously set).
 */
export function annotateBlocksWithRowLayout<T extends Block>(
  blocks: T[]
): (T & RowLayout)[] {
  const rowMap = new Map<number, T[]>();

  for (const block of blocks) {
    const y = block.gridPosition.y;
    const list = rowMap.get(y);
    if (list) {
      list.push(block);
    } else {
      rowMap.set(y, [block]);
    }
  }

  return blocks.map((block) => {
    const blocksInRow = rowMap.get(block.gridPosition.y) ?? [block];
    const { x, w } = block.gridPosition;

    return {
      ...block,
      rowAlign: deriveRowAlign(block, blocksInRow),
      rowWidth: widthForCols(w),
      colStart: x + 1, // 1-indexed for CSS grid-column compatibility
      colSpan: w,
    };
  });
}
