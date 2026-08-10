import { describe, expect, it } from 'vitest';
import { annotateBlocksWithRowLayout } from '../../src/pages/settings/invoice-design/builder/utils/row-layout';
import type { TextBlock } from '../../src/pages/settings/invoice-design/builder/types';

function textBlock(
  id: string,
  gridPosition: TextBlock['gridPosition']
): TextBlock {
  return {
    id,
    type: 'text',
    gridPosition,
    properties: { content: 'Row layout' },
  };
}

describe('row layout annotations', () => {
  it('annotates blocks with API row-layout fields', () => {
    const blocks = [
      textBlock('left', { x: 0, y: 0, w: 4, h: 2 }),
      textBlock('right', { x: 8, y: 0, w: 4, h: 2 }),
    ];

    const annotated = annotateBlocksWithRowLayout(blocks);

    expect(annotated[0]).toMatchObject({
      rowAlign: 'left',
      rowWidth: '33.333333%',
      colStart: 1,
      colSpan: 4,
    });

    expect(annotated[1]).toMatchObject({
      rowAlign: 'right',
      rowWidth: '33.333333%',
      colStart: 9,
      colSpan: 4,
    });
  });

  it('treats full-width blocks as left aligned', () => {
    const blocks = [textBlock('full', { x: 0, y: 0, w: 12, h: 2 })];

    const [annotated] = annotateBlocksWithRowLayout(blocks);

    expect(annotated.rowAlign).toBe('left');
    expect(annotated.rowWidth).toBe('100.000000%');
    expect(annotated.colStart).toBe(1);
    expect(annotated.colSpan).toBe(12);
  });
});
