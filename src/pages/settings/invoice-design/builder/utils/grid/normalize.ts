/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Block } from '../../types';
import { GRID_CONFIG } from '../grid-converter';
import { GridMetrics, SavedBuilderBlock } from './types';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value !== '' ? value : undefined;
}

export function parseSavedNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function clampGridInteger(value: number, min: number, max: number): number {
  const rounded = Number.isFinite(value) ? Math.round(value) : min;

  return Math.min(Math.max(rounded, min), max);
}

export function normalizeSavedGridPosition(
  block: SavedBuilderBlock
): Block['gridPosition'] {
  const position = isRecord(block.gridPosition) ? block.gridPosition : {};
  const savedColStart = parseSavedNumber(block.colStart);
  const savedColSpan = parseSavedNumber(block.colSpan);
  const w = clampGridInteger(
    savedColSpan ?? parseSavedNumber(position.w) ?? 4,
    1,
    GRID_CONFIG.cols
  );
  const x = clampGridInteger(
    savedColStart !== null
      ? savedColStart - 1
      : parseSavedNumber(position.x) ?? 0,
    0,
    GRID_CONFIG.cols - w
  );
  const y = Math.max(0, Math.round(parseSavedNumber(position.y) ?? 0));
  const h = Math.max(1, Math.round(parseSavedNumber(position.h) ?? 2));

  return { x, y, w, h };
}

export function rowTrackHeight(metrics: GridMetrics): number {
  return metrics.rowHeight + metrics.margin[1];
}

export function pixelHeightForGridRows(rows: number, metrics: GridMetrics): number {
  return rows * metrics.rowHeight + Math.max(0, rows - 1) * metrics.margin[1];
}

export function gridRowsForPixelHeight(height: number, metrics: GridMetrics): number {
  return Math.max(
    1,
    Math.ceil((height + metrics.margin[1]) / rowTrackHeight(metrics))
  );
}

export function convertGridPositionMetrics(
  position: Block['gridPosition'],
  fromMetrics: GridMetrics
): Block['gridPosition'] {
  if (
    fromMetrics.rowHeight === GRID_CONFIG.rowHeight &&
    fromMetrics.margin[1] === GRID_CONFIG.margin[1]
  ) {
    return normalizeGridPosition(position);
  }

  const y = Math.max(
    0,
    Math.round(
      (position.y * rowTrackHeight(fromMetrics)) / rowTrackHeight(GRID_CONFIG)
    )
  );
  const h = gridRowsForPixelHeight(
    pixelHeightForGridRows(position.h, fromMetrics),
    GRID_CONFIG
  );

  return normalizeGridPosition({
    ...position,
    y,
    h,
  });
}

export function normalizeGridPosition(
  position: Block['gridPosition']
): Block['gridPosition'] {
  const w = clampGridInteger(position.w, 1, GRID_CONFIG.cols);
  const x = clampGridInteger(position.x, 0, GRID_CONFIG.cols - w);
  const y = Math.max(0, Math.round(position.y));
  const h = Math.max(1, Math.round(position.h));

  return { x, y, w, h };
}
