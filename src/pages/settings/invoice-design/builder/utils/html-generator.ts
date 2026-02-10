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
import { InvoiceData, replaceVariables, resolveVariable } from './variable-replacer';

/**
 * Generate complete HTML document from blocks using absolute positioning
 * This ensures WYSIWYG consistency between preview and PDF output
 */
export function generateInvoiceHTML(blocks: Block[], data: InvoiceData): string {
  // Sort blocks by Y position, then by X position for same row
  const sortedBlocks = [...blocks].sort((a, b) => {
    if (a.gridPosition.y !== b.gridPosition.y) {
      return a.gridPosition.y - b.gridPosition.y;
    }
    return a.gridPosition.x - b.gridPosition.x;
  });

  // Render blocks with absolute positioning based on grid coordinates
  const blocksHTML = sortedBlocks.map(block => renderBlock(block, data)).join('\n');
  
  // Extract containerPadding at function level to avoid scope issues
  const { rowHeight, margin, containerPadding } = GRID_CONFIG;
  
  // Calculate container height based on block positions
  let maxBottom = 0;
  if (blocks.length > 0) {
    blocks.forEach(block => {
      const { y, h } = block.gridPosition;
      const top = containerPadding[1] + (y * (rowHeight + margin[1]));
      const height = (h * rowHeight) + ((h - 1) * margin[1]);
      const bottom = top + height;
      if (bottom > maxBottom) {
        maxBottom = bottom;
      }
    });
    // Add bottom padding
    maxBottom += containerPadding[1];
  }
  // Ensure minimum A4 height
  const containerHeight = Math.max(maxBottom || 1122, 1122);
  
  // Extract values for template string to avoid scope issues
  // Defensive check to ensure GRID_CONFIG is properly defined
  if (!GRID_CONFIG || !GRID_CONFIG.containerPadding) {
    throw new Error('GRID_CONFIG.containerPadding is not defined. Please check grid-converter.ts');
  }
  
  const canvasWidth = GRID_CONFIG.canvasWidth;
  const containerPaddingVertical = GRID_CONFIG.containerPadding[1];
  const containerPaddingHorizontal = GRID_CONFIG.containerPadding[0];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${data.invoice.number}</title>
  <style>
    @page {
      size: A4;
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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
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
  </div>
</body>
</html>
  `.trim();
}


/**
 * Render a single block to HTML with absolute positioning based on grid coordinates
 * This ensures WYSIWYG consistency - blocks appear exactly where they are in the preview
 */
function renderBlock(block: Block, data: InvoiceData): string {
  const content = renderBlockContent(block, data);
  
  // Calculate absolute pixel positions based on grid coordinates
  // This matches exactly how react-grid-layout positions items
  const { x, y, w, h } = block.gridPosition;
  const { cols, rowHeight, canvasWidth, margin, containerPadding } = GRID_CONFIG;
  
  // Calculate column width
  const availableWidth = canvasWidth - (containerPadding[0] * 2);
  const colWidth = availableWidth / cols;
  
  // Calculate absolute positions
  // For x position: padding + (column index * column width) + (gaps between columns)
  // Column width already accounts for the space, so we just need: padding + (x * (colWidth + margin))
  const left = containerPadding[0] + (x * (colWidth + margin[0]));
  const top = containerPadding[1] + (y * (rowHeight + margin[1]));
  
  // Calculate dimensions
  // Width: (number of columns * column width) + (gaps between columns within the block)
  const width = (w * colWidth) + ((w - 1) * margin[0]);
  const height = (h * rowHeight) + ((h - 1) * margin[1]);
  
  // Ensure blocks never exceed container bounds
  const maxLeft = containerPadding[0];
  const maxRight = canvasWidth - containerPadding[0];
  const constrainedLeft = Math.max(maxLeft, Math.min(left, maxRight - width));
  const constrainedWidth = Math.min(width, maxRight - constrainedLeft);
  
  // For expandable blocks (tables, totals), allow content to grow
  const isExpandableBlock = block.type === 'table' || block.type === 'total';
  const heightStyle = isExpandableBlock 
    ? `min-height: ${height}px;` 
    : `height: ${height}px;`;
  
  const styles = `
    position: absolute;
    left: ${constrainedLeft}px;
    top: ${top}px;
    width: ${constrainedWidth}px;
    ${heightStyle}
    box-sizing: border-box;
  `.trim().replace(/\s+/g, ' ');

  return `<div class="block" style="${styles}">${content}</div>`;
}

/**
 * Render block content based on type
 */
function renderBlockContent(block: Block, data: InvoiceData): string {
  switch (block.type) {
    case 'text':
      return renderTextBlock(block, data);
    case 'logo':
    case 'image':
      return renderImageBlock(block, data);
    case 'company-info':
      return renderCompanyInfoBlock(block, data);
    case 'client-info':
      return renderClientInfoBlock(block, data);
    case 'invoice-details':
      return renderInvoiceDetailsBlock(block, data);
    case 'table':
      return renderTableBlock(block, data);
    case 'total':
      return renderTotalBlock(block, data);
    case 'divider':
      return renderDividerBlock(block);
    case 'spacer':
      return renderSpacerBlock(block);
    case 'qrcode':
      return renderQRCodeBlock(block, data);
    case 'signature':
      return renderSignatureBlock(block);
    default:
      return `<div style="padding: 10px; color: #999;">Unknown block type: ${block.type}</div>`;
  }
}

function renderTextBlock(block: Block, data: InvoiceData): string {
  const { content, fontSize, fontWeight, color, align, lineHeight } = block.properties;
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

function renderImageBlock(block: Block, data: InvoiceData): string {
  const { source, align, maxWidth, objectFit } = block.properties;
  const resolvedSource = replaceVariables(source, data);

  if (!resolvedSource) {
    return `<div style="width: 100%; height: 100%; background: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 12px;">
      ${block.type === 'logo' ? 'Company Logo' : 'Image'}
    </div>`;
  }

  // Map text alignment to flexbox justify-content
  const justifyContent = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
  
  return `
    <div style="text-align: ${align}; height: 100%; display: flex; align-items: center; justify-content: ${justifyContent};">
      <img src="${escapeHtml(resolvedSource)}" style="max-width: ${maxWidth}; max-height: 100%; object-fit: ${objectFit};" alt="${block.type}" />
    </div>
  `;
}

function renderCompanyInfoBlock(block: Block, data: InvoiceData): string {
  const { content, fontSize, lineHeight, align, color } = block.properties;
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

function renderClientInfoBlock(block: Block, data: InvoiceData): string {
  const { content, fontSize, lineHeight, align, color, showTitle, title, titleFontWeight } = block.properties;
  const replacedContent = replaceVariables(content, data);

  return `
    <div>
      ${showTitle ? `
        <div style="
          font-size: ${fontSize};
          font-weight: ${titleFontWeight};
          color: ${color};
          margin-bottom: 8px;
        ">
          ${escapeHtml(title)}
        </div>
      ` : ''}
      <div style="
        font-size: ${fontSize};
        line-height: ${lineHeight};
        text-align: ${align};
        color: ${color};
        white-space: pre-line;
      ">
        ${escapeHtml(replacedContent)}
      </div>
    </div>
  `;
}

function renderInvoiceDetailsBlock(block: Block, data: InvoiceData): string {
  const { content, fontSize, lineHeight, align, color } = block.properties;
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

function renderTableBlock(block: Block, data: InvoiceData): string {
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
  let headerHTML = '<thead><tr style="background: ' + headerBg + '; color: ' + headerColor + '; font-weight: ' + headerFontWeight + ';">';
  columns.forEach((col: { id: string; header: string; align: string; width: string; field: string }) => {
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
  });
  headerHTML += '</tr></thead>';

  // Generate rows
  let rowsHTML = '<tbody>';
  data.line_items.forEach((item, index) => {
    const rowBackground = alternateRows && index % 2 === 1 ? alternateRowBg : rowBg;
    rowsHTML += `<tr style="background: ${rowBackground};">`;

    columns.forEach((col: { id: string; align: string; field: string }) => {
      const value = resolveVariable(col.field, item, data);
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

function renderTotalBlock(block: Block, data: InvoiceData): string {
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
  const tableAlign = align === 'right' ? 'margin-left: auto;' : 
                     align === 'center' ? 'margin: 0 auto;' : '';
  const gap = labelValueGap || '20px';
  const minWidthStyle = valueMinWidth ? `min-width: ${valueMinWidth};` : '';

  let html = `<table style="border-collapse: collapse; ${tableAlign}">`;
  html += '<tbody>';

  items
    .filter((item: { show: boolean }) => item.show)
    .forEach((item: { 
      show: boolean; 
      isTotal?: boolean; 
      isBalance?: boolean; 
      field: string; 
      label: string 
    }) => {
      const isTotal = item.isTotal;
      const isBalance = item.isBalance;
      const value = replaceVariables(item.field, data);
      const itemFontSize = isTotal ? totalFontSize : fontSize;
      const itemFontWeight = isTotal ? totalFontWeight : 'normal';
      const valueColor = isBalance ? balanceColor : isTotal ? totalColor : amountColor;

      // Build label cell padding (user padding + gap on right)
      const labelPaddingStyle = labelPadding 
        ? `padding: ${labelPadding}; padding-right: ${gap};`
        : `padding-right: ${gap}; padding-bottom: ${spacing};`;

      // Build value cell padding
      const valuePaddingStyle = valuePadding
        ? `padding: ${valuePadding};`
        : `padding-bottom: ${spacing};`;

      html += `
        <tr style="font-size: ${itemFontSize}; font-weight: ${itemFontWeight};">
          <td style="
            color: ${labelColor};
            ${labelPaddingStyle}
            text-align: right;
            white-space: nowrap;
          ">${escapeHtml(item.label)}:</td>
          <td style="
            color: ${valueColor};
            ${valuePaddingStyle}
            text-align: right;
            white-space: nowrap;
            ${minWidthStyle}
          ">${value}</td>
        </tr>
      `;
    });

  html += '</tbody></table>';
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

function renderQRCodeBlock(block: Block, data: InvoiceData): string {
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
  const { label, showLine, showDate, align, fontSize, color } = block.properties;

  return `
    <div style="text-align: ${align};">
      <div style="margin-bottom: 40px;"></div>
      ${showLine ? `
        <div style="
          border-top: 1px solid #000;
          width: 200px;
          margin-bottom: 8px;
          display: ${align === 'center' ? 'inline-block' : 'block'};
        "></div>
      ` : ''}
      <div style="font-size: ${fontSize}; color: ${color};">
        ${escapeHtml(label)}
      </div>
      ${showDate ? `
        <div style="font-size: ${fontSize}; color: ${color}; margin-top: 4px;">
          Date: ________________
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
