/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import type { Block, BlockDefinition } from '../types';
import { resolveDropTarget } from './chrome-grid';
import {
  computeSidebarDropGridPosition,
  type SidebarDropGridPosition,
} from './grid/sidebar-drop';
import {
  blockRegion,
  isChromeRegion,
  type BlockRegion,
} from './page-regions';
import { getContentConstrainedGridSize } from './block-sizing';

export function chromeStripBlockHeight(gridHeight: number): number {
  return Math.min(gridHeight, 4);
}

export function dropSizeForDraggedBlock(block: Block): Pick<
  SidebarDropGridPosition,
  'w' | 'h'
> {
  return {
    w: block.gridPosition.w,
    h: chromeStripBlockHeight(block.gridPosition.h),
  };
}

export function dropSizeForDefinition(
  definition: BlockDefinition,
  inheritedFontSize: number
): Pick<SidebarDropGridPosition, 'w' | 'h'> {
  return getContentConstrainedGridSize(definition, { inheritedFontSize });
}

/**
 * Map pointer coordinates to a grid slot for any page region (body or chrome).
 */
export function computeRegionDropGridPosition(
  region: BlockRegion,
  clientX: number,
  clientY: number,
  size: Pick<SidebarDropGridPosition, 'w' | 'h'>,
  zoom: number,
  draggedBlock?: Block
): SidebarDropGridPosition | null {
  const dropTarget = resolveDropTarget(region);

  if (!dropTarget) {
    return null;
  }

  const gridPosition = computeSidebarDropGridPosition(
    clientX,
    clientY,
    dropTarget.element,
    size,
    zoom,
    dropTarget.inset
  );

  const repositioningWithinSameChromeStrip =
    isChromeRegion(region) &&
    draggedBlock !== undefined &&
    blockRegion(draggedBlock) === region;

  return {
    ...gridPosition,
    y: repositioningWithinSameChromeStrip
      ? draggedBlock.gridPosition.y
      : gridPosition.y,
  };
}
