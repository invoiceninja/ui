/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import type {
  BlockDefinition,
  BlockProperties,
  BlockType,
  FieldConfig,
} from '../types';
import { GRID_CONFIG } from './grid-converter';
import { SAMPLE_INVOICE_DATA, replaceVariables } from './variable-replacer';

const EDITOR_TOPBAR_HEIGHT = 28;
const EDITOR_CONTENT_PADDING_X = 24;
const EDITOR_CONTENT_PADDING_Y = 24;
const SIZE_BUFFER = 4;
const AVERAGE_CHARACTER_WIDTH = 0.55;

interface ContentSize {
  width: number;
  height: number;
  fullWidth?: boolean;
}

interface GridSize {
  w: number;
  h: number;
}

const FALLBACK_GRID_SIZES: Record<BlockType, GridSize> = {
  logo: { w: 4, h: 4 },
  image: { w: 3, h: 3 },
  text: { w: 6, h: 2 },
  'company-info': { w: 6, h: 4 },
  'client-info': { w: 6, h: 4 },
  'client-shipping-info': { w: 6, h: 4 },
  'invoice-details': { w: 6, h: 5 },
  'public-notes': { w: 12, h: 3 },
  footer: { w: 12, h: 2 },
  terms: { w: 12, h: 3 },
  table: { w: 12, h: 8 },
  'tasks-table': { w: 12, h: 8 },
  total: { w: 6, h: 6 },
  divider: { w: 12, h: 1 },
  spacer: { w: 12, h: 2 },
  qrcode: { w: 2, h: 2 },
  signature: { w: 4, h: 3 },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function parseCssNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  const parsed = parseFloat(String(value ?? ''));

  return Number.isFinite(parsed) ? parsed : fallback;
}

function lineHeightPixels(lineHeight: unknown, fontSize: number): number {
  if (!lineHeight) {
    return fontSize * 1.4;
  }

  const lineHeightString = String(lineHeight);
  const parsed = parseFloat(lineHeightString);

  if (!Number.isFinite(parsed)) {
    return fontSize * 1.4;
  }

  if (lineHeightString.includes('px')) {
    return parsed;
  }

  if (lineHeightString.includes('%')) {
    return fontSize * (parsed / 100);
  }

  return fontSize * parsed;
}

function columnWidth(): number {
  const { canvasWidth, cols, margin, containerPadding } = GRID_CONFIG;

  return (
    (canvasWidth - containerPadding[0] * 2 - margin[0] * (cols - 1)) / cols
  );
}

function widthForGridUnits(w: number): number {
  const colWidth = columnWidth();
  const marginX = GRID_CONFIG.margin[0];

  return colWidth * w + marginX * (w - 1);
}

function gridWidthForPixels(width: number): number {
  const colWidth = columnWidth();
  const marginX = GRID_CONFIG.margin[0];
  const gridWidth = Math.ceil((width + marginX) / (colWidth + marginX));

  return clamp(gridWidth, 1, GRID_CONFIG.cols);
}

function gridHeightForPixels(height: number): number {
  const rowHeight = GRID_CONFIG.rowHeight;
  const marginY = GRID_CONFIG.margin[1];

  return Math.max(1, Math.ceil((height + marginY) / (rowHeight + marginY)));
}

function textWidth(text: string, fontSize: number): number {
  return text.length * fontSize * AVERAGE_CHARACTER_WIDTH;
}

function wrappedLineCount(
  lines: string[],
  fontSize: number,
  availableWidth: number
): number {
  const usableWidth = Math.max(availableWidth, fontSize * 4);

  return lines.reduce((count, line) => {
    const lineWidth = textWidth(line || ' ', fontSize);

    return count + Math.max(1, Math.ceil(lineWidth / usableWidth));
  }, 0);
}

function textContentSize(
  text: string,
  properties: BlockProperties,
  fallbackFontSize = 12
): ContentSize {
  const fontSize = parseCssNumber(properties.fontSize, fallbackFontSize);
  const lineHeight = lineHeightPixels(properties.lineHeight, fontSize);
  const lines = String(text || ' ').split('\n');
  const width = Math.max(...lines.map((line) => textWidth(line, fontSize)));
  const initialGridWidth = gridWidthForPixels(
    width + EDITOR_CONTENT_PADDING_X + SIZE_BUFFER
  );
  const availableWidth =
    widthForGridUnits(initialGridWidth) -
    EDITOR_CONTENT_PADDING_X -
    SIZE_BUFFER;
  const linesToRender = wrappedLineCount(lines, fontSize, availableWidth);

  return {
    width,
    height: linesToRender * lineHeight,
  };
}

function visibleFieldLines(
  fieldConfigs: FieldConfig[] | undefined,
  includeLabels: boolean
): string[] {
  if (!fieldConfigs || fieldConfigs.length === 0) {
    return [];
  }

  return fieldConfigs.reduce<string[]>((lines, config) => {
    const value = replaceVariables(config.variable, SAMPLE_INVOICE_DATA);

    if (
      config.hideIfEmpty !== false &&
      (!value || value.trim() === '')
    ) {
      return lines;
    }

    lines.push(
      `${includeLabels ? config.prefix || '' : ''}${value}${config.suffix || ''}`
    );

    return lines;
  }, []);
}

function fieldContentSize(
  properties: BlockProperties,
  options: { title?: string; includeLabels?: boolean } = {}
): ContentSize {
  const fieldConfigs = Array.isArray(properties.fieldConfigs)
    ? properties.fieldConfigs
    : undefined;
  const fieldLines = visibleFieldLines(
    fieldConfigs,
    options.includeLabels !== false
  );
  const fallbackContent = replaceVariables(
    properties.content || '',
    SAMPLE_INVOICE_DATA
  )
    .split('\n')
    .filter((line) => line.trim());
  const lines = fieldLines.length ? fieldLines : fallbackContent;

  if (options.title) {
    lines.unshift(options.title);
  }

  return textContentSize(lines.join('\n') || ' ', properties);
}

function tableContentSize(properties: BlockProperties): ContentSize {
  const fontSize = parseCssNumber(properties.fontSize, 12);
  const padding = parseCssNumber(properties.padding, 8);
  const rowHeight = fontSize * 1.2 + padding * 2;
  const rowCount = Math.max(1, SAMPLE_INVOICE_DATA.line_items.length);

  return {
    width: GRID_CONFIG.canvasWidth,
    height: (rowCount + 1) * rowHeight,
    fullWidth: true,
  };
}

function totalContentSize(properties: BlockProperties): ContentSize {
  const items = Array.isArray(properties.items) ? properties.items : [];
  const visibleItems = items.filter(
    (item: { show?: boolean }) => item.show !== false
  );
  const rows = visibleItems.length || 1;
  const fontSize = parseCssNumber(properties.fontSize, 13);
  const totalFontSize = parseCssNumber(properties.totalFontSize, fontSize);
  const spacing = parseCssNumber(properties.spacing, 8);
  const gap = parseCssNumber(properties.labelValueGap, 20);
  let width = 160;
  let height = 0;

  visibleItems.forEach(
    (item: { label?: string; field?: string; isTotal?: boolean }) => {
      const itemFontSize = item.isTotal ? totalFontSize : fontSize;
      const label = `${item.label || ''}:`;
      const value = replaceVariables(item.field || '', SAMPLE_INVOICE_DATA);

      width = Math.max(
        width,
        textWidth(label, itemFontSize) + gap + textWidth(value, itemFontSize)
      );
      height += itemFontSize * 1.2 + spacing;
    }
  );

  return {
    width,
    height: height || rows * (fontSize * 1.2 + spacing),
  };
}

function imageContentSize(
  type: BlockType,
  properties: BlockProperties
): ContentSize {
  const width = parseCssNumber(
    properties.maxWidth,
    type === 'logo' ? 150 : 200
  );
  const height = parseCssNumber(
    properties.maxHeight,
    type === 'logo' ? 100 : width * 0.75
  );

  return { width, height };
}

function blockContentSize(
  type: BlockType,
  properties: BlockProperties
): ContentSize {
  switch (type) {
    case 'text':
      return textContentSize(
        replaceVariables(properties.content || 'Text', SAMPLE_INVOICE_DATA),
        properties,
        14
      );
    case 'public-notes':
    case 'footer':
    case 'terms':
      return textContentSize(
        replaceVariables(properties.content || ' ', SAMPLE_INVOICE_DATA),
        properties,
        12
      );
    case 'company-info':
      return fieldContentSize(properties);
    case 'client-info':
    case 'client-shipping-info':
      return fieldContentSize(properties, {
        title: properties.showTitle ? properties.title : undefined,
      });
    case 'invoice-details':
      return fieldContentSize(properties, {
        includeLabels: properties.showLabels !== false,
      });
    case 'table':
    case 'tasks-table':
      return tableContentSize(properties);
    case 'total':
      return totalContentSize(properties);
    case 'logo':
    case 'image':
      return imageContentSize(type, properties);
    case 'divider': {
      const thickness = parseCssNumber(properties.thickness, 1);
      const marginTop = parseCssNumber(properties.marginTop, 10);
      const marginBottom = parseCssNumber(properties.marginBottom, 10);

      return {
        width: GRID_CONFIG.canvasWidth,
        height: thickness + marginTop + marginBottom,
        fullWidth: true,
      };
    }
    case 'spacer':
      return {
        width: GRID_CONFIG.canvasWidth,
        height: parseCssNumber(properties.height, 40),
        fullWidth: true,
      };
    case 'qrcode': {
      const size = parseCssNumber(properties.size, 100);

      return { width: size, height: size };
    }
    case 'signature': {
      const fontSize = parseCssNumber(properties.fontSize, 12);
      const labelWidth = textWidth(properties.label || '', fontSize);
      const dateWidth = properties.showDate
        ? textWidth('Date: ________________', fontSize)
        : 0;
      const lineWidth = properties.showLine ? 200 : 0;
      const labelHeight = fontSize * 1.2;
      const lineHeight = properties.showLine ? 9 : 0;
      const dateHeight = properties.showDate ? fontSize * 1.2 + 4 : 0;

      return {
        width: Math.max(labelWidth, dateWidth, lineWidth),
        height: 40 + lineHeight + labelHeight + dateHeight,
      };
    }
    default:
      return {
        width: widthForGridUnits(2),
        height: GRID_CONFIG.rowHeight,
      };
  }
}

export function getContentConstrainedGridSize(
  definition: Pick<BlockDefinition, 'type' | 'defaultProperties'> & {
    defaultSize?: Partial<GridSize>;
  }
): GridSize {
  const fallbackSize = FALLBACK_GRID_SIZES[definition.type];
  const contentSize = blockContentSize(
    definition.type,
    definition.defaultProperties
  );
  const defaultWidth = parseCssNumber(
    definition.defaultSize?.w,
    fallbackSize.w
  );
  const width = contentSize.fullWidth
    ? GRID_CONFIG.cols
    : clamp(defaultWidth, 1, GRID_CONFIG.cols);
  // The builder chrome lives inside the grid item, so initial rows need room
  // for both the invoice content and the editable widget frame.
  const height = gridHeightForPixels(
    contentSize.height +
      EDITOR_TOPBAR_HEIGHT +
      EDITOR_CONTENT_PADDING_Y +
      SIZE_BUFFER
  );

  return {
    w: clamp(width, 1, GRID_CONFIG.cols),
    h: Math.max(2, height),
  };
}
