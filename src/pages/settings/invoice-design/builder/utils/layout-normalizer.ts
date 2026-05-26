/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import type { Layout } from 'react-grid-layout';

function overlaps(a: Layout, b: Layout): boolean {
  return (
    a.i !== b.i &&
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

/**
 * Resolve resize-created overlaps by moving later blocks down.
 *
 * Unlike grid compaction, this intentionally does not pull items upward. The
 * designer should preserve whitespace while making room for the resized block.
 */
export function pushLayoutCollisionsDown(layout: Layout[]): Layout[] {
  const sorted = layout
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      if (a.item.y !== b.item.y) return a.item.y - b.item.y;
      if (a.item.x !== b.item.x) return a.item.x - b.item.x;
      return a.index - b.index;
    });

  const settled: Layout[] = [];
  const resolved = new Map<string, Layout>();

  for (const { item } of sorted) {
    const next = { ...item };
    let moved = true;

    while (moved) {
      moved = false;

      for (const other of settled) {
        if (overlaps(next, other)) {
          next.y = other.y + other.h;
          moved = true;
        }
      }
    }

    settled.push(next);
    resolved.set(next.i, next);
  }

  return layout.map((item) => resolved.get(item.i) || item);
}
