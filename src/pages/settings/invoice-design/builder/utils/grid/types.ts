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

export type SavedBuilderBlock = Partial<Omit<Block, 'gridPosition'>> & {
  gridPosition?: Partial<Record<keyof Block['gridPosition'], unknown>>;
  colStart?: unknown;
  colSpan?: unknown;
  rowAlign?: unknown;
  rowWidth?: unknown;
};

export type GridMetrics = {
  rowHeight: number;
  margin: [number, number];
};

export const BUILDER_GRID_VERSION = 2;

export const LEGACY_GRID_METRICS: GridMetrics = {
  rowHeight: 60,
  margin: [10, 16],
};

export const CONTENT_GROW_BLOCK_TYPES = new Set<Block['type']>([
  'table',
  'tasks-table',
  'company-info',
  'client-info',
  'client-shipping-info',
  'invoice-details',
  'total',
  'qrcode',
  'signature',
]);
