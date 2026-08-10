/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { GridStack } from 'gridstack';
import type {
  GridItemHTMLElement,
  GridStackNode,
  GridStackWidget,
} from 'gridstack';
import { Block } from '../../types';
import { GRID_CONFIG } from '../grid-converter';
import { shouldGrowBlockToContent } from './content-height';

export function clampGridValue(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export const GRIDSTACK_CELL_HEIGHT = GRID_CONFIG.rowHeight + GRID_CONFIG.margin[1];

export const GRIDSTACK_MARGIN = `0px ${GRID_CONFIG.margin[0] / 2}px ${
  GRID_CONFIG.margin[1]
}px ${GRID_CONFIG.margin[0] / 2}px`;

export function blockToGridStackWidget(block: Block): GridStackWidget {
  const { x, y, w, h } = block.gridPosition;

  const widget: GridStackWidget = {
    id: block.id,
    x,
    y,
    w,
    h,
    minW: Math.min(w, 2),
    maxW: w >= GRID_CONFIG.cols ? GRID_CONFIG.cols : undefined,
    noMove: Boolean(block.locked),
    noResize: Boolean(block.locked),
  };

  if (!shouldGrowBlockToContent(block)) {
    widget.minH = 1;
  }

  return widget;
}

export function getGridStackBlockId(node: GridStackNode): string | null {
  const id = node.id || node.el?.getAttribute('gs-id');

  return id ? String(id) : null;
}

export function findGridStackElement(
  container: HTMLElement,
  blockId: string
): GridItemHTMLElement | null {
  const items = Array.from(
    container.querySelectorAll<GridItemHTMLElement>('.grid-stack-item')
  );

  return (
    items.find((item) => item.getAttribute('data-block-id') === blockId) || null
  );
}

export function readGridPositionsById(
  grid: GridStack | null
): Map<string, Block['gridPosition']> {
  const positionsById = new Map<string, Block['gridPosition']>();

  if (!grid) {
    return positionsById;
  }

  grid.getGridItems().forEach((item) => {
    const node = item.gridstackNode;

    if (!node) {
      return;
    }

    const blockId = getGridStackBlockId(node);

    if (!blockId) {
      return;
    }

    positionsById.set(blockId, {
      x: node.x ?? 0,
      y: node.y ?? 0,
      w: node.w ?? 1,
      h: node.h ?? 1,
    });
  });

  return positionsById;
}
