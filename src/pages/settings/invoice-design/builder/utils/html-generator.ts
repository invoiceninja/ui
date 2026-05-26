/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Block, FieldConfig } from '../types';
import { GRID_CONFIG } from './grid-converter';
import {
  InvoiceData,
  SAMPLE_INVOICE_DATA,
  replaceVariables,
  resolveVariable,
} from './variable-replacer';
import { getSampleLabelValue, replaceLabelVariables } from './label-variables';
import { t } from 'i18next';
import {
  resolveTableBorderProps,
  tableHeaderCellBorderCssFragments,
  tableBodyCellBorderCssFragments,
} from './table-cell-borders';
import {
  DEFAULT_LABEL_TEXT_COLOR,
  DEFAULT_VALUE_TEXT_COLOR,
} from '../constants/design-colors';

/**
 * Resolved document-level globals threaded through every block renderer so the
 * inheritance cascade is `block.prop ?? globals.prop` everywhere.
 */
interface GeneratorGlobals {
  fontSize: string; // '16px'
  fontFamilyPrimary: string; // 'Roboto, sans-serif'
  fontFamilySecondary: string; // 'Roboto, sans-serif'
  primaryColor: string;
  secondaryColor: string;
  showPaidStamp: boolean;
}

/** First defined wins; treats empty string as defined-but-blank → next falls back. */
function pick<T>(...values: (T | undefined | null | '')[]): T {
  for (const v of values) {
    if (v !== undefined && v !== null && v !== '') return v as T;
  }
  return undefined as unknown as T;
}

/**
 * Append `px` to bare-number CSS lengths so user inputs like "8" don't get
 * silently dropped by the browser. Multi-token shorthands (e.g. "4px 8px") and
 * already-unitful values pass through unchanged.
 */
export function ensurePx(value: string | number | undefined | null): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const s = String(value).trim();
  if (s === '') return undefined;
  // Multi-token shorthand: normalize each token independently.
  if (/\s/.test(s)) {
    return s.split(/\s+/).map((t) => ensurePx(t) ?? t).join(' ');
  }
  // Bare number (positive or negative, optional decimal) → append px.
  if (/^-?\d+(\.\d+)?$/.test(s)) return `${s}px`;
  return s;
}

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
 * Calculate row heights based on grid dimensions (matching react-grid-layout).
 * Subtracts 52px of designer chrome (28px toolbar + 24px p-3 padding) so the
 * PDF content area matches the designer's usable content area.
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
            (block.gridPosition.h - 1) * margin[1] -
            52
        )
      )
    );

    rowHeights.set(y, maxGridHeight);
  });

  return rowHeights;
}

/**
 * Calculate top positions for each row based on grid coordinates.
 * Matches react-grid-layout positioning exactly.
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
  designSettings?: GeneratorDesignSettings
): string {
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
        effectivePadding
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
        const gridHeight = Math.max(
          0,
          h * rowHeight + (h - 1) * margin[1] - 52
        );
        return top + gridHeight;
      })
    );
  } else {
    maxBottom = effectivePadding.top;
  }

  // Add bottom inset
  maxBottom += effectivePadding.bottom;

  // Ensure minimum A4 height
  const containerHeight = Math.max(maxBottom || 1122, 1122);

  const canvasWidth = GRID_CONFIG.canvasWidth;

  const pageSizeCss = pageSize === 'letter' ? 'letter' : 'A4';
  const showPageNumbering = designSettings?.page_numbering;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${layoutData.invoice.number}</title>
  <style>
    @page {
      size: ${pageSizeCss};
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
      width: ${canvasWidth}px;
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
      width: ${canvasWidth}px;
      height: ${containerHeight}px;
      background: white;
      margin: 0;
      padding: ${effectivePadding.top}px ${effectivePadding.right}px ${effectivePadding.bottom}px ${effectivePadding.left}px;
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
</head>
<body>
  <div class="invoice-container">
    ${blocksHTML}
    ${showPageNumbering ? '<div class="page-number">Page 1 of 1</div>' : ''}
  </div>
</body>
</html>
  `.trim();
}

/**
 * Render a single block to HTML with grid-based positioning and sizing.
 * Matches react-grid-layout coordinates exactly.
 */
function renderBlockWithRowHeight(
  block: Block,
  previewData: InvoiceData | undefined,
  layoutData: InvoiceData,
  rowHeights: Map<number, number>,
  rowPositions: Map<number, number>,
  globals: GeneratorGlobals,
  effectivePadding: { top: number; right: number; bottom: number; left: number }
): string {
  const content = renderBlockContent(block, previewData, layoutData, globals);

  // Calculate absolute pixel positions based on grid coordinates
  const { x, y, w, h } = block.gridPosition;
  const { cols, canvasWidth, margin, rowHeight } = GRID_CONFIG;

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

  // Use the block's own grid height minus 52px of editor chrome
  // (28px toolbar + 24px p-3 padding) so the PDF matches the designer.
  const gridHeight = Math.max(
    0,
    h * rowHeight + (h - 1) * margin[1] - 52
  );

  // Ensure blocks never exceed container bounds
  const maxLeft = effectivePadding.left;
  const maxRight = canvasWidth - effectivePadding.right;
  const constrainedLeft = Math.max(maxLeft, Math.min(left, maxRight - width));
  const constrainedWidth = Math.min(width, maxRight - constrainedLeft);

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
      pageBreakStyle =
        'page-break-before: always; break-before: page;';
    } else if (keepTogether === false) {
      pageBreakStyle =
        'page-break-inside: avoid; break-inside: avoid;';
    }
  }

  const styles = `
    position: absolute;
    left: ${constrainedLeft}px;
    top: ${top}px;
    width: ${constrainedWidth}px;
    ${heightStyle}
    ${pageBreakStyle}
    box-sizing: border-box;
  `
    .trim()
    .replace(/\s+/g, ' ');

  return `<div class="block" style="${styles}">${content}</div>`;
}

/**
 * Render block content based on type
 */
function renderBlockContent(
  block: Block,
  previewData: InvoiceData | undefined,
  layoutData: InvoiceData,
  globals: GeneratorGlobals
): string {
  switch (block.type) {
    case 'text':
    case 'public-notes':
    case 'footer':
    case 'terms':
      return renderTextBlock(block, previewData, globals);
    case 'logo':
    case 'image':
      return renderImageBlock(block, previewData);
    case 'company-info':
      return renderCompanyInfoBlock(block, previewData, globals);
    case 'client-info':
    case 'client-shipping-info':
      return renderClientInfoBlock(block, previewData, globals);
    case 'invoice-details':
      return renderInvoiceDetailsBlock(block, previewData, globals);
    case 'table':
      return renderTableBlock(block, previewData, layoutData, globals);
    case 'total':
      return renderTotalBlock(block, previewData, globals);
    case 'divider':
      return renderDividerBlock(block);
    case 'spacer':
      return renderSpacerBlock(block);
    case 'qrcode':
      return renderQRCodeBlock(block, previewData);
    case 'signature':
      return renderSignatureBlock(block, globals);
    default:
      return `<div style="padding: 10px; color: #999;">Unknown block type: ${block.type}</div>`;
  }
}

function renderTextBlock(
  block: Block,
  data: InvoiceData | undefined,
  globals: GeneratorGlobals
): string {
  const { content, fontSize, fontWeight, color, align, lineHeight, padding } =
    block.properties;
  const replacedContent = replaceVariables(content, data);
  const paddingCss = padding ? `padding: ${padding};` : '';

  return `
    <div style="
      font-size: ${pick(fontSize, globals.fontSize)};
      font-weight: ${fontWeight || 'normal'};
      color: ${pick(color, DEFAULT_VALUE_TEXT_COLOR, globals.primaryColor)};
      text-align: ${align || 'left'};
      line-height: ${lineHeight || '1.5'};
      ${paddingCss}
      height: 100%;
      display: flex;
      align-items: center;
    ">
      ${escapeHtml(replacedContent)}
    </div>
  `;
}

function renderImageBlock(
  block: Block,
  data: InvoiceData | undefined
): string {
  const { source, align, maxWidth, objectFit } = block.properties;
  const resolvedSource = replaceVariables(source, data);

  if (!resolvedSource) {
    return `<div style="width: 100%; height: 100%; background: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 12px;">
      ${block.type === 'logo' ? 'Company Logo' : 'Image'}
    </div>`;
  }

  // Map text alignment to flexbox justify-content
  const justifyContent =
    align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';

  return `
    <div style="text-align: ${align}; height: 100%; display: flex; align-items: center; justify-content: ${justifyContent};">
      <img src="${escapeHtml(
        resolvedSource
      )}" style="max-width: ${maxWidth}; max-height: 100%; object-fit: ${objectFit};" alt="${
        block.type
      }" />
    </div>
  `;
}

function renderCompanyInfoBlock(
  block: Block,
  data: InvoiceData | undefined,
  globals: GeneratorGlobals
): string {
  const { fieldConfigs, content, fontSize, lineHeight, align, color, padding } =
    block.properties;
  const blockFontSize = pick(fontSize, globals.fontSize);
  const blockColor = pick(color, DEFAULT_VALUE_TEXT_COLOR, globals.primaryColor);
  const paddingStyle = padding ? `padding: ${padding};` : '';

  if (fieldConfigs && Array.isArray(fieldConfigs) && fieldConfigs.length > 0) {
    const fieldsHtml = fieldConfigs
      .map(
        (config: {
          variable: string;
          prefix?: string;
          suffix?: string;
          hideIfEmpty?: boolean;
          fontSize?: string;
          fontWeight?: string;
          fontStyle?: string;
          color?: string;
        }) => {
          const resolvedValue = replaceVariables(config.variable, data);

          if (
            config.hideIfEmpty !== false &&
            (!resolvedValue || resolvedValue.trim() === '')
          ) {
            return '';
          }

          const fieldFontSize = pick(config.fontSize, blockFontSize);
          const fieldColor = pick(config.color, blockColor);

          return `
          <div style="
            font-size: ${fieldFontSize};
            font-weight: ${config.fontWeight || 'normal'};
            color: ${fieldColor};
            font-style: ${config.fontStyle || 'normal'};
          ">
            ${escapeHtml(config.prefix || '')}${escapeHtml(resolvedValue)}${escapeHtml(config.suffix || '')}
          </div>
        `;
        }
      )
      .filter(Boolean)
      .join('');

    if (!fieldsHtml) {
      return '<div>&nbsp;</div>';
    }

    return `
      <div style="
        font-size: ${blockFontSize};
        line-height: ${lineHeight || '1.5'};
        text-align: ${align || 'left'};
        color: ${blockColor};
        ${paddingStyle}
      ">
        ${fieldsHtml}
      </div>
    `;
  }

  const replacedContent = replaceVariables(content, data);

  return `
    <div style="
      font-size: ${blockFontSize};
      line-height: ${lineHeight || '1.5'};
      text-align: ${align || 'left'};
      color: ${blockColor};
      white-space: pre-line;
      ${paddingStyle}
    ">
      ${escapeHtml(replacedContent)}
    </div>
  `;
}

function renderClientInfoBlock(
  block: Block,
  data: InvoiceData | undefined,
  globals: GeneratorGlobals
): string {
  const {
    fieldConfigs,
    content,
    fontSize,
    lineHeight,
    align,
    color,
    padding,
    showTitle,
    title,
    titleFontWeight,
  } = block.properties;
  const blockFontSize = pick(fontSize, globals.fontSize);
  const blockColor = pick(color, DEFAULT_VALUE_TEXT_COLOR, globals.primaryColor);
  const paddingStyle = padding ? `padding:${padding};` : '';

  let contentHtml = '';
  let useFieldConfigs = false;

  if (fieldConfigs && Array.isArray(fieldConfigs) && fieldConfigs.length > 0) {
    useFieldConfigs = true;
    // Compact join — no whitespace between sibling field divs, otherwise the
    // outer wrapper renders the indentation as blank text nodes (especially
    // visible if any ancestor has white-space: pre-line).
    const fieldsHtml = fieldConfigs
      .map(
        (config: {
          variable: string;
          prefix?: string;
          suffix?: string;
          hideIfEmpty?: boolean;
          fontSize?: string;
          fontWeight?: string;
          fontStyle?: string;
          color?: string;
        }) => {
          const resolvedValue = replaceVariables(config.variable, data);

          if (
            config.hideIfEmpty !== false &&
            (!resolvedValue || resolvedValue.trim() === '')
          ) {
            return '';
          }

          const fieldFontSize = pick(config.fontSize, blockFontSize);
          const fieldColor = pick(config.color, blockColor);

          return `<div style="font-size:${fieldFontSize};font-weight:${config.fontWeight || 'normal'};color:${fieldColor};font-style:${config.fontStyle || 'normal'};">${escapeHtml(config.prefix || '')}${escapeHtml(resolvedValue)}${escapeHtml(config.suffix || '')}</div>`;
        }
      )
      .filter(Boolean)
      .join('');

    contentHtml = fieldsHtml || '<div>&nbsp;</div>';
  } else {
    const replacedContent = replaceVariables(content, data);
    contentHtml = escapeHtml(replacedContent);
  }

  // pre-line is only needed for the legacy `content` text path so '\n's render
  // as breaks. With per-field divs, each div is its own line box and pre-line
  // would render the inter-element whitespace as extra blank lines.
  const whiteSpaceRule = useFieldConfigs ? '' : 'white-space: pre-line;';

  return `
    <div style="${paddingStyle}">
      ${
        showTitle
          ? `<div style="font-family:${globals.fontFamilySecondary};font-size:${blockFontSize};font-weight:${titleFontWeight || 'bold'};color:${blockColor};margin-bottom:8px;">${escapeHtml(title)}</div>`
          : ''
      }
      <div style="font-size:${blockFontSize};line-height:${lineHeight || '1.5'};text-align:${align || 'left'};color:${blockColor};${whiteSpaceRule}">${contentHtml}</div>
    </div>
  `;
}

function renderInvoiceDetailsBlock(
  block: Block,
  data: InvoiceData | undefined,
  globals: GeneratorGlobals
): string {
  const {
    fieldConfigs,
    fontSize,
    lineHeight,
    align,
    color,
    labelColor,
    showLabels,
    padding,
    labelAlign,
    valueAlign,
    labelPadding,
    valuePadding,
    labelValueGap,
    rowSpacing,
    valueMinWidth,
  } = block.properties;
  const blockFontSize = pick(fontSize, globals.fontSize);
  const blockColor = pick(color, DEFAULT_VALUE_TEXT_COLOR, globals.primaryColor);
  const blockLabelColor = pick(
    labelColor,
    DEFAULT_LABEL_TEXT_COLOR,
    blockColor
  );
  const paddingStyle = padding ? `padding:${padding};` : '';

  // Match server-side rendering shape: two-column table (label | value).
  // When right-aligned, the table itself shrinks to fit-content and is
  // pushed to the right edge with margin-left:auto.
  const tableAlign =
    align === 'right' ? 'right' : align === 'center' ? 'center' : 'left';
  const tableWidth = tableAlign === 'left' ? '100%' : 'auto';
  const tableMargin =
    tableAlign === 'right'
      ? 'margin-left:auto;'
      : tableAlign === 'center'
        ? 'margin-left:auto;margin-right:auto;'
        : '';

  const colLabelAlign = labelAlign || 'right';
  const colValueAlign = valueAlign || 'right';
  const gap = ensurePx(labelValueGap) || '12px';
  const labelPadValue = ensurePx(labelPadding);
  const valuePadValue = ensurePx(valuePadding);
  const rowSpacingValue = ensurePx(rowSpacing);
  const valueMinWidthValue = ensurePx(valueMinWidth);
  const labelPadCss = labelPadValue
    ? `padding:${labelPadValue};padding-right:${gap};`
    : `padding:0;padding-right:${gap};`;
  const valuePadCss = valuePadValue ? `padding:${valuePadValue};` : 'padding:0;';
  const rowSpacingCss = rowSpacingValue ? `padding-bottom:${rowSpacingValue};` : '';
  const valueMinWidthCss = valueMinWidthValue ? `min-width:${valueMinWidthValue};` : '';

  const rowsHtml =
    fieldConfigs
      ?.map((field: FieldConfig) => {
        const displayValue = replaceVariables(field.variable, data);

        if (
          field.hideIfEmpty !== false &&
          (!displayValue || displayValue.trim() === '')
        ) {
          return '';
        }

        // Resolve per-cell typography. Prefer new labelStyle/valueStyle;
        // fall back to legacy flat fields, then block defaults.
        const ls = field.labelStyle;
        const vs = field.valueStyle;
        const labelFontSize = pick(ls?.fontSize, field.fontSize, blockFontSize);
        const labelFontWeight = ls?.fontWeight || field.fontWeight || 'normal';
        const labelFontStyle = ls?.fontStyle || field.fontStyle || 'normal';
        const labelTextColor = pick(ls?.color, field.color, blockLabelColor);

        const valueFontSize = pick(vs?.fontSize, field.fontSize, blockFontSize);
        const valueFontWeight = vs?.fontWeight || field.fontWeight || 'normal';
        const valueFontStyle = vs?.fontStyle || field.fontStyle || 'normal';
        const valueTextColor = pick(vs?.color, field.color, blockColor);

        // Label cell source: explicit field.label resolves via label
        // variables; fall back to prefix with the trailing ':' stripped.
        const labelSource =
          field.label || (field.prefix || '').replace(/:\s*$/, '');
        const labelText = data
          ? replaceLabelVariables(labelSource, t)
          : labelSource;
        const valueText = `${displayValue}${field.suffix || ''}`;

        const labelCellBase = `font-size:${labelFontSize};font-weight:${labelFontWeight};font-style:${labelFontStyle};`;
        const valueCellBase = `font-size:${valueFontSize};font-weight:${valueFontWeight};font-style:${valueFontStyle};`;

        const labelCell =
          showLabels !== false
            ? `<td style="${labelCellBase}color:${labelTextColor};${labelPadCss}${rowSpacingCss}white-space:nowrap;text-align:${colLabelAlign};">${escapeHtml(labelText)}</td>`
            : '';

        return `<tr>${labelCell}<td style="${valueCellBase}color:${valueTextColor};${valuePadCss}${rowSpacingCss}${valueMinWidthCss}text-align:${colValueAlign};">${escapeHtml(valueText)}</td></tr>`;
      })
      .filter(Boolean)
      .join('') || '';

  return `
    <div style="${paddingStyle}">
      <table style="border-collapse:collapse;width:${tableWidth};${tableMargin}font-size:${blockFontSize};line-height:${lineHeight || '1.5'};color:${blockColor};">
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>
  `;
}

function renderTableBlock(
  block: Block,
  previewData: InvoiceData | undefined,
  layoutData: InvoiceData,
  globals: GeneratorGlobals
): string {
  const {
    columns,
    headerBg,
    headerColor,
    headerFontWeight,
    fontSize,
    padding,
    rowBg,
    alternateRowBg,
    alternateRows,
    rowColor,
  } = block.properties;
  const tableFontSize = pick(fontSize, globals.fontSize);
  const resolvedRowTextColor = pick(rowColor, DEFAULT_VALUE_TEXT_COLOR);

  const borderResolved = resolveTableBorderProps(block.properties);
  const headerBorderCss = tableHeaderCellBorderCssFragments(borderResolved);

  // Generate header
  let headerHTML =
    '<thead><tr style="font-family: ' +
    globals.fontFamilySecondary +
    '; background: ' +
    headerBg +
    '; color: ' +
    headerColor +
    '; font-weight: ' +
    headerFontWeight +
    ';">';
  columns.forEach(
    (col: {
      id: string;
      header: string;
      align: string;
      width: string;
      field: string;
    }) => {
      headerHTML += `
      <th style="
        padding: ${padding};
        text-align: ${col.align};
        width: ${col.width};
        ${headerBorderCss}
      ">
        ${escapeHtml(col.header)}
      </th>
    `;
    }
  );
  headerHTML += '</tr></thead>';

  // Generate rows. In preview mode, iterate sample items and resolve values.
  // In save mode (no previewData), emit a single template row with literal
  // column-field tokens so the backend can substitute per-item.
  let rowsHTML = '<tbody>';
  const rowItems = previewData ? layoutData.line_items : [null];
  rowItems.forEach((item, index) => {
    const rowBackground =
      alternateRows && index % 2 === 1 ? alternateRowBg : rowBg;
    rowsHTML += `<tr style="background: ${rowBackground};">`;

    const cellBorderCss = tableBodyCellBorderCssFragments(
      borderResolved,
      index,
      columns.length
    );

    columns.forEach((col: { id: string; align: string; field: string }) => {
      const value = resolveVariable(col.field, item, previewData);
      rowsHTML += `
        <td style="
          padding: ${padding};
          text-align: ${col.align};
          color: ${resolvedRowTextColor};
          ${cellBorderCss}
        ">
          ${escapeHtml(value)}
        </td>
      `;
    });

    rowsHTML += '</tr>';
  });
  rowsHTML += '</tbody>';

  return `
    <div style="width: 100%; height: 100%; overflow: auto;">
      <table style="width: 100%; border-collapse: collapse; font-size: ${tableFontSize};">
        ${headerHTML}
        ${rowsHTML}
      </table>
    </div>
  `;
}

function renderTotalBlock(
  block: Block,
  data: InvoiceData | undefined,
  globals: GeneratorGlobals
): string {
  const {
    items,
    fontSize,
    align,
    labelAlign,
    valueAlign,
    labelColor,
    amountColor,
    totalFontSize,
    totalFontWeight,
    totalColor,
    balanceColor,
    spacing,
    padding,
    labelPadding,
    valuePadding,
    labelValueGap,
    valueMinWidth,
  } = block.properties;
  const totalsFontSize = pick(fontSize, globals.fontSize);
  const blockPaddingStyle = padding ? `padding:${padding};` : '';
  const totalsLabelColor = pick(
    labelColor,
    DEFAULT_LABEL_TEXT_COLOR,
    globals.primaryColor
  );
  const totalsAmountColor = pick(
    amountColor,
    DEFAULT_VALUE_TEXT_COLOR,
    globals.primaryColor
  );
  const colLabelAlign = labelAlign || 'right';
  const colValueAlign = valueAlign || 'right';

  // Use a table for proper label/value alignment
  const tableAlign =
    align === 'right'
      ? 'margin-left: auto;'
      : align === 'center'
        ? 'margin: 0 auto;'
        : '';
  const gap = ensurePx(labelValueGap) || '20px';
  const labelPaddingPx = ensurePx(labelPadding);
  const valuePaddingPx = ensurePx(valuePadding);
  const spacingPx = ensurePx(spacing);
  const valueMinWidthPx = ensurePx(valueMinWidth);
  const minWidthStyle = valueMinWidthPx ? `min-width: ${valueMinWidthPx};` : '';

  let html = `<div style="${blockPaddingStyle}"><table style="border-collapse: collapse; ${tableAlign}">`;
  html += '<tbody>';

  items.forEach(
      (item: {
        show: boolean;
        isTotal?: boolean;
        isBalance?: boolean;
        field: string;
        label: string;
        labelStyle?: { fontSize?: string; fontWeight?: string; fontStyle?: string; color?: string };
        valueStyle?: { fontSize?: string; fontWeight?: string; fontStyle?: string; color?: string };
        // Legacy flat fields - read-only fallback
        fontSize?: string;
        fontWeight?: string;
        color?: string;
        fontStyle?: string;
        amountColor?: string;
      }) => {
        const isTotal = item.isTotal;
        const isBalance = item.isBalance;
        const value = replaceVariables(item.field, data);

        // Per-cell typography. Prefer new label/valueStyle; fall back to
        // legacy flat fields, then row-type defaults.
        const ls = item.labelStyle;
        const vs = item.valueStyle;
        const rowDefaultFontSize = isTotal ? totalFontSize : totalsFontSize;
        const rowDefaultFontWeight = isTotal ? totalFontWeight : 'normal';
        const rowDefaultValueColor = isBalance
          ? pick(balanceColor, DEFAULT_VALUE_TEXT_COLOR)
          : isTotal
            ? pick(totalColor, DEFAULT_VALUE_TEXT_COLOR)
            : totalsAmountColor;
        const rowDefaultLabelColor = isTotal
          ? pick(totalColor, totalsLabelColor)
          : isBalance
            ? pick(balanceColor, totalsLabelColor)
            : totalsLabelColor;

        const labelFontSize = pick(ls?.fontSize, item.fontSize, rowDefaultFontSize);
        const labelFontWeight = ls?.fontWeight || item.fontWeight || rowDefaultFontWeight;
        const labelFontStyle = ls?.fontStyle || item.fontStyle || 'normal';
        const labelTextColor = ls?.color || item.color || rowDefaultLabelColor;

        const valueFontSize = pick(vs?.fontSize, item.fontSize, rowDefaultFontSize);
        const valueFontWeight = vs?.fontWeight || item.fontWeight || rowDefaultFontWeight;
        const valueFontStyle = vs?.fontStyle || item.fontStyle || 'normal';
        const valueTextColor = vs?.color || item.amountColor || rowDefaultValueColor;

        // Build label cell padding (user padding + gap on right)
        const labelPaddingStyle = labelPaddingPx
          ? `padding: ${labelPaddingPx}; padding-right: ${gap};`
          : `padding-right: ${gap}; padding-bottom: ${spacingPx || '0px'};`;

        // Build value cell padding
        const valuePaddingStyle = valuePaddingPx
          ? `padding: ${valuePaddingPx};`
          : `padding-bottom: ${spacingPx || '0px'};`;

        // Handle label variables - replace with friendly labels for preview
        let displayLabel = item.label;
        if (data) {
          // Preview mode: replace label variables with display labels using translations
          displayLabel = getSampleLabelValue(item.label, t);
        }
        // Save mode (no data): keep label variables for backend replacement

        html += `
        <tr>
          <td style="
            font-size: ${labelFontSize};
            font-weight: ${labelFontWeight};
            font-style: ${labelFontStyle};
            color: ${labelTextColor};
            ${labelPaddingStyle}
            text-align: ${colLabelAlign};
            white-space: nowrap;
          ">${escapeHtml(displayLabel)}:</td>
          <td style="
            font-size: ${valueFontSize};
            font-weight: ${valueFontWeight};
            font-style: ${valueFontStyle};
            color: ${valueTextColor};
            ${valuePaddingStyle}
            text-align: ${colValueAlign};
            white-space: nowrap;
            ${minWidthStyle}
          ">${value}</td>
        </tr>
      `;
      }
    );

  html += '</tbody></table></div>';

  // Paid stamp when document setting is on (company/template); production also gates on entity status
  if (globals.showPaidStamp) {
    html += `
      <div class="stamp is-paid" style="display: flex; justify-content: center; align-items: center; margin-top: 1rem;">
        PAID
      </div>
    `;
  }
  
  return html;
}

function renderDividerBlock(block: Block): string {
  const { thickness, color, style, marginTop, marginBottom } = block.properties;

  return `
    <hr style="
      border: none;
      border-top: ${thickness} ${style} ${color};
      margin-top: ${marginTop};
      margin-bottom: ${marginBottom};
    " />
  `;
}

function renderSpacerBlock(block: Block): string {
  const { height } = block.properties;
  return `<div style="height: ${height};"></div>`;
}

function renderQRCodeBlock(
  block: Block,
  _data: InvoiceData | undefined
): string {
  const { size, align } = block.properties;

  // For now, just show a placeholder
  // In production, you'd generate actual QR code SVG or use a service
  return `
    <div style="text-align: ${align};">
      <div style="
        width: ${size};
        height: ${size};
        background: #f3f4f6;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #e5e7eb;
      ">
        <span style="color: #9ca3af; font-size: 12px;">QR Code</span>
      </div>
    </div>
  `;
}

function renderSignatureBlock(
  block: Block,
  globals: GeneratorGlobals
): string {
  const { label, showLine, showDate, align, fontSize, color } =
    block.properties;
  const sigFontSize = pick(fontSize, globals.fontSize);
  const sigColor = pick(color, DEFAULT_VALUE_TEXT_COLOR, globals.primaryColor);

  return `
    <div style="text-align: ${align || 'left'};">
      <div style="margin-bottom: 40px;"></div>
      ${
        showLine
          ? `
        <div style="
          border-top: 1px solid #000;
          width: 200px;
          margin-bottom: 8px;
          display: ${align === 'center' ? 'inline-block' : 'block'};
        "></div>
      `
          : ''
      }
      <div style="font-size: ${sigFontSize}; color: ${sigColor};">
        ${escapeHtml(label)}
      </div>
      ${
        showDate
          ? `
        <div style="font-size: ${sigFontSize}; color: ${sigColor}; margin-top: 4px;">
          Date: ________________
        </div>
      `
          : ''
      }
    </div>
  `;
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (match) => htmlEscapes[match]);
}
