/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Design } from '$app/common/interfaces/design';
import { Block, generateBlockId } from '../../types';
import { GRID_CONFIG } from '../grid-converter';
import { repairGridPositionCollisions } from './collisions';
import {
  convertGridPositionMetrics,
  isRecord,
  normalizeGridPosition,
  normalizeSavedGridPosition,
  parseSavedNumber,
  stringValue,
} from './normalize';
import {
  BUILDER_GRID_VERSION,
  GridMetrics,
  LEGACY_GRID_METRICS,
  SavedBuilderBlock,
} from './types';

const ELEMENT_TYPOGRAPHY_FONT_SIZE_BLOCK_TYPES = new Set<Block['type']>([
  'company-info',
  'client-info',
  'client-shipping-info',
  'invoice-details',
  'total',
]);

const TOTAL_BLOCK_TYPOGRAPHY_GLOBAL_KEYS = [
  'fontSize',
  'totalFontSize',
  'labelColor',
  'amountColor',
  'totalColor',
  'balanceColor',
  'totalFontWeight',
] as const;

function mergeTypographyDefaults(
  current: unknown,
  defaults: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
  }
): Record<string, unknown> | undefined {
  const next = isRecord(current) ? { ...current } : {};

  if (defaults.fontSize && !stringValue(next.fontSize)) {
    next.fontSize = defaults.fontSize;
  }

  if (defaults.fontWeight && !stringValue(next.fontWeight)) {
    next.fontWeight = defaults.fontWeight;
  }

  if (defaults.color && !stringValue(next.color)) {
    next.color = defaults.color;
  }

  return Object.keys(next).length ? next : undefined;
}

export function normalizeTotalTypographyProperties(
  properties: Record<string, unknown>
): Record<string, unknown> {
  const next = { ...properties };
  const blockFontSize = stringValue(next.fontSize);
  const totalFontSize = stringValue(next.totalFontSize);
  const labelColor = stringValue(next.labelColor);
  const amountColor = stringValue(next.amountColor);
  const totalColor = stringValue(next.totalColor);
  const balanceColor = stringValue(next.balanceColor);
  const totalFontWeight = stringValue(next.totalFontWeight);

  if (Array.isArray(next.items)) {
    next.items = next.items.map((rawItem) => {
      if (!isRecord(rawItem)) {
        return rawItem;
      }

      const item = { ...rawItem };
      const isTotal = item.isTotal === true;
      const isBalance = item.isBalance === true;
      const rowFontSize = isTotal
        ? totalFontSize || blockFontSize
        : blockFontSize;
      const rowFontWeight = isTotal ? totalFontWeight : undefined;
      const labelDefaults = {
        fontSize: rowFontSize,
        fontWeight: rowFontWeight,
        color: isTotal ? totalColor : isBalance ? balanceColor : labelColor,
      };
      const valueDefaults = {
        fontSize: rowFontSize,
        fontWeight: rowFontWeight,
        color: isTotal ? totalColor : isBalance ? balanceColor : amountColor,
      };

      const labelStyle = mergeTypographyDefaults(
        item.labelStyle,
        labelDefaults
      );
      const valueStyle = mergeTypographyDefaults(
        item.valueStyle,
        valueDefaults
      );

      if (labelStyle) {
        item.labelStyle = labelStyle;
      }

      if (valueStyle) {
        item.valueStyle = valueStyle;
      }

      return item;
    });
  }

  TOTAL_BLOCK_TYPOGRAPHY_GLOBAL_KEYS.forEach((key) => {
    delete next[key];
  });

  return next;
}

function normalizeSavedBlockProperties(
  type: Block['type'],
  properties: unknown
): Block['properties'] {
  const blockProperties = isRecord(properties) ? { ...properties } : {};

  if (type === 'total') {
    return normalizeTotalTypographyProperties(
      blockProperties
    ) as Block['properties'];
  }

  if (ELEMENT_TYPOGRAPHY_FONT_SIZE_BLOCK_TYPES.has(type)) {
    delete blockProperties.fontSize;
  }

  return blockProperties as Block['properties'];
}

export function normalizeSavedBlocksForBuilder(
  rawBlocks: unknown[],
  sourceMetrics?: GridMetrics
): Block[] {
  const blocks = rawBlocks.filter(isRecord).map((rawBlock) => {
    const block = rawBlock as SavedBuilderBlock;
    const type = (block.type || 'text') as Block['type'];
    const gridPosition = normalizeSavedGridPosition(block);

    return {
      id: String(block.id || generateBlockId(type)),
      type,
      gridPosition: sourceMetrics
        ? convertGridPositionMetrics(gridPosition, sourceMetrics)
        : normalizeGridPosition(gridPosition),
      properties: normalizeSavedBlockProperties(type, block.properties),
      ...(block.locked ? { locked: block.locked } : {}),
    } satisfies Block;
  });

  return repairGridPositionCollisions(blocks);
}

export function parseGridMetrics(value: unknown): GridMetrics | null {
  if (!isRecord(value)) {
    return null;
  }

  const rowHeight = parseSavedNumber(value.rowHeight);
  const margin = Array.isArray(value.margin)
    ? ([
        parseSavedNumber(value.margin[0]) ?? GRID_CONFIG.margin[0],
        parseSavedNumber(value.margin[1]) ?? GRID_CONFIG.margin[1],
      ] as [number, number])
    : null;

  if (!rowHeight || !margin) {
    return null;
  }

  return { rowHeight, margin };
}

export function extractBlocksFromDesign(design: Design): Block[] | null {
  const designBody = design.design as
    | (Design['design'] & {
        builderGridVersion?: number;
        layout?: unknown;
      })
    | undefined;
  const blocks = designBody?.blocks;
  if (Array.isArray(blocks) && blocks.length > 0) {
    const savedMetrics =
      designBody?.builderGridVersion === BUILDER_GRID_VERSION
        ? undefined
        : parseGridMetrics(designBody?.layout) || LEGACY_GRID_METRICS;

    return normalizeSavedBlocksForBuilder(blocks, savedMetrics);
  }
  return null;
}

export function omitBlockLevelFontSizeWhenElementSized(block: Block): Block {
  if (!ELEMENT_TYPOGRAPHY_FONT_SIZE_BLOCK_TYPES.has(block.type)) {
    return block;
  }

  const properties =
    block.type === 'total'
      ? normalizeTotalTypographyProperties(
          block.properties as Record<string, unknown>
        )
      : { ...block.properties };
  let changed = false;

  if ('fontSize' in properties) {
    delete properties.fontSize;
    changed = true;
  }

  return changed || block.type === 'total'
    ? ({ ...block, properties } as Block)
    : block;
}
