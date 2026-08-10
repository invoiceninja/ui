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
import type { GridItemHTMLElement, GridStackWidget } from 'gridstack';
import { Block } from '../../types';
import { GRID_CONFIG } from '../grid-converter';
import { CONTENT_GROW_BLOCK_TYPES } from './types';

export const GRIDSTACK_CONTENT_HEIGHT_BUFFER = 2;

export function shouldGrowBlockToContent(block: Block): boolean {
  return CONTENT_GROW_BLOCK_TYPES.has(block.type);
}

export function measureGridItemContentHeight(el: GridItemHTMLElement): number {
  const content = el.querySelector<HTMLElement>('.block-content');
  const measuredContent = content?.querySelector<HTMLElement>(
    '.block-content-measure'
  );

  if (!content) {
    return 0;
  }

  const measurementTarget = measuredContent || content;

  // Saved grid rows stretch `.block-content` to `height: 100%`. Measuring
  // getBoundingClientRect() in that state returns the cell height, not the
  // content height, which prevents shrink-on-load from correcting oversized h.
  const previousContentStyles = {
    height: content.style.height,
    minHeight: content.style.minHeight,
  };
  const previousMeasureStyles = {
    height: measurementTarget.style.height,
    minHeight: measurementTarget.style.minHeight,
  };

  content.style.height = 'auto';
  content.style.minHeight = '0';
  measurementTarget.style.height = 'auto';
  measurementTarget.style.minHeight = '0';

  const contentHeight = Math.ceil(
    Math.max(
      measurementTarget.scrollHeight,
      measurementTarget.getBoundingClientRect().height
    )
  );

  content.style.height = previousContentStyles.height;
  content.style.minHeight = previousContentStyles.minHeight;
  measurementTarget.style.height = previousMeasureStyles.height;
  measurementTarget.style.minHeight = previousMeasureStyles.minHeight;

  return contentHeight;
}

export function getContentGridRows(grid: GridStack, el: GridItemHTMLElement): number {
  const wantedHeight = measureGridItemContentHeight(el);

  if (!wantedHeight) {
    return 1;
  }

  const cellHeight = grid.getCellHeight(true);

  return Math.max(
    1,
    Math.ceil(
      (wantedHeight + GRID_CONFIG.margin[1] + GRIDSTACK_CONTENT_HEIGHT_BUFFER) /
        cellHeight
    )
  );
}

export function syncGridItemContentMinimum(
  grid: GridStack,
  el: GridItemHTMLElement,
  options: { grow: boolean; shrink?: boolean }
): boolean {
  const node = el.gridstackNode;

  if (!node) {
    return false;
  }

  const minRows = getContentGridRows(grid, el);
  const currentRows = node.h || 1;
  const widget: GridStackWidget = {};

  if (node.minH !== minRows) {
    widget.minH = minRows;
  }

  if (options.grow && currentRows < minRows) {
    widget.h = minRows;
  }

  if (options.shrink && currentRows > minRows) {
    widget.h = minRows;
  }

  if (!Object.keys(widget).length) {
    return false;
  }

  grid.update(el, widget);

  return widget.h !== undefined;
}
