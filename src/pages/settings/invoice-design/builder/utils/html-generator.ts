/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Block } from '../types';
import { GRID_CONFIG } from './grid-converter';
import { InvoiceData, SAMPLE_INVOICE_DATA } from './variable-replacer';
import { getInvoiceWidgetClassName } from '../constants/widget-classes';
import { sanitizeCustomCss } from './custom-css';
import { sanitizeHTML } from '$app/common/helpers/html-string';
import { renderBlockContent } from '../block-renderers/html/render-block-content';
import {
  ensurePx,
  escapeHtml,
} from '../block-renderers/shared/style-utils';
import {
  getGeneratorPageDimensions,
  type GeneratorPageDimensions,
} from '../constants/page-dimensions';
import { GeneratorGlobals } from '../block-renderers/types';

export { ensurePx, getGeneratorPageDimensions };
export type { GeneratorPageDimensions };

/**
 * Group blocks by their Y position (row)
 */
function groupBlocksByRow(blocks: Block[]): Map<number, Block[]> {
  const rows = new Map<number, Block[]>();
  blocks.forEach((block) => {
    const y = block.gridPosition.y;
    if (!rows.has(y)) {
      rows.set(y, []);
    }
    rows.get(y)!.push(block);
  });
  return rows;
}

/**
 * Calculate row heights based on builder grid dimensions.
 */
function calculateRowHeights(rows: Map<number, Block[]>): Map<number, number> {
  const rowHeights = new Map<number, number>();
  const { rowHeight, margin } = GRID_CONFIG;

  rows.forEach((blocks, y) => {
    const maxGridHeight = Math.max(
      ...blocks.map((block) =>
        Math.max(
          0,
          block.gridPosition.h * rowHeight +
            (block.gridPosition.h - 1) * margin[1]
        )
      )
    );

    rowHeights.set(y, maxGridHeight);
  });

  return rowHeights;
}

/**
 * Calculate top positions for each row based on grid coordinates.
 * Matches builder grid positioning exactly.
 */
function calculateRowPositions(
  rowHeights: Map<number, number>,
  topPadding: number = GRID_CONFIG.containerPadding[1]
): Map<number, number> {
  const rowPositions = new Map<number, number>();
  const { rowHeight, margin } = GRID_CONFIG;

  rowHeights.forEach((_, y) => {
    const top = topPadding + y * (rowHeight + margin[1]);
    rowPositions.set(y, top);
  });

  return rowPositions;
}

/**
 * snake_case shape of the per-template document settings consumed by the
 * generator. Mirrors the camelCased `DocumentSettings` interface — kept in
 * snake_case so the generator stays portable to a non-builder caller (e.g. a
 * server-side renderer reading `company.settings`-shaped input).
 *
 * Hoisted so consumers like PreviewModal share one source of truth instead of
 * redeclaring an inline shape that drifts whenever new fields are added.
 */
export interface GeneratorDesignSettings {
  page_size?: string;
  page_layout?: string;
  primary_font?: string;
  secondary_font?: string;
  font_size?: number;
  primary_color?: string;
  secondary_color?: string;
  show_paid_stamp?: boolean;
  show_shipping_address?: boolean;
  embed_documents?: boolean;
  hide_empty_columns?: boolean;
  page_numbering?: boolean;
  page_margin_top?: number;
  page_margin_right?: number;
  page_margin_bottom?: number;
  page_margin_left?: number;
  page_padding_top?: number;
  page_padding_right?: number;
  page_padding_bottom?: number;
  page_padding_left?: number;
}

/**
 * Generate complete HTML document from blocks using row-based height calculation
 * This ensures content-driven heights and eliminates wasted vertical space
 */
export function generateInvoiceHTML(
  blocks: Block[],
  previewData?: InvoiceData,
  designSettings?: GeneratorDesignSettings,
  customCss: string = ''
): string {
  customCss = sanitizeCustomCss(customCss);
  // Layout/height calculations always need a concrete data shape.
  // Variable substitution is gated on previewData — when absent, tokens stay literal.
  const layoutData = previewData || SAMPLE_INVOICE_DATA;

  const fallbackStack = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
  const primaryFontName = (designSettings?.primary_font || 'Roboto').replace(
    /_/g,
    ' '
  );
  const secondaryFontName = (
    designSettings?.secondary_font ||
    designSettings?.primary_font ||
    'Roboto'
  ).replace(/_/g, ' ');
  const fontSize = designSettings?.font_size || 16;
  // Text color defaults to black — primary_color is a brand accent (used for
  // table headers / dividers when seeded on drop) and must never cascade onto
  // body text. Per-block / per-field color overrides are still honoured.
  const primaryColor = '#000000';
  const secondaryColor = designSettings?.secondary_color || '#6B7280';
  const pageSize = designSettings?.page_size || 'A4';
  const pageLayout = designSettings?.page_layout || 'portrait';
  const pageDimensions = getGeneratorPageDimensions(pageSize, pageLayout);

  const globals: GeneratorGlobals = {
    fontSize: `${fontSize}px`,
    fontFamilyPrimary: `'${primaryFontName}', ${fallbackStack}`,
    fontFamilySecondary: `'${secondaryFontName}', ${fallbackStack}`,
    primaryColor,
    secondaryColor,
    showPaidStamp: Boolean(designSettings?.show_paid_stamp),
  };

  // Sort blocks by Y position, then by X position for same row
  const sortedBlocks = [...blocks].sort((a, b) => {
    if (a.gridPosition.y !== b.gridPosition.y) {
      return a.gridPosition.y - b.gridPosition.y;
    }
    return a.gridPosition.x - b.gridPosition.x;
  });

  // Defensive check to ensure GRID_CONFIG is properly defined
  if (!GRID_CONFIG || !GRID_CONFIG.containerPadding) {
    throw new Error(
      'GRID_CONFIG.containerPadding is not defined. Please check grid-converter.ts'
    );
  }

  // Per-template page margin (drives @page) — 0 default matches prior behaviour.
  const pageMarginTop = designSettings?.page_margin_top ?? 0;
  const pageMarginRight = designSettings?.page_margin_right ?? 0;
  const pageMarginBottom = designSettings?.page_margin_bottom ?? 0;
  const pageMarginLeft = designSettings?.page_margin_left ?? 0;

  // Per-template content padding (drives .invoice-container AND the absolute
  // positioning math for every block — children of .invoice-container are
  // position: absolute, so CSS padding alone is invisible to them).
  // Falls back to legacy GRID_CONFIG.containerPadding so unmigrated designs
  // render unchanged.
  const pagePaddingTop =
    designSettings?.page_padding_top ?? GRID_CONFIG.containerPadding[1];
  const pagePaddingRight =
    designSettings?.page_padding_right ?? GRID_CONFIG.containerPadding[0];
  const pagePaddingBottom =
    designSettings?.page_padding_bottom ?? GRID_CONFIG.containerPadding[1];
  const pagePaddingLeft =
    designSettings?.page_padding_left ?? GRID_CONFIG.containerPadding[0];

  // On-screen, @page { margin } is invisible (it only applies in print). To make
  // the configured page margin show up in the iframe preview as well, we stack
  // margin + padding into a single "effective" inset used for both the visible
  // .invoice-container padding and every block's absolute top/left math.
  const effectivePadding = {
    top: pageMarginTop + pagePaddingTop,
    right: pageMarginRight + pagePaddingRight,
    bottom: pageMarginBottom + pagePaddingBottom,
    left: pageMarginLeft + pagePaddingLeft,
  };

  // Group blocks by row and calculate row-based heights
  const rows = groupBlocksByRow(blocks);
  const rowHeights = calculateRowHeights(rows);
  const rowPositions = calculateRowPositions(rowHeights, effectivePadding.top);

  // Render blocks with row-based positioning
  const blocksHTML = sortedBlocks
    .map((block) =>
      renderBlockWithRowHeight(
        block,
        previewData,
        layoutData,
        rowHeights,
        rowPositions,
        globals,
        effectivePadding,
        pageDimensions.width
      )
    )
    .join('\n');

  // Calculate container height from actual block positions and grid heights
  let maxBottom = 0;
  if (blocks.length > 0) {
    const { rowHeight, margin } = GRID_CONFIG;
    maxBottom = Math.max(
      ...blocks.map((block) => {
        const { y, h } = block.gridPosition;
        const top = effectivePadding.top + y * (rowHeight + margin[1]);
        const gridHeight = Math.max(0, h * rowHeight + (h - 1) * margin[1]);
        return top + gridHeight;
      })
    );
  } else {
    maxBottom = effectivePadding.top;
  }

  // Add bottom inset
  maxBottom += effectivePadding.bottom;

  // Ensure the document is at least one configured page tall.
  const containerHeight = Math.max(
    maxBottom || pageDimensions.height,
    pageDimensions.height
  );

  const showPageNumbering = designSettings?.page_numbering;

  const generatedHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${escapeHtml(layoutData.invoice.number)}</title>
  <style>
    @page {
      size: ${pageDimensions.widthMm}mm ${pageDimensions.heightMm}mm;
      /* Always zero — the user's pageMargin is already stacked into the visible
         .invoice-container padding via effectivePadding. Adding it here too
         would double-apply the gutter at PDF render time. */
      margin: 0;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      width: ${pageDimensions.width}px;
      height: ${containerHeight}px;
      overflow: hidden; /* Prevent scrollbars */
      font-family: ${globals.fontFamilyPrimary};
      font-size: ${fontSize}px;
      color: ${primaryColor};
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .text-secondary {
      color: ${secondaryColor};
    }

    .invoice-container {
      width: 100%;
      height: ${containerHeight}px;
      background: white;
      margin: 0;
      padding: ${effectivePadding.top}px ${effectivePadding.right}px ${
    effectivePadding.bottom
  }px ${effectivePadding.left}px;
      position: relative;
      overflow: hidden; /* Prevent any visual artifacts from extending beyond container */
      box-sizing: border-box; /* Include padding in width calculation */
    }

    .block {
      position: absolute;
      box-sizing: border-box;
      overflow: visible;
    }

    /* Tables should expand to fit content */
    .block table {
      width: 100%;
      border-collapse: collapse;
    }

    /* Ensure table rows don't get cut off */
    .block table tr {
      page-break-inside: avoid;
    }

    /* Text content should wrap naturally */
    .block p, .block div {
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    /* Paid Stamp - Matches backend API styling */
    .stamp {
      transform: rotate(12deg);
      color: #555;
      font-size: 3rem;
      font-weight: 700;
      border: 0.25rem solid #555;
      display: inline-block;
      padding: 0.25rem 1rem;
      text-transform: uppercase;
      border-radius: 1rem;
      font-family: 'Courier', monospace;
      mix-blend-mode: multiply;
      z-index: 200 !important;
      position: fixed;
      text-align: center;
    }

    .stamp.is-paid {
      color: #D23;
      border: 1rem double #D23;
      transform: rotate(-5deg);
      font-size: 6rem;
      font-family: "Open sans", Helvetica, Arial, sans-serif;
      border-radius: 0;
      padding: 0.5rem;
      opacity: 0.2;
      z-index: 200 !important;
      position: fixed;
    }

    /* Page Number */
    .page-number {
      position: absolute;
      bottom: 20px;
      right: 30px;
      font-size: 11px;
      color: ${secondaryColor};
    }

    @media print {
      body {
        margin: 0;
        padding: 0;
      }

      .invoice-container {
        margin: 0;
      }

      /* Avoid breaking inside blocks */
      .block {
        break-inside: avoid;
      }
    }
  </style>
  ${
    customCss.trim()
      ? `<style data-invoice-custom-css>\n${escapeStyleElementContent(
          customCss
        )}\n  </style>`
      : ''
  }
</head>
<body>
  <div class="invoice-container">
    ${blocksHTML}
    ${showPageNumbering ? '<div class="page-number">Page 1 of 1</div>' : ''}
  </div>
</body>
</html>
  `.trim();

  return sanitizeGeneratedInvoiceHtml(generatedHtml);
}

/**
 * Render a single block to HTML with grid-based positioning and sizing.
 * Matches builder grid coordinates exactly.
 */
function renderBlockWithRowHeight(
  block: Block,
  previewData: InvoiceData | undefined,
  layoutData: InvoiceData,
  rowHeights: Map<number, number>,
  rowPositions: Map<number, number>,
  globals: GeneratorGlobals,
  effectivePadding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  },
  canvasWidth: number
): string {
  const content = renderBlockContent(block, previewData, layoutData, globals);

  // Calculate absolute pixel positions based on grid coordinates
  const { x, y, w, h } = block.gridPosition;
  const { cols, margin, rowHeight } = GRID_CONFIG;

  // Calculate column width using per-template horizontal padding so the grid
  // shrinks/grows with the user's padding settings.
  const availableWidth =
    canvasWidth - effectivePadding.left - effectivePadding.right;
  const colWidth = availableWidth / cols;

  // Calculate horizontal position
  const left = effectivePadding.left + x * (colWidth + margin[0]);

  // Calculate width
  const width = w * colWidth + (w - 1) * margin[0];

  // Get row-based position (direct grid coordinate calculation)
  const top = rowPositions.get(y) || effectivePadding.top;

  const gridHeight = Math.max(0, h * rowHeight + (h - 1) * margin[1]);

  // Ensure blocks never exceed container bounds
  const maxLeft = effectivePadding.left;
  const maxRight = canvasWidth - effectivePadding.right;
  const constrainedLeft = Math.max(maxLeft, Math.min(left, maxRight - width));
  const constrainedWidth = Math.min(width, maxRight - constrainedLeft);
  const constrainedLeftPercent = (constrainedLeft / canvasWidth) * 100;
  const constrainedWidthPercent = (constrainedWidth / canvasWidth) * 100;

  // Use min-height so content can grow if taller than the grid cell
  const heightStyle = `min-height: ${gridHeight}px;`;

  // Page-break behaviour for the totals block:
  //   keepTogether === true  → force a page break before this block
  //   keepTogether === false → keep the block together (avoid breaking inside)
  //   undefined              → no rule emitted (renderer default)
  let pageBreakStyle = '';
  if (block.type === 'total') {
    const keepTogether = (block.properties as { keepTogether?: boolean })
      .keepTogether;
    if (keepTogether === true) {
      pageBreakStyle = 'page-break-before: always; break-before: page;';
    } else if (keepTogether === false) {
      pageBreakStyle = 'page-break-inside: avoid; break-inside: avoid;';
    }
  }

  const styles = `
    position: absolute;
    left: ${constrainedLeftPercent.toFixed(6)}%;
    top: ${top}px;
    width: ${constrainedWidthPercent.toFixed(6)}%;
    ${heightStyle}
    ${pageBreakStyle}
    box-sizing: border-box;
  `
    .trim()
    .replace(/\s+/g, ' ');

  const widgetClasses = getInvoiceWidgetClassName(
    block.type,
    block.properties.cssClasses
  );

  return `<div id="${escapeHtml(
    block.id
  )}" class="block ${widgetClasses}" data-widget-type="${escapeHtml(
    block.type
  )}" style="${styles}">${content}</div>`;
}


/** Prevent custom CSS from terminating its generated HTML style element. */
function escapeStyleElementContent(css: string): string {
  return css.replace(/<\/style/gi, '<\\/style');
}

/**
 * Contextual escaping above keeps variable values as text. This final browser
 * pass is defence in depth for malformed/tampered saved block properties that
 * could otherwise create elements or attributes while the HTML string parses.
 */
function sanitizeGeneratedInvoiceHtml(html: string): string {
  if (typeof window === 'undefined') {
    return html;
  }

  return sanitizeHTML(html, {
    WHOLE_DOCUMENT: true,
    ADD_TAGS: ['meta', '!doctype'],
    ADD_ATTR: [
      'data-invoice-custom-css',
      'data-widget-type',
      'aria-hidden',
    ],
    FORBID_TAGS: [
      'script',
      'iframe',
      'object',
      'embed',
      'link',
      'base',
      'form',
    ],
  });
}
