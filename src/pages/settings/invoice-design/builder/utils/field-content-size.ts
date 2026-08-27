/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import type { BlockType, FieldConfig } from '../types';
import { GRID_CONFIG } from './grid-converter';
import { SAMPLE_INVOICE_DATA, replaceVariables } from './variable-replacer';

const EDITOR_CONTENT_PADDING_X = 24;
const SIZE_BUFFER = 4;
const TITLE_MARGIN_BOTTOM = 8;
const AVERAGE_CHARACTER_WIDTH = 0.55;
const TABLE_ROW_HEIGHT_FACTOR = 1.2;

export const DEDICATED_FIELD_CONTENT_BLOCK_TYPES = new Set<BlockType>([
  'client-info',
  'client-shipping-info',
  'company-info',
  'invoice-details',
]);

export interface FieldContentSize {
  width: number;
  height: number;
}

export interface StackedFieldContentProperties {
  fieldConfigs?: FieldConfig[];
  content?: string;
  fontSize?: string;
  lineHeight?: string;
  padding?: string;
  titleFontSize?: string;
}

export interface StackedFieldContentSizeOptions {
  /** Grid column span used to estimate wrapping width. */
  blockGridWidth?: number;
  title?: string;
  includeLabels?: boolean;
}

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

function availableContentWidth(
  blockGridWidth: number,
  paddingPx: number
): number {
  return Math.max(
    0,
    widthForGridUnits(clamp(blockGridWidth, 1, GRID_CONFIG.cols)) -
      EDITOR_CONTENT_PADDING_X -
      SIZE_BUFFER -
      paddingPx * 2
  );
}

function visibleFieldRows(
  fieldConfigs: FieldConfig[] | undefined,
  includeLabels: boolean
): Array<{ text: string; configFontSize?: string }> {
  if (!fieldConfigs?.length) {
    return [];
  }

  return fieldConfigs.reduce<Array<{ text: string; configFontSize?: string }>>(
    (rows, config) => {
      const value = replaceVariables(config.variable, SAMPLE_INVOICE_DATA);

      if (config.hideIfEmpty !== false && (!value || value.trim() === '')) {
        return rows;
      }

      rows.push({
        text: `${includeLabels ? config.prefix || '' : ''}${value}${config.suffix || ''}`,
        configFontSize: config.fontSize,
      });

      return rows;
    },
    []
  );
}

interface FieldRow {
  text: string;
  fontSize: number;
}

function buildFieldRows(
  properties: StackedFieldContentProperties,
  inheritedFontSize: number,
  options: StackedFieldContentSizeOptions
): FieldRow[] {
  const blockFontSize = parseCssNumber(properties.fontSize, inheritedFontSize);
  const fieldRows = visibleFieldRows(
    properties.fieldConfigs,
    options.includeLabels !== false
  ).map((row) => ({
    text: row.text,
    fontSize: parseCssNumber(row.configFontSize, blockFontSize),
  }));

  if (fieldRows.length > 0) {
    return fieldRows;
  }

  return replaceVariables(properties.content || '', SAMPLE_INVOICE_DATA)
    .split('\n')
    .filter((line) => line.trim())
    .map((text) => ({ text, fontSize: blockFontSize }));
}

/**
 * Estimate height for info blocks that render one stacked row per field.
 * Mirrors the totals block approach: count discrete rows, use the block's
 * column span for wrapping, and add explicit title spacing when present.
 */
export function measureStackedFieldContentSize(
  properties: StackedFieldContentProperties,
  inheritedFontSize: number,
  options: StackedFieldContentSizeOptions = {}
): FieldContentSize {
  const blockGridWidth = clamp(
    options.blockGridWidth ?? 6,
    1,
    GRID_CONFIG.cols
  );
  const blockFontSize = parseCssNumber(properties.fontSize, inheritedFontSize);
  const titleFontSize = parseCssNumber(properties.titleFontSize, blockFontSize);
  const paddingPx = parseCssNumber(properties.padding, 0);
  const availableWidth = availableContentWidth(blockGridWidth, paddingPx);
  const rows = buildFieldRows(properties, inheritedFontSize, options);

  if (options.title) {
    rows.unshift({ text: options.title, fontSize: titleFontSize });
  }

  if (rows.length === 0) {
    const lineHeight = lineHeightPixels(properties.lineHeight, blockFontSize);

    return {
      width: widthForGridUnits(blockGridWidth),
      height: lineHeight,
    };
  }

  let width = 0;
  let height = paddingPx * 2;

  rows.forEach((row) => {
    const rowLineHeight = lineHeightPixels(properties.lineHeight, row.fontSize);
    const wrappedLines = wrappedLineCount(
      [row.text],
      row.fontSize,
      availableWidth
    );

    width = Math.max(width, textWidth(row.text, row.fontSize));
    height += wrappedLines * rowLineHeight;
  });

  if (options.title) {
    height += TITLE_MARGIN_BOTTOM;
  }

  return {
    width,
    height,
  };
}

export interface TableFieldContentProperties {
  fieldConfigs?: FieldConfig[];
  fontSize?: string;
  padding?: string;
  rowSpacing?: string;
  labelValueGap?: string;
  showLabels?: boolean;
}

function visibleFieldConfigs(
  fieldConfigs: FieldConfig[] | undefined
): FieldConfig[] {
  if (!fieldConfigs?.length) {
    return [];
  }

  return fieldConfigs.filter((config) => {
    const value = replaceVariables(config.variable, SAMPLE_INVOICE_DATA);

    if (config.hideIfEmpty !== false && (!value || value.trim() === '')) {
      return false;
    }

    return true;
  });
}

/**
 * Estimate height for label/value table field blocks such as invoice details.
 * Uses the same discrete row model as the totals block.
 */
export function measureTableFieldContentSize(
  properties: TableFieldContentProperties,
  inheritedFontSize: number
): FieldContentSize {
  const blockFontSize = parseCssNumber(properties.fontSize, inheritedFontSize);
  const paddingPx = parseCssNumber(properties.padding, 0);
  const rowSpacing = parseCssNumber(properties.rowSpacing, 0);
  const gap = parseCssNumber(properties.labelValueGap, 12);
  const showLabels = properties.showLabels !== false;
  const visibleFields = visibleFieldConfigs(properties.fieldConfigs);
  const rows = visibleFields.length || 1;

  let width = 160;
  let height = paddingPx * 2;

  visibleFields.forEach((field) => {
    const labelFontSize = parseCssNumber(
      field.labelStyle?.fontSize || field.fontSize,
      blockFontSize
    );
    const valueFontSize = parseCssNumber(
      field.valueStyle?.fontSize || field.fontSize,
      blockFontSize
    );
    const rowFontSize = Math.max(labelFontSize, valueFontSize);
    const labelSource = field.label || field.prefix?.replace(/:\s*$/, '') || '';
    const value = `${replaceVariables(field.variable, SAMPLE_INVOICE_DATA)}${
      field.suffix || ''
    }`;

    if (showLabels) {
      width = Math.max(
        width,
        textWidth(labelSource, labelFontSize) +
          gap +
          textWidth(value, valueFontSize)
      );
    } else {
      width = Math.max(width, textWidth(value, valueFontSize));
    }

    height += rowFontSize * TABLE_ROW_HEIGHT_FACTOR + rowSpacing;
  });

  return {
    width,
    height: height || rows * (blockFontSize * TABLE_ROW_HEIGHT_FACTOR + rowSpacing),
  };
}
