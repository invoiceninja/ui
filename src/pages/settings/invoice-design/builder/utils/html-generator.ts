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
 * Estimate content height for a block based on its type and properties
 */
function estimateContentHeight(block: Block, data: InvoiceData): number {
  const { rowHeight } = GRID_CONFIG;
  const minHeight = rowHeight; // Minimum height for any block

  switch (block.type) {
    case 'text': {
      const { content, fontSize, lineHeight } = block.properties;
      const replacedContent = replaceVariables(content, data);
      const fontSizeNum = parseFloat(fontSize) || 16;
      const lineHeightNum = parseFloat(lineHeight) || 1.5;
      const lines = replacedContent.split('\n').length || 1;
      const estimatedHeight = lines * fontSizeNum * lineHeightNum;
      return Math.max(estimatedHeight, minHeight);
    }

    case 'logo':
    case 'image': {
      const { maxHeight } = block.properties;
      // Use maxHeight if specified, otherwise use a reasonable default
      if (maxHeight && typeof maxHeight === 'string') {
        const heightNum = parseFloat(maxHeight);
        if (!isNaN(heightNum)) {
          return Math.max(heightNum, minHeight);
        }
      }
      // Default image height
      return Math.max(100, minHeight);
    }

    case 'company-info':
    case 'client-info':
    case 'client-shipping-info':
    case 'invoice-details': {
      const { fieldConfigs, content, fontSize, lineHeight } = block.properties;
      const fontSizeNum = parseFloat(fontSize) || 14;
      const lineHeightNum = parseFloat(lineHeight) || 1.5;

      let lines: number;

      if (
        fieldConfigs &&
        Array.isArray(fieldConfigs) &&
        fieldConfigs.length > 0
      ) {
        let visibleCount = 0;
        fieldConfigs.forEach(
          (config: { variable: string; hideIfEmpty?: boolean }) => {
            const resolvedValue = replaceVariables(config.variable, data);
            if (
              config.hideIfEmpty !== false &&
              (!resolvedValue || resolvedValue.trim() === '')
            ) {
              return;
            }
            visibleCount++;
          }
        );
        lines = visibleCount || 1;
      } else {
        const replacedContent = replaceVariables(content, data);
        lines =
          replacedContent.split('\n').filter((line) => line.trim()).length || 1;
      }

      const estimatedHeight = lines * fontSizeNum * lineHeightNum + 20; // Add padding
      return Math.max(estimatedHeight, minHeight);
    }

    case 'table': {
      const headerHeight = 40; // Header row
      const rowHeight = 30; // Data row height
      const rowCount = data.line_items.length || 1;
      const estimatedHeight = headerHeight + rowCount * rowHeight + 10; // Add padding
      return Math.max(estimatedHeight, minHeight);
    }

    case 'total': {
      const { items } = block.properties;
      const itemCount = Array.isArray(items) ? items.length : 5;
      const itemHeight = 25;
      const estimatedHeight = itemCount * itemHeight + 20; // Add padding
      return Math.max(estimatedHeight, minHeight);
    }

    case 'divider': {
      const { thickness, marginTop, marginBottom } = block.properties;
      const thicknessNum = parseFloat(thickness) || 1;
      const marginTopNum = parseFloat(marginTop) || 0;
      const marginBottomNum = parseFloat(marginBottom) || 0;
      return thicknessNum + marginTopNum + marginBottomNum;
    }

    case 'spacer': {
      const { height } = block.properties;
      if (height && typeof height === 'string') {
        const heightNum = parseFloat(height);
        if (!isNaN(heightNum)) {
          return heightNum;
        }
      }
      return minHeight;
    }

    case 'qrcode':
    case 'signature': {
      // Default sizes for QR code and signature
      return Math.max(100, minHeight);
    }

    default:
      return minHeight;
  }
}

/**
 * Calculate row heights based on the tallest content in each row
 */
function calculateRowHeights(
  rows: Map<number, Block[]>,
  data: InvoiceData
): Map<number, number> {
  const rowHeights = new Map<number, number>();
  const { margin } = GRID_CONFIG;

  rows.forEach((blocks, y) => {
    // Find the maximum content height among all blocks in this row
    const maxContentHeight = Math.max(
      ...blocks.map((block) => estimateContentHeight(block, data))
    );

    // Store the row height (content height + vertical margin if not first row)
    rowHeights.set(y, maxContentHeight);
  });

  return rowHeights;
}

/**
 * Calculate cumulative top positions for each row
 */
function calculateRowPositions(
  rowHeights: Map<number, number>
): Map<number, number> {
  const rowPositions = new Map<number, number>();
  const { containerPadding, margin } = GRID_CONFIG;

  let currentTop = containerPadding[1];
  const sortedRows = Array.from(rowHeights.keys()).sort((a, b) => a - b);

  sortedRows.forEach((y, index) => {
    rowPositions.set(y, currentTop);

    // Move to next row: current row height + margin
    const rowHeight = rowHeights.get(y) || GRID_CONFIG.rowHeight;
    if (index < sortedRows.length - 1) {
      // Add margin between rows (except after last row)
      currentTop += rowHeight + margin[1];
    } else {
      currentTop += rowHeight;
    }
  });

  return rowPositions;
}

/**
 * Generate complete HTML document from blocks using row-based height calculation
 * This ensures content-driven heights and eliminates wasted vertical space
 */
export function generateInvoiceHTML(
  blocks: Block[],
  previewData?: InvoiceData,
  designSettings?: {
    page_size?: string;
    primary_font?: string;
    font_size?: number;
    primary_color?: string;
    secondary_color?: string;
    show_paid_stamp?: boolean;
    page_numbering?: boolean;
  }
): string {
  // Layout/height calculations always need a concrete data shape.
  // Variable substitution is gated on previewData — when absent, tokens stay literal.
  const layoutData = previewData || SAMPLE_INVOICE_DATA;
  
  const fontStack = `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
  const fontSize = designSettings?.font_size || 16;
  const primaryColor = designSettings?.primary_color || '#374151';
  const secondaryColor = designSettings?.secondary_color || '#6B7280';
  const pageSize = designSettings?.page_size || 'A4';

  // Sort blocks by Y position, then by X position for same row
  const sortedBlocks = [...blocks].sort((a, b) => {
    if (a.gridPosition.y !== b.gridPosition.y) {
      return a.gridPosition.y - b.gridPosition.y;
    }
    return a.gridPosition.x - b.gridPosition.x;
  });

  // Group blocks by row and calculate row-based heights
  const rows = groupBlocksByRow(blocks);
  const rowHeights = calculateRowHeights(rows, layoutData);
  const rowPositions = calculateRowPositions(rowHeights);

  // Render blocks with row-based positioning
  const blocksHTML = sortedBlocks
    .map((block) =>
      renderBlockWithRowHeight(
        block,
        previewData,
        layoutData,
        rowHeights,
        rowPositions
      )
    )
    .join('\n');

  // Extract containerPadding at function level to avoid scope issues
  const { margin, containerPadding } = GRID_CONFIG;

  // Calculate container height based on row positions
  let maxBottom = 0;
  if (rowPositions.size > 0) {
    const sortedYPositions = Array.from(rowPositions.keys()).sort(
      (a, b) => b - a
    );
    const lastRowY = sortedYPositions[0];
    const lastRowTop = rowPositions.get(lastRowY) || containerPadding[1];
    const lastRowHeight = rowHeights.get(lastRowY) || GRID_CONFIG.rowHeight;
    maxBottom = lastRowTop + lastRowHeight;
  } else {
    maxBottom = containerPadding[1];
  }

  // Add bottom padding
  maxBottom += containerPadding[1];

  // Ensure minimum A4 height
  const containerHeight = Math.max(maxBottom || 1122, 1122);

  // Extract values for template string to avoid scope issues
  // Defensive check to ensure GRID_CONFIG is properly defined
  if (!GRID_CONFIG || !GRID_CONFIG.containerPadding) {
    throw new Error(
      'GRID_CONFIG.containerPadding is not defined. Please check grid-converter.ts'
    );
  }

  const canvasWidth = GRID_CONFIG.canvasWidth;
  const containerPaddingVertical = GRID_CONFIG.containerPadding[1];
  const containerPaddingHorizontal = GRID_CONFIG.containerPadding[0];

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
      font-family: ${fontStack};
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
      padding: ${containerPaddingVertical}px ${containerPaddingHorizontal}px;
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
 * Render a single block to HTML with row-based height calculation
 * This ensures content-driven heights and proper row alignment
 */
function renderBlockWithRowHeight(
  block: Block,
  previewData: InvoiceData | undefined,
  layoutData: InvoiceData,
  rowHeights: Map<number, number>,
  rowPositions: Map<number, number>
): string {
  const content = renderBlockContent(block, previewData, layoutData);

  // Calculate absolute pixel positions based on grid coordinates
  const { x, y, w } = block.gridPosition;
  const { cols, canvasWidth, margin, containerPadding } = GRID_CONFIG;

  // Calculate column width
  const availableWidth = canvasWidth - containerPadding[0] * 2;
  const colWidth = availableWidth / cols;

  // Calculate horizontal position
  const left = containerPadding[0] + x * (colWidth + margin[0]);

  // Calculate width
  const width = w * colWidth + (w - 1) * margin[0];

  // Get row-based position and height
  const top = rowPositions.get(y) || containerPadding[1];
  const rowHeight = rowHeights.get(y) || GRID_CONFIG.rowHeight;

  // Ensure blocks never exceed container bounds
  const maxLeft = containerPadding[0];
  const maxRight = canvasWidth - containerPadding[0];
  const constrainedLeft = Math.max(maxLeft, Math.min(left, maxRight - width));
  const constrainedWidth = Math.min(width, maxRight - constrainedLeft);

  // For expandable blocks (tables, totals), allow content to grow beyond row height
  const isExpandableBlock = block.type === 'table' || block.type === 'total';
  const heightStyle = isExpandableBlock
    ? `min-height: ${rowHeight}px;`
    : `height: ${rowHeight}px;`;

  const styles = `
    position: absolute;
    left: ${constrainedLeft}px;
    top: ${top}px;
    width: ${constrainedWidth}px;
    ${heightStyle}
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
  layoutData: InvoiceData
): string {
  switch (block.type) {
    case 'text':
      return renderTextBlock(block, previewData);
    case 'logo':
    case 'image':
      return renderImageBlock(block, previewData);
    case 'company-info':
      return renderCompanyInfoBlock(block, previewData);
    case 'client-info':
    case 'client-shipping-info':
      return renderClientInfoBlock(block, previewData);
    case 'invoice-details':
      return renderInvoiceDetailsBlock(block, previewData);
    case 'table':
      return renderTableBlock(block, previewData, layoutData);
    case 'total':
      return renderTotalBlock(block, previewData);
    case 'divider':
      return renderDividerBlock(block);
    case 'spacer':
      return renderSpacerBlock(block);
    case 'qrcode':
      return renderQRCodeBlock(block, previewData);
    case 'signature':
      return renderSignatureBlock(block);
    default:
      return `<div style="padding: 10px; color: #999;">Unknown block type: ${block.type}</div>`;
  }
}

function renderTextBlock(block: Block, data: InvoiceData | undefined): string {
  const { content, fontSize, fontWeight, color, align, lineHeight } =
    block.properties;
  const replacedContent = replaceVariables(content, data);

  return `
    <div style="
      font-size: ${fontSize};
      font-weight: ${fontWeight};
      color: ${color};
      text-align: ${align};
      line-height: ${lineHeight};
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
  data: InvoiceData | undefined
): string {
  const { fieldConfigs, content, fontSize, lineHeight, align, color } =
    block.properties;

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

          const fieldFontSize = config.fontSize || fontSize;
          const fieldColor = config.color || color;

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
        font-size: ${fontSize};
        line-height: ${lineHeight};
        text-align: ${align};
        color: ${color};
      ">
        ${fieldsHtml}
      </div>
    `;
  }

  const replacedContent = replaceVariables(content, data);

  return `
    <div style="
      font-size: ${fontSize};
      line-height: ${lineHeight};
      text-align: ${align};
      color: ${color};
      white-space: pre-line;
    ">
      ${escapeHtml(replacedContent)}
    </div>
  `;
}

function renderClientInfoBlock(
  block: Block,
  data: InvoiceData | undefined
): string {
  const {
    fieldConfigs,
    content,
    fontSize,
    lineHeight,
    align,
    color,
    showTitle,
    title,
    titleFontWeight,
  } = block.properties;

  let contentHtml = '';

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

          const fieldFontSize = config.fontSize || fontSize;
          const fieldColor = config.color || color;

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

    contentHtml = fieldsHtml || '<div>&nbsp;</div>';
  } else {
    const replacedContent = replaceVariables(content, data);
    contentHtml = escapeHtml(replacedContent);
  }

  return `
    <div>
      ${
        showTitle
          ? `
        <div style="
          font-size: ${fontSize};
          font-weight: ${titleFontWeight};
          color: ${color};
          margin-bottom: 8px;
        ">
          ${escapeHtml(title)}
        </div>
      `
          : ''
      }
      <div style="
        font-size: ${fontSize};
        line-height: ${lineHeight};
        text-align: ${align};
        color: ${color};
        white-space: pre-line;
      ">
        ${contentHtml}
      </div>
    </div>
  `;
}

function renderInvoiceDetailsBlock(
  block: Block,
  data: InvoiceData | undefined
): string {
  const { fieldConfigs, fontSize, lineHeight, align, color, showLabels } =
    block.properties;

  const fieldsHtml =
    fieldConfigs
      ?.map((field: FieldConfig) => {
        const displayValue = replaceVariables(field.variable, data);

        if (
          field.hideIfEmpty !== false &&
          (!displayValue || displayValue.trim() === '')
        ) {
          return '';
        }

        const fieldFontSize = field.fontSize || fontSize;
        const fieldColor = field.color || color;
        
        // Handle label variable replacement in prefix/suffix
        const prefix = (showLabels !== false && field.prefix)
          ? (data ? replaceLabelVariables(field.prefix, t) : field.prefix)
          : '';
        const suffix = field.suffix || '';

        return `
        <div style="
          font-size: ${fieldFontSize};
          font-weight: ${field.fontWeight || 'normal'};
          color: ${fieldColor};
          font-style: ${field.fontStyle || 'normal'};
        ">
          ${escapeHtml(prefix)}${escapeHtml(displayValue)}${escapeHtml(suffix)}
        </div>
      `;
      })
      .join('\n') || '';

  return `
    <div style="
      font-size: ${fontSize};
      line-height: ${lineHeight};
      text-align: ${align};
      color: ${color};
    ">
      ${fieldsHtml}
    </div>
  `;
}

function renderTableBlock(
  block: Block,
  previewData: InvoiceData | undefined,
  layoutData: InvoiceData
): string {
  const {
    columns,
    headerBg,
    headerColor,
    headerFontWeight,
    borderColor,
    fontSize,
    padding,
    showBorders,
    rowBg,
    alternateRowBg,
    alternateRows,
  } = block.properties;

  const borderStyle = showBorders ? `1px solid ${borderColor}` : 'none';

  // Generate header
  let headerHTML =
    '<thead><tr style="background: ' +
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
        border: ${borderStyle};
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

    columns.forEach((col: { id: string; align: string; field: string }) => {
      const value = resolveVariable(col.field, item, previewData);
      rowsHTML += `
        <td style="
          padding: ${padding};
          text-align: ${col.align};
          border: ${borderStyle};
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
      <table style="width: 100%; border-collapse: collapse; font-size: ${fontSize};">
        ${headerHTML}
        ${rowsHTML}
      </table>
    </div>
  `;
}

function renderTotalBlock(
  block: Block,
  data: InvoiceData | undefined
): string {
  const {
    items,
    fontSize,
    align,
    labelColor,
    amountColor,
    totalFontSize,
    totalFontWeight,
    totalColor,
    balanceColor,
    spacing,
    labelPadding,
    valuePadding,
    labelValueGap,
    valueMinWidth,
  } = block.properties;

  // Use a table for proper label/value alignment
  const tableAlign =
    align === 'right'
      ? 'margin-left: auto;'
      : align === 'center'
        ? 'margin: 0 auto;'
        : '';
  const gap = labelValueGap || '20px';
  const minWidthStyle = valueMinWidth ? `min-width: ${valueMinWidth};` : '';

  let html = `<table style="border-collapse: collapse; ${tableAlign}">`;
  html += '<tbody>';

  items.forEach(
      (item: {
        show: boolean;
        isTotal?: boolean;
        isBalance?: boolean;
        field: string;
        label: string;
        fontSize?: string;
        fontWeight?: string;
        color?: string;
        fontStyle?: string;
        amountColor?: string;
      }) => {
        const isTotal = item.isTotal;
        const isBalance = item.isBalance;
        const value = replaceVariables(item.field, data);
        const itemFontSize = item.fontSize || (isTotal ? totalFontSize : fontSize);
        const itemFontWeight = item.fontWeight || (isTotal ? totalFontWeight : 'normal');
        const itemLabelColor = item.color || labelColor;
        const valueColor = item.amountColor || (isBalance
          ? balanceColor
          : isTotal
            ? totalColor
            : amountColor);

        // Build label cell padding (user padding + gap on right)
        const labelPaddingStyle = labelPadding
          ? `padding: ${labelPadding}; padding-right: ${gap};`
          : `padding-right: ${gap}; padding-bottom: ${spacing};`;

        // Build value cell padding
        const valuePaddingStyle = valuePadding
          ? `padding: ${valuePadding};`
          : `padding-bottom: ${spacing};`;

        // Handle label variables - replace with friendly labels for preview
        let displayLabel = item.label;
        if (data) {
          // Preview mode: replace label variables with display labels using translations
          displayLabel = getSampleLabelValue(item.label, t);
        }
        // Save mode (no data): keep label variables for backend replacement

        html += `
        <tr style="font-size: ${itemFontSize}; font-weight: ${itemFontWeight};">
          <td style="
            color: ${itemLabelColor};
            ${labelPaddingStyle}
            text-align: right;
            white-space: nowrap;
          ">${escapeHtml(displayLabel)}:</td>
          <td style="
            color: ${valueColor};
            ${valuePaddingStyle}
            text-align: right;
            white-space: nowrap;
            ${minWidthStyle}
          ">${value}</td>
        </tr>
      `;
      }
    );

  html += '</tbody></table>';
  
  // Add paid stamp if enabled for this block and invoice is in paid/cancelled status
  // For preview, we simulate a paid status to show the stamp
  if (block.properties.showPaidStamp) {
    // In production, this would check: entity.status_id in [4, 5] && settings.show_paid_stamp
    // For preview mode, we show the stamp to demonstrate the design
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

function renderSignatureBlock(block: Block): string {
  const { label, showLine, showDate, align, fontSize, color } =
    block.properties;

  return `
    <div style="text-align: ${align};">
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
      <div style="font-size: ${fontSize}; color: ${color};">
        ${escapeHtml(label)}
      </div>
      ${
        showDate
          ? `
        <div style="font-size: ${fontSize}; color: ${color}; margin-top: 4px;">
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
