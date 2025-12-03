/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Layout } from 'react-grid-layout';

/**
 * Define row groups based on Y coordinates with tolerance
 */
export interface RowGroup {
  rowY: number;
  items: Layout[];
  maxHeight: number;
}

export function identifyRows(layout: Layout[], tolerance = 10): RowGroup[] {
  const rowGroups: Record<number, Layout[]> = {};

  // Group items by row Y position
  layout.forEach((item) => {
    // Skip static items and special containers
    if (item.static || item.i === '0' || item.i === '1') {
      return;
    }

    const existingRowKey = Object.keys(rowGroups)
      .map(Number)
      .find((y) => Math.abs(y - item.y) <= tolerance);

    if (existingRowKey !== undefined) {
      rowGroups[existingRowKey].push(item);
    } else {
      rowGroups[item.y] = [item];
    }
  });

  // Convert to RowGroup array with max height for each row
  return Object.entries(rowGroups).map(([y, items]) => {
    const maxHeight = Math.max(...items.map((i) => i.h));
    return {
      rowY: Number(y),
      items,
      maxHeight,
    };
  });
}

/**
 * Snap item to nearest row during drag, maintaining row heights
 */
export function snapToRow(
  item: Layout,
  rows: RowGroup[],
  tolerance = 30
): Layout {
  // Find closest row
  let closestRow: RowGroup | null = null;
  let minDistance = Infinity;

  rows.forEach((row) => {
    const distance = Math.abs(item.y - row.rowY);
    if (distance < minDistance && distance <= tolerance) {
      minDistance = distance;
      closestRow = row;
    }
  });

  // If within tolerance of a row, snap to that row's Y and adopt its height
  if (closestRow) {
    return {
      ...item,
      y: (closestRow as RowGroup).rowY,
      h: (closestRow as RowGroup).maxHeight,
    };
  }

  // Otherwise, keep the item where it is
  return item;
}

/**
 * Enforce row constraints during drag: items must snap to rows and adopt row heights
 */
export function enforceRowConstraints(layout: Layout[]): Layout[] {
  // Identify current rows
  const rows = identifyRows(layout);

  // For each item, snap to nearest row
  return layout.map((item) => {
    // Skip static items and special containers
    if (item.static || item.i === '0' || item.i === '1') {
      return item;
    }

    return snapToRow(item, rows);
  });
}

/**
 * Compact a layout vertically by moving items up to fill gaps
 */
export function compactLayout(layout: Layout[], preserveRowHeights = true): Layout[] {
  // Store original row information before compaction
  const rowHeightMap = new Map<string, number>();
  
  if (preserveRowHeights) {
    const rows = identifyRows(layout);
    rows.forEach((row) => {
      row.items.forEach((item) => {
        rowHeightMap.set(item.i, row.maxHeight);
      });
    });
  }

  const sortedLayout = [...layout].sort((a, b) => {
    if (a.y === b.y) return a.x - b.x;
    return a.y - b.y;
  });

  const compacted = sortedLayout.map((item) => {
    // Don't compact static items
    if (item.static) return item;

    // Find the lowest Y position this item can occupy
    let newY = 0;
    let hasCollision = true;

    while (hasCollision) {
      hasCollision = false;

      for (const other of sortedLayout) {
        if (other.i === item.i) continue;

        // Check for collision at newY
        if (
          newY < other.y + other.h &&
          newY + item.h > other.y &&
          item.x < other.x + other.w &&
          item.x + item.w > other.x
        ) {
          hasCollision = true;
          newY = other.y + other.h;
          break;
        }
      }
    }

    const result = { ...item, y: newY };
    
    // Restore original height if preserving row heights
    if (preserveRowHeights && rowHeightMap.has(item.i)) {
      result.h = rowHeightMap.get(item.i)!;
    }
    
    return result;
  });

  return compacted;
}

/**
 * Align items in the same row to have the same height
 */
export function normalizeRowHeights(layout: Layout[]): Layout[] {
  const rowGroups: Record<number, Layout[]> = {};

  // Group items by row (with 10px tolerance)
  layout.forEach((item) => {
    const rowKey = Object.keys(rowGroups)
      .map(Number)
      .find((y) => Math.abs(y - item.y) < 10);

    if (rowKey !== undefined) {
      rowGroups[rowKey].push(item);
    } else {
      rowGroups[item.y] = [item];
    }
  });

  // Set all items in a row to the maximum height in that row
  return layout.map((item) => {
    // Skip static items and preference cards container
    if (item.static || item.i === '0' || item.i === '1' || item.i.length > 5) {
      return item;
    }

    const rowKey = Object.keys(rowGroups)
      .map(Number)
      .find((y) => Math.abs(y - item.y) < 10);

    if (rowKey !== undefined) {
      const rowItems = rowGroups[rowKey];
      const maxHeight = Math.max(
        ...rowItems
          .filter((i) => !i.static && i.i !== '0' && i.i !== '1' && i.i.length < 5)
          .map((i) => i.h)
      );

      return { ...item, h: maxHeight };
    }

    return item;
  });
}

/**
 * Generate default layout for a breakpoint based on card constraints
 */
export function generateDefaultLayout(
  breakpoint: string,
  cardCount: number
): Layout[] {
  const layouts: Layout[] = [];

  // Grid configuration per breakpoint
  const gridConfig: Record<
    string,
    { cols: number; cardWidth: number; cardHeight: number }
  > = {
    xxl: { cols: 2, cardWidth: 495, cardHeight: 20 },
    xl: { cols: 2, cardWidth: 495, cardHeight: 20 },
    lg: { cols: 2, cardWidth: 490, cardHeight: 20 },
    md: { cols: 1, cardWidth: 1000, cardHeight: 20 },
    sm: { cols: 1, cardWidth: 1000, cardHeight: 20 },
    xs: { cols: 1, cardWidth: 1000, cardHeight: 20 },
    xxs: { cols: 1, cardWidth: 1000, cardHeight: 20 },
  };

  const config = gridConfig[breakpoint] || gridConfig.xxl;

  // Layout for static header (card 0 - date/filter controls)
  layouts.push({
    i: '0',
    x: 0,
    y: 0,
    w: 1000,
    h: 2.8,
    static: true,
  });

  // Layout for preference cards container (card 1)
  layouts.push({
    i: '1',
    x: 0,
    y: 1,
    w: 1000,
    h: 6.3,
    isResizable: false,
  });

  // Layout remaining cards (overview chart and list cards)
  let currentY = 2;
  let currentX = 0;
  let cardsInCurrentRow = 0;

  for (let i = 2; i <= cardCount; i++) {
    const cardWidth = i === 2 ? 330 : i === 3 ? 660 : config.cardWidth;
    const cardHeight = i === 2 || i === 3 ? 25.4 : config.cardHeight;

    layouts.push({
      i: i.toString(),
      x: currentX,
      y: currentY,
      w: cardWidth,
      h: cardHeight,
      minH: i === 2 || i === 3 ? 20 : 16,
      minW: i === 2 ? 250 : i === 3 ? 400 : 350,
      maxH: 30,
      maxW: i === 3 ? 1000 : i === 2 ? 400 : 700,
    });

    cardsInCurrentRow++;
    currentX += cardWidth + 10;

    // Move to next row if we've filled current row
    if (cardsInCurrentRow >= config.cols || currentX >= 1000) {
      currentY += cardHeight;
      currentX = 0;
      cardsInCurrentRow = 0;
    }
  }

  return layouts;
}

/**
 * Ensure layout items respect their min/max constraints
 */
export function enforceConstraints(layout: Layout[]): Layout[] {
  return layout.map((item) => {
    let { w, h } = item;

    if (item.minW && w < item.minW) w = item.minW;
    if (item.maxW && w > item.maxW) w = item.maxW;
    if (item.minH && h < item.minH) h = item.minH;
    if (item.maxH && h > item.maxH) h = item.maxH;

    return { ...item, w, h };
  });
}
