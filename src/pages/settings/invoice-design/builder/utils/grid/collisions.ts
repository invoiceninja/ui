/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Block } from '../../types';
import { blockRegion, isChromeRegion } from '../page-regions';
import { GRID_CONFIG } from '../grid-converter';
import { normalizeGridPosition } from './normalize';

function horizontalGridOverlap(
  a: Block['gridPosition'],
  b: Block['gridPosition']
): boolean {
  return !(a.x + a.w <= b.x || b.x + b.w <= a.x);
}

/**
 * Header/footer chrome is a row-based strip: resolve overlaps by shifting X,
 * never by bumping Y (body-style repair makes horizontal drags jump rows).
 */
export function repairChromeRegionCollisions(blocks: Block[]): Block[] {
  if (blocks.length <= 1) {
    return blocks;
  }

  let changed = false;
  const rows = new Map<number, Block[]>();

  blocks.forEach((block) => {
    const y = normalizeGridPosition(block.gridPosition).y;
    const list = rows.get(y) ?? [];
    list.push(block);
    rows.set(y, list);
  });

  const repairedById = new Map<string, Block['gridPosition']>();

  rows.forEach((rowBlocks, rowY) => {
    const sorted = rowBlocks.slice().sort((a, b) => {
      if (a.gridPosition.x !== b.gridPosition.x) {
        return a.gridPosition.x - b.gridPosition.x;
      }

      return a.id.localeCompare(b.id);
    });
    const placed: Block['gridPosition'][] = [];

    sorted.forEach((block) => {
      let pos = { ...normalizeGridPosition(block.gridPosition), y: rowY };

      for (let attempt = 0; attempt <= GRID_CONFIG.cols; attempt++) {
        if (!placed.some((placedPosition) => horizontalGridOverlap(pos, placedPosition))) {
          break;
        }

        const blocker = placed.find((placedPosition) =>
          horizontalGridOverlap(pos, placedPosition)
        );

        if (!blocker) {
          break;
        }

        pos = {
          ...pos,
          x: Math.min(blocker.x + blocker.w, GRID_CONFIG.cols - pos.w),
        };
      }

      pos.x = Math.max(0, Math.min(pos.x, GRID_CONFIG.cols - pos.w));

      if (!isSameGridPosition(block.gridPosition, pos)) {
        changed = true;
      }

      placed.push(pos);
      repairedById.set(block.id, pos);
    });
  });

  if (!changed) {
    return blocks;
  }

  return blocks.map((block) => {
    const gridPosition = repairedById.get(block.id);

    if (!gridPosition || isSameGridPosition(block.gridPosition, gridPosition)) {
      return block;
    }

    return {
      ...block,
      gridPosition,
    };
  });
}

export function isSameGridPosition(
  a: Block['gridPosition'],
  b: Block['gridPosition']
): boolean {
  return a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;
}

export function gridPositionsOverlap(
  a: Block['gridPosition'],
  b: Block['gridPosition']
): boolean {
  return !(
    a.x + a.w <= b.x ||
    b.x + b.w <= a.x ||
    a.y + a.h <= b.y ||
    b.y + b.h <= a.y
  );
}

function repairRegionCollisions(blocks: Block[]): Block[] {
  if (blocks.length <= 1) {
    return blocks;
  }

  let changed = false;
  const indexedBlocks = blocks.map((block, index) => {
    const gridPosition = normalizeGridPosition(block.gridPosition);

    if (!isSameGridPosition(block.gridPosition, gridPosition)) {
      changed = true;
    }

    return {
      block,
      index,
      gridPosition,
    };
  });
  const repairedByIndex = new Map<number, Block['gridPosition']>();
  const placed: Block['gridPosition'][] = [];

  indexedBlocks
    .slice()
    .sort((a, b) => {
      if (a.gridPosition.y !== b.gridPosition.y) {
        return a.gridPosition.y - b.gridPosition.y;
      }

      if (a.gridPosition.x !== b.gridPosition.x) {
        return a.gridPosition.x - b.gridPosition.x;
      }

      return a.index - b.index;
    })
    .forEach(({ index, gridPosition }) => {
      const repairedPosition = { ...gridPosition };

      while (
        placed.some((placedPosition) =>
          gridPositionsOverlap(repairedPosition, placedPosition)
        )
      ) {
        const nextY = Math.max(
          ...placed
            .filter((placedPosition) =>
              gridPositionsOverlap(repairedPosition, placedPosition)
            )
            .map((placedPosition) => placedPosition.y + placedPosition.h)
        );

        repairedPosition.y = Math.max(repairedPosition.y + 1, nextY);
      }

      if (!isSameGridPosition(gridPosition, repairedPosition)) {
        changed = true;
      }

      placed.push(repairedPosition);
      repairedByIndex.set(index, repairedPosition);
    });

  if (!changed) {
    return blocks;
  }

  return blocks.map((block, index) => {
    const gridPosition = repairedByIndex.get(index);

    if (!gridPosition || isSameGridPosition(block.gridPosition, gridPosition)) {
      return block;
    }

    return {
      ...block,
      gridPosition,
    };
  });
}

export function repairGridPositionCollisions(blocks: Block[]): Block[] {
  if (blocks.length <= 1) {
    return blocks;
  }

  const byRegion = new Map<string, Block[]>();

  blocks.forEach((block) => {
    const region = blockRegion(block);
    const list = byRegion.get(region);

    if (list) {
      list.push(block);
    } else {
      byRegion.set(region, [block]);
    }
  });

  const repairedById = new Map<string, Block>();
  let changed = false;

  byRegion.forEach((regionBlocks, regionKey) => {
    const repaired =
      isChromeRegion(regionKey)
        ? repairChromeRegionCollisions(regionBlocks)
        : repairRegionCollisions(regionBlocks);

    if (repaired !== regionBlocks) {
      changed = true;
    }

    repaired.forEach((block) => {
      repairedById.set(block.id, block);
    });
  });

  if (!changed) {
    return blocks;
  }

  return blocks.map((block) => repairedById.get(block.id) ?? block);
}

export function applyGridPositionsToBlocks(
  blocks: Block[],
  positionsById: Map<string, Block['gridPosition']>
): Block[] {
  if (!positionsById.size) {
    return repairGridPositionCollisions(blocks);
  }

  let changed = false;
  const nextBlocks = blocks.map((block) => {
    const nextPosition = positionsById.get(block.id);

    if (!nextPosition) {
      return block;
    }

    const current = block.gridPosition;
    const isSame =
      current.x === nextPosition.x &&
      current.y === nextPosition.y &&
      current.w === nextPosition.w &&
      current.h === nextPosition.h;

    if (isSame) {
      return block;
    }

    changed = true;

    return {
      ...block,
      gridPosition: nextPosition,
    };
  });

  return repairGridPositionCollisions(changed ? nextBlocks : blocks);
}
