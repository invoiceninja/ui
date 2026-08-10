import { describe, expect, it } from 'vitest';
import {
  gridPositionsOverlap,
  isSameGridPosition,
  repairGridPositionCollisions,
} from '../../src/pages/settings/invoice-design/builder/utils/grid/collisions';
import { normalizeGridPosition } from '../../src/pages/settings/invoice-design/builder/utils/grid/normalize';
import type { TextBlock } from '../../src/pages/settings/invoice-design/builder/types';

function textBlock(
  id: string,
  gridPosition: TextBlock['gridPosition']
): TextBlock {
  return {
    id,
    type: 'text',
    gridPosition,
    properties: { content: 'Hello' },
  };
}

describe('grid collisions', () => {
  it('detects overlapping grid positions', () => {
    expect(
      gridPositionsOverlap(
        { x: 0, y: 0, w: 4, h: 2 },
        { x: 2, y: 0, w: 4, h: 2 }
      )
    ).toBe(true);

    expect(
      gridPositionsOverlap(
        { x: 0, y: 0, w: 4, h: 2 },
        { x: 4, y: 0, w: 4, h: 2 }
      )
    ).toBe(false);
  });

  it('repairs overlapping blocks by pushing later blocks down', () => {
    const blocks = [
      textBlock('first', { x: 0, y: 0, w: 4, h: 2 }),
      textBlock('second', { x: 0, y: 0, w: 4, h: 2 }),
    ];

    const repaired = repairGridPositionCollisions(blocks);
    const second = repaired.find((block) => block.id === 'second');

    expect(second?.gridPosition.y).toBeGreaterThan(0);
    expect(
      gridPositionsOverlap(
        repaired[0].gridPosition,
        repaired[1].gridPosition
      )
    ).toBe(false);
  });

  it('normalizes out-of-range grid coordinates', () => {
    const normalized = normalizeGridPosition({ x: 10, y: -1, w: 20, h: 0 });

    expect(normalized.x).toBeLessThanOrEqual(11);
    expect(normalized.y).toBeGreaterThanOrEqual(0);
    expect(normalized.w).toBeLessThanOrEqual(12);
    expect(normalized.h).toBeGreaterThanOrEqual(1);
  });

  it('reports unchanged positions with isSameGridPosition', () => {
    const position = { x: 1, y: 2, w: 3, h: 4 };

    expect(isSameGridPosition(position, { ...position })).toBe(true);
    expect(isSameGridPosition(position, { ...position, y: 3 })).toBe(false);
  });
});
