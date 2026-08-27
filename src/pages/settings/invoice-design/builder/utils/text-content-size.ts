/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import type { BlockType } from '../types';
import { GRID_CONFIG } from './grid-converter';

const EDITOR_CONTENT_PADDING_X = 24;
const SIZE_BUFFER = 4;
const AVERAGE_CHARACTER_WIDTH = 0.55;

export const DEDICATED_PROSE_CONTENT_BLOCK_TYPES = new Set<BlockType>([
  'footer',
  'public-notes',
  'terms',
  'text',
]);

export interface ProseTextContentSize {
  width: number;
  height: number;
}

export interface ProseTextContentProperties {
  content?: string;
  fontSize?: string;
  lineHeight?: string;
  padding?: string;
}

export interface ProseTextContentSizeOptions {
  /** Grid column span used to estimate wrapping width. */
  blockGridWidth?: number;
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

/**
 * Estimate height for prose text blocks (public notes, terms, footer).
 * Uses the block's column span for wrap width, matching white-space: pre-line
 * rendering in a single content container.
 */
export function measureProseTextContentSize(
  properties: ProseTextContentProperties,
  inheritedFontSize: number,
  options: ProseTextContentSizeOptions = {}
): ProseTextContentSize {
  const blockGridWidth = clamp(
    options.blockGridWidth ?? GRID_CONFIG.cols,
    1,
    GRID_CONFIG.cols
  );
  const fontSize = parseCssNumber(properties.fontSize, inheritedFontSize);
  const lineHeight = lineHeightPixels(properties.lineHeight, fontSize);
  const paddingPx = parseCssNumber(properties.padding, 0);
  const lines = String(properties.content || ' ').split('\n');
  const availableWidth = availableContentWidth(blockGridWidth, paddingPx);
  const linesToRender = wrappedLineCount(lines, fontSize, availableWidth);
  const width = Math.max(...lines.map((line) => textWidth(line, fontSize)), 0);

  return {
    width,
    height: paddingPx * 2 + linesToRender * lineHeight,
  };
}
