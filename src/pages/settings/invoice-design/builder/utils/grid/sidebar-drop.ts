/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { GRID_CONFIG } from '../grid-converter';
import { clampGridValue, GRIDSTACK_CELL_HEIGHT } from './grid-stack-widgets';

export interface SidebarDropGridPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SidebarDropPixelRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Map pointer coordinates to a grid slot using the same math as canvas drop.
 */
export function computeSidebarDropGridPosition(
  clientX: number,
  clientY: number,
  gridElement: HTMLElement,
  blockSize: Pick<SidebarDropGridPosition, 'w' | 'h'>,
  zoom: number
): SidebarDropGridPosition {
  const gridRect = gridElement.getBoundingClientRect();
  const scale = zoom / 100 || 1;
  const relativeX = (clientX - gridRect.left) / scale;
  const relativeY = (clientY - gridRect.top) / scale;
  const unscaledGridWidth = gridRect.width / scale;
  const columnWidth = unscaledGridWidth / GRID_CONFIG.cols;

  return {
    x: clampGridValue(
      Math.floor(relativeX / columnWidth),
      0,
      GRID_CONFIG.cols - blockSize.w
    ),
    y: Math.max(0, Math.floor(relativeY / GRIDSTACK_CELL_HEIGHT)),
    w: blockSize.w,
    h: blockSize.h,
  };
}

/** Pixel rect for a drop preview overlay inside the grid container. */
export function sidebarDropGridPositionToPixels(
  position: SidebarDropGridPosition,
  gridElementWidth: number
): SidebarDropPixelRect {
  const { rowHeight, margin, cols } = GRID_CONFIG;
  const columnWidth = gridElementWidth / cols;
  const cellStrideX = columnWidth;
  const cellStrideY = GRIDSTACK_CELL_HEIGHT;
  const blockHeight =
    position.h * rowHeight + Math.max(0, position.h - 1) * margin[1];
  const blockWidth =
    position.w * columnWidth + Math.max(0, position.w - 1) * margin[0];

  return {
    left: position.x * cellStrideX,
    top: position.y * cellStrideY,
    width: blockWidth,
    height: blockHeight,
  };
}
