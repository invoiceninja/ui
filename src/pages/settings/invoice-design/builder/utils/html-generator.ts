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
 * Generate complete HTML document from blocks using flow-based layout
 * This ensures content can grow and push other elements down naturally
 */
export function generateInvoiceHTML(blocks: Block[], data: InvoiceData): string {
  // Sort blocks by Y position, then by X position for same row
  const sortedBlocks = [...blocks].sort((a, b) => {
    if (a.gridPosition.y !== b.gridPosition.y) {
      return a.gridPosition.y - b.gridPosition.y;
    }
    return a.gridPosition.x - b.gridPosition.x;
  });

  // Group blocks into rows based on Y position
  const rows = groupBlocksIntoRows(sortedBlocks);
  const rowsHTML = rows.map(row => renderRow(row, data)).join('\n');

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

    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .invoice-container {
      width: ${GRID_CONFIG.canvasWidth}px;
      background: white;
      margin: 0 auto;
      padding: ${GRID_CONFIG.containerPadding[1]}px ${GRID_CONFIG.containerPadding[0]}px;
    }

    .row {
      display: flex;
      flex-wrap: nowrap;
      margin-bottom: ${GRID_CONFIG.margin[1]}px;
      width: 100%;
    }

    .block {
      flex-shrink: 0;
      min-height: 0; /* Allow content to determine height */
      overflow: visible; /* Allow content to show fully */
      box-sizing: border-box;
    }

    /* Full-width blocks should not have margins */
    .block.full-width {
      width: 100% !important;
      margin: 0;
    }

    /* Tables should not be constrained */
    .block table {
      width: 100%;
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
    ${rowsHTML}
  </div>
</body>
</html>
  `.trim();
}

/**
 * Group blocks into rows based on similar Y positions
 */
function groupBlocksIntoRows(blocks: Block[]): Block[][] {
  const rows: Block[][] = [];
  let currentRow: Block[] = [];
  let currentY = -1;

  for (const block of blocks) {
    // If this block is on a new row (different Y position with some tolerance)
    if (currentY === -1 || Math.abs(block.gridPosition.y - currentY) >= 1) {
      if (currentRow.length > 0) {
        rows.push(currentRow);
      }
      currentRow = [block];
      currentY = block.gridPosition.y;
    } else {
      // Same row
      currentRow.push(block);
    }
  }

  // Don't forget the last row
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return rows;
}

/**
 * Render a row of blocks
 */
function renderRow(blocks: Block[], data: InvoiceData): string {
  const blocksHTML = blocks.map(block => renderBlock(block, data)).join('\n');
  
  // For rows with multiple blocks, add gap styling
  const rowStyle = blocks.length > 1 
    ? `gap: ${GRID_CONFIG.margin[0]}px;` 
    : '';
  
  return `<div class="row" style="${rowStyle}">${blocksHTML}</div>`;
}

/**
 * Render a single block to HTML with flow-based layout
 */
function renderBlock(block: Block, data: InvoiceData): string {
  const content = renderBlockContent(block, data);
  
  // Calculate width as percentage of available space (12 columns)
  const widthPercent = (block.gridPosition.w / GRID_CONFIG.cols) * 100;
  const isFullWidth = block.gridPosition.w === GRID_CONFIG.cols;
  
  // Calculate minimum height from grid (but allow content to grow)
  const minHeight = block.gridPosition.h * GRID_CONFIG.rowHeight;
  
  // Full-width blocks don't need margin adjustments
  const widthStyle = isFullWidth 
    ? 'width: 100%' 
    : `width: ${widthPercent}%`;
  
  const className = isFullWidth ? 'block full-width' : 'block';
  const styles = `${widthStyle}; min-height: ${minHeight}px;`;

  return `<div class="${className}" style="${styles}">${content}</div>`;
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

  return `
    <div style="text-align: ${align}; height: 100%; display: flex; align-items: center; justify-content: ${align};">
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
  columns.forEach((col: any) => {
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

    columns.forEach((col: any) => {
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
  } = block.properties;

  let html = `<div style="text-align: ${align};">`;

  items
    .filter((item: any) => item.show)
    .forEach((item: any) => {
      const isTotal = item.isTotal;
      const isBalance = item.isBalance;
      const value = replaceVariables(item.field, data);

      html += `
        <div style="
          display: flex;
          justify-content: flex-end;
          gap: 20px;
          margin-bottom: ${spacing};
          font-size: ${isTotal ? totalFontSize : fontSize};
          font-weight: ${isTotal ? totalFontWeight : 'normal'};
        ">
          <span style="color: ${labelColor};">${escapeHtml(item.label)}:</span>
          <span style="
            color: ${isBalance ? balanceColor : isTotal ? totalColor : amountColor};
            min-width: 100px;
            text-align: right;
          ">
            ${value}
          </span>
        </div>
      `;
    });

  html += '</div>';
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
