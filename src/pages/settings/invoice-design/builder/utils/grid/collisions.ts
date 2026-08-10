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
import { normalizeGridPosition } from './normalize';

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

export function repairGridPositionCollisions(blocks: Block[]): Block[] {
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
