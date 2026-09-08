import { describe, expect, it } from 'vitest';
import type { TextBlock } from '../../src/pages/settings/invoice-design/builder/types';
import {
  assignBlockToRegion,
  canvasRegionForBlock,
  clampChromeHeight,
  normalizeBlockRegion,
  normalizeChromeBackground,
  normalizePagination,
  partitionBlocksByRegion,
  regionFromClientPoint,
} from '../../src/pages/settings/invoice-design/builder/utils/page-regions';
import { repairGridPositionCollisions } from '../../src/pages/settings/invoice-design/builder/utils/grid/collisions';
import { generateInvoiceHTML } from '../../src/pages/settings/invoice-design/builder/utils/html-generator';

function textBlock(
  id: string,
  region?: TextBlock['region']
): TextBlock {
  return {
    id,
    type: 'text',
    gridPosition: { x: 0, y: 0, w: 4, h: 2 },
    properties: { content: '$company.name' },
    ...(region ? { region } : {}),
  };
}

describe('page regions', () => {
  it('defaults unknown pagination and region to none / body', () => {
    expect(normalizePagination(undefined)).toBe('none');
    expect(normalizePagination('sideways')).toBe('none');
    expect(normalizeBlockRegion(undefined)).toBe('body');
    expect(normalizeBlockRegion('chrome')).toBe('body');
  });

  it('keeps footer-tagged blocks in the body when only the header is on', () => {
    expect(canvasRegionForBlock(textBlock('a', 'footer'), 'header')).toBe(
      'body'
    );
    expect(canvasRegionForBlock(textBlock('a', 'header'), 'header')).toBe(
      'header'
    );
  });

  it('partitions stacks for both-mode pagination', () => {
    const partitioned = partitionBlocksByRegion(
      [
        textBlock('h', 'header'),
        textBlock('b'),
        textBlock('f', 'footer'),
      ],
      'both'
    );

    expect(partitioned.header.map((block) => block.id)).toEqual(['h']);
    expect(partitioned.body.map((block) => block.id)).toEqual(['b']);
    expect(partitioned.footer.map((block) => block.id)).toEqual(['f']);
  });

  it('does not treat overlapping header and body blocks as a collision', () => {
    const repaired = repairGridPositionCollisions([
      textBlock('header', 'header'),
      textBlock('body'),
    ]);

    expect(repaired.find((block) => block.id === 'body')?.gridPosition.y).toBe(
      0
    );
    expect(repaired.find((block) => block.id === 'header')?.gridPosition.y).toBe(
      0
    );
  });

  it('prefers header/footer over body when a point hits both', () => {
    const region = regionFromClientPoint(50, 20, [
      { region: 'body', rect: { left: 0, right: 100, top: 0, bottom: 200 } },
      { region: 'header', rect: { left: 0, right: 100, top: 0, bottom: 40 } },
    ]);

    expect(region).toBe('header');
  });

  it('moves a body block into the header without keeping a body region', () => {
    const moved = assignBlockToRegion(textBlock('logo'), 'header', {
      x: 2,
      y: 8,
      w: 4,
      h: 3,
    });

    expect(moved.region).toBe('header');
    expect(moved.gridPosition).toEqual({ x: 2, y: 0, w: 4, h: 3 });
  });

  it('clamps chrome heights to the reserved range', () => {
    expect(clampChromeHeight(0, 80)).toBe(24);
    expect(clampChromeHeight(999, 80)).toBe(400);
    expect(clampChromeHeight('64', 80)).toBe(64);
  });

  it('omits the pagination table when pagination is none', () => {
    const html = generateInvoiceHTML([textBlock('body')], undefined, {
      font_size: 16,
    });

    expect(html).not.toContain('class="invoice-pagination"');
    expect(html).not.toContain('class="invoice-page-header"');
  });

  it('wraps header and body regions in thead/tbody for header pagination', () => {
    const html = generateInvoiceHTML(
      [textBlock('header', 'header'), textBlock('body')],
      undefined,
      {
        font_size: 16,
        pagination: 'header',
        header_height: 72,
      }
    );

    expect(html).toContain('class="invoice-pagination"');
    expect(html).toContain('class="invoice-page-header"');
    expect(html).toContain('min-height: 72px');
    expect(html).not.toContain('class="invoice-page-footer"');
    expect(html.indexOf('<thead')).toBeLessThan(html.indexOf('<tbody'));
    expect(html.indexOf('id="header"')).toBeGreaterThan(html.indexOf('<thead'));
    expect(html.indexOf('id="header"')).toBeLessThan(html.indexOf('<tbody'));
    expect(html.indexOf('id="body"')).toBeGreaterThan(html.indexOf('<tbody'));
  });

  it('emits tfoot only when footer pagination is on', () => {
    const html = generateInvoiceHTML(
      [textBlock('footer', 'footer'), textBlock('body')],
      undefined,
      {
        font_size: 16,
        pagination: 'footer',
        footer_height: 40,
      }
    );

    expect(html).toContain('class="invoice-page-footer"');
    expect(html).not.toContain('class="invoice-page-header"');
    expect(html).toContain('min-height: 40px');
  });

  it('accepts hex chrome backgrounds and rejects other strings', () => {
    expect(normalizeChromeBackground('#1F2937')).toBe('#1F2937');
    expect(normalizeChromeBackground(' #abc ')).toBe('#abc');
    expect(normalizeChromeBackground('red')).toBe('');
    expect(normalizeChromeBackground('url(x)')).toBe('');
  });

  it('paints the header cell when a background is set', () => {
    const html = generateInvoiceHTML(
      [textBlock('header', 'header')],
      undefined,
      {
        font_size: 16,
        pagination: 'header',
        header_background: '#111827',
      }
    );

    expect(html).toContain('background-color: #111827');
  });
});
