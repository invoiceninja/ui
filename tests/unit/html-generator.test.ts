import { describe, expect, it } from 'vitest';
import { generateInvoiceHTML } from '../../src/pages/settings/invoice-design/builder/utils/html-generator';
import type { TextBlock } from '../../src/pages/settings/invoice-design/builder/types';

describe('generateInvoiceHTML', () => {
  it('preserves literal variable tokens when preview data is omitted', () => {
    const block: TextBlock = {
      id: 'text-abc',
      type: 'text',
      gridPosition: { x: 0, y: 0, w: 6, h: 2 },
      properties: {
        content: '$company.name',
        align: 'left',
      },
    };

    const html = generateInvoiceHTML([block], undefined, {
      font_size: 16,
      page_size: 'A4',
      page_layout: 'portrait',
    });

    expect(html).toContain('$company.name');
    expect(html).toContain('data-widget-type="text"');
    expect(html).toContain('id="text-abc"');
    expect(html).toContain('<!DOCTYPE html>');
  });

  it('wraps multiple blocks in an invoice container', () => {
    const blocks: TextBlock[] = [
      {
        id: 'text-one',
        type: 'text',
        gridPosition: { x: 0, y: 0, w: 6, h: 2 },
        properties: { content: 'Line one' },
      },
      {
        id: 'text-two',
        type: 'text',
        gridPosition: { x: 6, y: 0, w: 6, h: 2 },
        properties: { content: 'Line two' },
      },
    ];

    const html = generateInvoiceHTML(blocks, undefined, { font_size: 16 });

    expect(html).toContain('id="text-one"');
    expect(html).toContain('id="text-two"');
    expect(html).toContain('invoice-container');
  });
});
