import { describe, expect, it } from 'vitest';
import { unwrapNinjaTags } from '../../src/pages/settings/invoice-design/builder/utils/twig-block';
import { renderBlockContent } from '../../src/pages/settings/invoice-design/builder/block-renderers/html/render-block-content';
import type { TwigBlock } from '../../src/pages/settings/invoice-design/builder/types';
import type { GeneratorGlobals } from '../../src/pages/settings/invoice-design/builder/block-renderers/types';
import { SAMPLE_INVOICE_DATA } from '../../src/pages/settings/invoice-design/builder/utils/variable-replacer';
import { generateInvoiceHTML } from '../../src/pages/settings/invoice-design/builder/utils/html-generator';

const globals: GeneratorGlobals = {
  fontSize: '12px',
  fontFamilyPrimary: 'Roboto, sans-serif',
  fontFamilySecondary: 'Roboto, sans-serif',
  primaryColor: '#111827',
  secondaryColor: '#6B7280',
  showPaidStamp: false,
};

function twigBlock(content: string, y = 0): TwigBlock {
  return {
    id: 'twig-1',
    type: 'twig',
    gridPosition: { x: 0, y, w: 12, h: 4 },
    properties: { content },
  };
}

describe('unwrapNinjaTags', () => {
  it('returns inner Twig when the whole string is a ninja block', () => {
    expect(unwrapNinjaTags('<ninja>{% if true %}x{% endif %}</ninja>')).toBe(
      '{% if true %}x{% endif %}'
    );
  });

  it('keeps raw Twig when there is no wrapper', () => {
    expect(unwrapNinjaTags('{{ invoice.number }}')).toBe('{{ invoice.number }}');
  });

  it('does not unwrap a ninja tag that is only part of the source', () => {
    const mixed = '<div><ninja>a</ninja></div>';
    expect(unwrapNinjaTags(mixed)).toBe(mixed);
  });

  it('returns empty string for non-strings', () => {
    expect(unwrapNinjaTags(undefined)).toBe('');
    expect(unwrapNinjaTags(null)).toBe('');
  });
});

describe('renderTwigBlock', () => {
  it('renders markup inside the widget instead of a source dump', () => {
    const html = renderBlockContent(
      twigBlock(
        '<table class="twig-kept"><tr><td>{{ invoice.number }}</td></tr></table>'
      ),
      undefined,
      SAMPLE_INVOICE_DATA,
      globals
    );

    expect(html).toContain('invoice-twig-content');
    expect(html).toContain('<table class="twig-kept">');
    expect(html).toContain('{{ invoice.number }}');
    expect(html).not.toMatch(/<ninja[\s>]/);
  });

  it('unwraps pasted ninja tags before rendering', () => {
    const html = renderBlockContent(
      twigBlock('<ninja><p>Hello</p></ninja>'),
      undefined,
      SAMPLE_INVOICE_DATA,
      globals
    );

    expect(html).toContain('<p>Hello</p>');
    expect(html).not.toMatch(/<ninja[\s>]/);
  });
});

describe('generateInvoiceHTML twig placement', () => {
  it('keeps rendered twig markup inside the positioned widget', () => {
    const html = generateInvoiceHTML(
      [
        {
          id: 'text-top',
          type: 'text',
          gridPosition: { x: 0, y: 0, w: 12, h: 2 },
          properties: { content: 'Above' },
        },
        twigBlock(
          '<table class="twig-kept"><tr><td>Row</td></tr></table>',
          6
        ),
      ],
      SAMPLE_INVOICE_DATA,
      { font_size: 16, page_size: 'A4', page_layout: 'portrait' }
    );

    const widget = html.match(
      /<div id="twig-1"[^>]*>[\s\S]*?<\/div>\s*<\/div>/
    )?.[0];

    expect(html).toContain('id="twig-1"');
    expect(html).toContain('position: absolute');
    expect(widget ?? html).toContain('class="twig-kept"');
    expect(html.indexOf('id="twig-1"')).toBeLessThan(
      html.indexOf('class="twig-kept"')
    );
  });
});
