import { describe, expect, it } from 'vitest';
import { generateInvoiceHTML } from '../../src/pages/settings/invoice-design/builder/utils/html-generator';
import { getGeneratorPageDimensions } from '../../src/pages/settings/invoice-design/builder/constants/page-dimensions';
import type {
  TableBlock,
  TextBlock,
} from '../../src/pages/settings/invoice-design/builder/types';
import { SAMPLE_INVOICE_DATA } from '../../src/pages/settings/invoice-design/builder/utils/variable-replacer';

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

  it('expands preview height beyond one page when fullDocument is enabled', () => {
    const tableBlock: TableBlock = {
      id: 'table-1',
      type: 'table',
      gridPosition: { x: 0, y: 0, w: 12, h: 8 },
      properties: {
        columns: [
          {
            id: 'item',
            header: 'Item',
            align: 'left',
            width: '50%',
            field: '$line_item.product_key',
          },
          {
            id: 'amount',
            header: 'Amount',
            align: 'right',
            width: '50%',
            field: '$line_item.line_total',
          },
        ],
        headerBg: '#000000',
        headerColor: '#ffffff',
        headerFontWeight: '600',
        padding: '8px',
        rowBg: '#ffffff',
        alternateRowBg: '#f9fafb',
        alternateRows: true,
        rowColor: '#111827',
      },
    };

    const previewData = {
      ...SAMPLE_INVOICE_DATA,
      line_items: Array.from({ length: 40 }, (_, index) => ({
        ...SAMPLE_INVOICE_DATA.line_items[0],
        product_key: `ITEM-${index + 1}`,
        notes: `Line item ${index + 1}`,
      })),
    };

    const preview = generateInvoiceHTML(
      [tableBlock],
      previewData,
      { font_size: 16, page_size: 'A4', page_layout: 'portrait' },
      '',
      { fullDocument: true }
    );

    const singlePageHeight = generateInvoiceHTML(
      [tableBlock],
      previewData,
      { font_size: 16, page_size: 'A4', page_layout: 'portrait' }
    );

    expect(preview.documentHeight).toBeGreaterThan(1123);
    expect(preview.documentHeight).toBeGreaterThan(
      getGeneratorPageDimensions('A4', 'portrait').height
    );
    expect(preview.html).toContain('overflow: visible');
    expect(preview.html).not.toContain('height: 100%; overflow: auto;');
    expect(singlePageHeight).toContain('overflow: hidden');
  });

  it('keeps save/export output clipped to one page by default', () => {
    const tableBlock: TableBlock = {
      id: 'table-1',
      type: 'table',
      gridPosition: { x: 0, y: 0, w: 12, h: 8 },
      properties: {
        columns: [
          {
            id: 'item',
            header: 'Item',
            align: 'left',
            width: '50%',
            field: '$line_item.product_key',
          },
        ],
        headerBg: '#000000',
        headerColor: '#ffffff',
        headerFontWeight: '600',
        padding: '8px',
        rowBg: '#ffffff',
        alternateRowBg: '#f9fafb',
        alternateRows: true,
        rowColor: '#111827',
      },
    };

    const html = generateInvoiceHTML(
      [tableBlock],
      SAMPLE_INVOICE_DATA,
      { font_size: 16, page_size: 'A4', page_layout: 'portrait' }
    );

    expect(html).toContain('overflow: hidden');
    expect(html).toContain('height: 100%; overflow: auto;');
    expect(typeof html).toBe('string');
  });
});
