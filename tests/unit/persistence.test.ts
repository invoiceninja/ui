import { describe, expect, it } from 'vitest';
import { mergeDesignParts } from '../../src/pages/settings/invoice-design/builder/utils/persistence';
import type { TextBlock } from '../../src/pages/settings/invoice-design/builder/types';

describe('mergeDesignParts', () => {
  it('annotates blocks with row layout metadata for the API', () => {
    const block: TextBlock = {
      id: 'text-save',
      type: 'text',
      gridPosition: { x: 8, y: 0, w: 4, h: 2 },
      properties: { content: '$company.name' },
    };

    const merged = mergeDesignParts(
      [block],
      '<div>body</div>',
      {
        includes: 'legacy-includes',
        header: 'legacy-header',
        body: 'legacy-body',
        product: 'legacy-product',
        task: 'legacy-task',
        footer: 'legacy-footer',
      },
      {
        pageLayout: 'portrait',
        pageSize: 'A4',
        globalFontSize: 16,
        primaryFont: 'Roboto',
        secondaryFont: 'Roboto',
        showPaidStamp: false,
        showShippingAddress: false,
        embedDocuments: false,
        hideEmptyColumns: false,
        pageNumbering: false,
        pageMarginTop: 0,
        pageMarginRight: 0,
        pageMarginBottom: 0,
        pageMarginLeft: 0,
        pagePaddingTop: 30,
        pagePaddingRight: 30,
        pagePaddingBottom: 30,
        pagePaddingLeft: 30,
      },
      '.invoice-widget { color: red; }'
    );

    expect(merged.includes).toBe('legacy-includes');
    expect(merged.header).toBe('legacy-header');
    expect(merged.body).toBe('<div>body</div>');
    expect(merged.builderGridVersion).toBe(2);
    expect(merged.customCss).toContain('invoice-widget');
    expect(merged.blocks?.[0]).toMatchObject({
      id: 'text-save',
      rowAlign: 'right',
      colStart: 9,
      colSpan: 4,
    });
  });
});
