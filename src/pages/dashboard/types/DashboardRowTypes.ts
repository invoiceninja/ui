import type GridLayout from 'react-grid-layout';

/**
 * A panel within a row. Panels no longer have y or h properties
 * as they derive height from their parent row.
 */
export interface DashboardRowPanel {
  i: string; // Panel ID
  x: number; // Horizontal position within row
  w: number; // Width
  minW?: number;
  maxW?: number;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
}

/**
 * A row container that holds panels.
 * The row itself has a height that all child panels inherit.
 */
export interface DashboardRow {
  id: string; // Row ID
  y: number; // Vertical position of row in dashboard
  h: number; // Height of row (all panels in row share this height)
  panels: DashboardRowPanel[]; // Panels within this row
  isCollapsed?: boolean; // Whether row is collapsed
  minH?: number;
  maxH?: number;
}

/**
 * Dashboard layout organized by rows
 */
export interface DashboardRowLayout {
  rows: DashboardRow[];
}

/**
 * Responsive layouts per breakpoint
 */
export type DashboardRowLayouts = {
  [breakpoint: string]: DashboardRowLayout;
};

/**
 * Convert flat react-grid-layout to row-based structure
 */
export function convertFlatLayoutToRows(
  flatLayout: GridLayout.Layout[]
): DashboardRow[] {
  // Group panels by Y position (with tolerance of 5 units)
  const tolerance = 5;
  const grouped = new Map<number, GridLayout.Layout[]>();

  // Sort by Y position first
  const sorted = [...flatLayout].sort((a, b) => (a.y || 0) - (b.y || 0));

  sorted.forEach((item) => {
    const y = item.y || 0;
    
    // Find if there's an existing group within tolerance
    let groupKey: number | null = null;
    for (const key of grouped.keys()) {
      if (Math.abs(key - y) <= tolerance) {
        groupKey = key;
        break;
      }
    }

    if (groupKey === null) {
      groupKey = y;
      grouped.set(groupKey, []);
    }

    grouped.get(groupKey)!.push(item);
  });

  // Convert groups to rows
  const rows: DashboardRow[] = [];
  let currentY = 0;

  Array.from(grouped.entries())
   .sort(([a], [b]) => a - b)
   .forEach(([, items], rowIndex) => {
     // Calculate row height as max height of all panels in the row
      // Original flat layout uses rowHeight=1, so h values are in pixels
      // For row-based system, we need reasonable pixel heights
      // Multiply by a factor to get usable heights (1 unit = 20px minimum)
      const rowHeight = Math.max(...items.map((item) => (item.h || 10) * 20));

     const panels: DashboardRowPanel[] = items.map((item) => ({
        i: item.i,
        x: item.x || 0,
        w: item.w || 4,
        minW: item.minW,
        maxW: item.maxW,
        static: item.static,
        isDraggable: item.isDraggable,
        isResizable: item.isResizable,
      }));

      rows.push({
        id: `row-${rowIndex}`,
        y: currentY,
        h: rowHeight,
        panels,
      });

      currentY += rowHeight;
    });

  return rows;
}

/**
 * Convert row-based structure back to flat react-grid-layout
 */
export function convertRowsToFlatLayout(
  rows: DashboardRow[]
): GridLayout.Layout[] {
  const flatLayout: GridLayout.Layout[] = [];

  rows.forEach((row) => {
    row.panels.forEach((panel) => {
      flatLayout.push({
        i: panel.i,
        x: panel.x,
        y: row.y,
        w: panel.w,
        h: row.h,
        minW: panel.minW,
        maxW: panel.maxW,
        minH: row.minH,
        maxH: row.maxH,
        static: panel.static,
        isDraggable: panel.isDraggable,
        isResizable: panel.isResizable,
      });
    });
  });

  return flatLayout;
}
