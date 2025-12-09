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
 * Grid system constants (must match InvoiceBuilder.tsx)
 */
export const GRID_CONFIG = {
  cols: 12,
  rowHeight: 60, // pixels
  canvasWidth: 794, // pixels (210mm at 96dpi)
  margin: [10, 10] as [number, number], // [horizontal, vertical] in pixels
  containerPadding: [30, 30] as [number, number], // [horizontal, vertical] in pixels
};

/**
 * Represents absolute pixel position and dimensions
 */
export interface PixelPosition {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Convert grid coordinates to absolute pixel position
 *
 * @param block - Block with gridPosition
 * @returns Absolute pixel coordinates
 */
export function gridToPixels(block: Block): PixelPosition {
  const { x, y, w, h } = block.gridPosition;
  const { cols, rowHeight, canvasWidth, margin, containerPadding } = GRID_CONFIG;

  // Calculate column width
  const availableWidth = canvasWidth - (containerPadding[0] * 2);
  const colWidth = availableWidth / cols;

  // Calculate positions including margins
  const left = containerPadding[0] + (x * colWidth) + (x * margin[0]);
  const top = containerPadding[1] + (y * rowHeight) + (y * margin[1]);

  // Calculate dimensions (subtract margins between columns/rows)
  const width = (w * colWidth) + ((w - 1) * margin[0]);
  const height = (h * rowHeight) + ((h - 1) * margin[1]);

  return { left, top, width, height };
}

/**
 * Convert pixel position back to grid coordinates (for debugging)
 *
 * @param position - Absolute pixel position
 * @returns Grid coordinates
 */
export function pixelsToGrid(position: PixelPosition): { x: number; y: number; w: number; h: number } {
  const { left, top, width, height } = position;
  const { cols, rowHeight, canvasWidth, margin, containerPadding } = GRID_CONFIG;

  const availableWidth = canvasWidth - (containerPadding[0] * 2);
  const colWidth = availableWidth / cols;

  // Calculate grid position
  const x = Math.round((left - containerPadding[0]) / (colWidth + margin[0]));
  const y = Math.round((top - containerPadding[1]) / (rowHeight + margin[1]));

  // Calculate grid dimensions
  const w = Math.round((width + margin[0]) / (colWidth + margin[0]));
  const h = Math.round((height + margin[1]) / (rowHeight + margin[1]));

  return { x, y, w, h };
}

/**
 * Generate inline CSS styles for absolute positioning
 *
 * @param block - Block to generate styles for
 * @returns CSS style string
 */
export function getBlockPositionStyles(block: Block): string {
  const { left, top, width, height } = gridToPixels(block);

  return `
    position: absolute;
    left: ${left}px;
    top: ${top}px;
    width: ${width}px;
    height: ${height}px;
    box-sizing: border-box;
  `.trim().replace(/\s+/g, ' ');
}

/**
 * Calculate total document height based on blocks
 *
 * @param blocks - All blocks in the design
 * @returns Total height in pixels
 */
export function calculateDocumentHeight(blocks: Block[]): number {
  if (blocks.length === 0) {
    return 1122; // A4 height at 96dpi (297mm)
  }

  let maxBottom = 0;

  blocks.forEach(block => {
    const { top, height } = gridToPixels(block);
    const bottom = top + height;
    if (bottom > maxBottom) {
      maxBottom = bottom;
    }
  });

  // Add bottom padding
  const minHeight = 1122; // A4 height
  return Math.max(maxBottom + GRID_CONFIG.containerPadding[1], minHeight);
}
