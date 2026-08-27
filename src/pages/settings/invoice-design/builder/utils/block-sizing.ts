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
import {
  measureStackedFieldContentSize,
  measureTableFieldContentSize,
} from './field-content-size';
import { measureProseTextContentSize } from './text-content-size';
import { GRID_CONFIG } from './grid-converter';
import { SAMPLE_INVOICE_DATA, replaceVariables } from './variable-replacer';

const SIZE_BUFFER = 4;
const AVERAGE_CHARACTER_WIDTH = 0.55;

interface BlockContentSizeContext {
  blockGridWidth?: number;
}

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

function textWidth(text: string, fontSize: number): number {
  return text.length * fontSize * AVERAGE_CHARACTER_WIDTH;
}

function gridHeightForPixels(height: number): number {
  const rowHeight = GRID_CONFIG.rowHeight;
  const marginY = GRID_CONFIG.margin[1];

  return Math.max(1, Math.ceil((height + marginY) / (rowHeight + marginY)));
}

function proseBlockContentSize(
  props: Record<string, unknown>,
  inheritedFontSize: number,
  context: BlockContentSizeContext,
  contentFallback: string
): ContentSize {
  return measureProseTextContentSize(
    {
      content: replaceVariables(
        String(props.content || contentFallback),
        SAMPLE_INVOICE_DATA
      ),
      fontSize: props.fontSize as string | undefined,
      lineHeight: props.lineHeight as string | undefined,
      padding: props.padding as string | undefined,
    },
    inheritedFontSize,
    { blockGridWidth: context.blockGridWidth }
  );
}

function tableContentSize(
  properties: { fontSize?: string; padding?: string },
  inheritedFontSize: number
): ContentSize {
  const fontSize = parseCssNumber(properties.fontSize, inheritedFontSize);
  const padding = parseCssNumber(properties.padding, 8);
  const rowHeight = fontSize * 1.2 + padding * 2;
  const rowCount = Math.max(1, SAMPLE_INVOICE_DATA.line_items.length);

  return {
    width: GRID_CONFIG.canvasWidth,
    height: (rowCount + 1) * rowHeight,
    fullWidth: true,
  };
}

function totalContentSize(
  properties: {
    items?: Array<{ show?: boolean; label?: string; field?: string }>;
    spacing?: string;
    labelValueGap?: string;
    fontSize?: string;
  },
  inheritedFontSize: number
): ContentSize {
  const items = Array.isArray(properties.items) ? properties.items : [];
  const visibleItems = items.filter(
    (item: { show?: boolean }) => item.show !== false
  );
  const rows = visibleItems.length || 1;
  const spacing = parseCssNumber(properties.spacing, 8);
  const gap = parseCssNumber(properties.labelValueGap, 20);
  let width = 160;
  let height = 0;

  visibleItems.forEach(
    (item: {
      label?: string;
      field?: string;
      fontSize?: string;
      labelStyle?: { fontSize?: string };
      valueStyle?: { fontSize?: string };
    }) => {
      const labelFontSize = parseCssNumber(
        item.labelStyle?.fontSize || item.fontSize,
        inheritedFontSize
      );
      const valueFontSize = parseCssNumber(
        item.valueStyle?.fontSize || item.fontSize,
        inheritedFontSize
      );
      const rowFontSize = Math.max(labelFontSize, valueFontSize);
      const label = `${item.label || ''}:`;
      const value = replaceVariables(item.field || '', SAMPLE_INVOICE_DATA);

      width = Math.max(
        width,
        textWidth(label, labelFontSize) + gap + textWidth(value, valueFontSize)
      );
      height += rowFontSize * 1.2 + spacing;
    }
  );

  return {
    width,
    height: height || rows * (inheritedFontSize * 1.2 + spacing),
  };
}

function imageContentSize(
  type: BlockType,
  properties: BlockProperties
): ContentSize {
  const props = properties as Record<string, unknown>;
  const width = parseCssNumber(
    props.maxWidth as string | number | undefined,
    type === 'logo' ? 150 : 200
  );
  const height = parseCssNumber(
    props.maxHeight as string | number | undefined,
    type === 'logo' ? 100 : width * 0.75
  );

  return { width, height };
}

function blockContentSize(
  type: BlockType,
  properties: BlockProperties,
  inheritedFontSize: number,
  context: BlockContentSizeContext = {}
): ContentSize {
  const props = properties as Record<string, unknown>;

  switch (type) {
    case 'text':
      return proseBlockContentSize(
        props,
        inheritedFontSize,
        context,
        'Text'
      );
    case 'public-notes':
    case 'footer':
    case 'terms':
      return proseBlockContentSize(props, inheritedFontSize, context, ' ');
    case 'company-info':
      return measureStackedFieldContentSize(
        {
          fieldConfigs: props.fieldConfigs as FieldConfig[] | undefined,
          content: props.content as string | undefined,
          fontSize: props.fontSize as string | undefined,
          lineHeight: props.lineHeight as string | undefined,
          padding: props.padding as string | undefined,
          titleFontSize: props.titleFontSize as string | undefined,
        },
        inheritedFontSize,
        {
          blockGridWidth: context.blockGridWidth,
          title: props.showTitle ? (props.title as string | undefined) : undefined,
        }
      );
    case 'client-info':
      return measureStackedFieldContentSize(
        {
          fieldConfigs: props.fieldConfigs as FieldConfig[] | undefined,
          content: props.content as string | undefined,
          fontSize: props.fontSize as string | undefined,
          lineHeight: props.lineHeight as string | undefined,
          padding: props.padding as string | undefined,
          titleFontSize: props.titleFontSize as string | undefined,
        },
        inheritedFontSize,
        {
          blockGridWidth: context.blockGridWidth,
          title: props.showTitle ? (props.title as string | undefined) : undefined,
        }
      );
    case 'client-shipping-info':
      return measureStackedFieldContentSize(
        {
          fieldConfigs: props.fieldConfigs as FieldConfig[] | undefined,
          content: props.content as string | undefined,
          fontSize: props.fontSize as string | undefined,
          lineHeight: props.lineHeight as string | undefined,
          padding: props.padding as string | undefined,
          titleFontSize: props.titleFontSize as string | undefined,
        },
        inheritedFontSize,
        {
          blockGridWidth: context.blockGridWidth,
          title: props.showTitle ? (props.title as string | undefined) : undefined,
        }
      );
    case 'invoice-details':
      return measureTableFieldContentSize(
        {
          fieldConfigs: props.fieldConfigs as FieldConfig[] | undefined,
          fontSize: props.fontSize as string | undefined,
          padding: props.padding as string | undefined,
          rowSpacing: props.rowSpacing as string | undefined,
          labelValueGap: props.labelValueGap as string | undefined,
          showLabels: props.showLabels !== false,
        },
        inheritedFontSize
      );
    case 'table':
    case 'tasks-table':
      return tableContentSize(
        {
          fontSize: props.fontSize as string | undefined,
          padding: props.padding as string | undefined,
        },
        inheritedFontSize
      );
    case 'total':
      return totalContentSize(
        {
          items: props.items as Array<{
            show?: boolean;
            label?: string;
            field?: string;
          }>,
          spacing: props.spacing as string | undefined,
          labelValueGap: props.labelValueGap as string | undefined,
          fontSize: props.fontSize as string | undefined,
        },
        inheritedFontSize
      );
    case 'logo':
    case 'image':
      return imageContentSize(type, properties);
    case 'divider': {
      const thickness = parseCssNumber(props.thickness as string | number, 1);
      const marginTop = parseCssNumber(props.marginTop as string | number, 10);
      const marginBottom = parseCssNumber(
        props.marginBottom as string | number,
        10
      );

      return {
        width: GRID_CONFIG.canvasWidth,
        height: thickness + marginTop + marginBottom,
        fullWidth: true,
      };
    }
    case 'spacer':
      return {
        width: GRID_CONFIG.canvasWidth,
        height: parseCssNumber(props.height as string | number, 40),
        fullWidth: true,
      };
    case 'qrcode': {
      const size = parseCssNumber(props.size as string | number, 100);

      return { width: size, height: size };
    }
    case 'signature': {
      const fontSize = parseCssNumber(
        props.fontSize as string | number,
        inheritedFontSize
      );
      const padding = parseCssNumber(props.padding as string | number, 0);
      const signatureHeight = parseCssNumber(
        props.signatureHeight as string | number,
        40
      );
      const labelWidth = textWidth(String(props.label || ''), fontSize);
      const dateWidth = props.showDate
        ? textWidth('Date: ________________', fontSize)
        : 0;
      const showLine = props.showLine !== false;
      const lineWidth = showLine
        ? parseCssNumber(props.lineWidth as string | number, 200)
        : 0;
      const labelHeight = props.label ? fontSize * 1.2 : 0;
      const lineHeight = showLine
        ? parseCssNumber(props.lineThickness as string | number, 1) + 8
        : 0;
      const dateHeight = props.showDate ? fontSize * 1.2 + 4 : 0;

      return {
        width: Math.max(labelWidth, dateWidth, lineWidth) + padding * 2,
        height:
          signatureHeight + lineHeight + labelHeight + dateHeight + padding * 2,
      };
    }
    default:
      return {
        width: GRID_CONFIG.canvasWidth / GRID_CONFIG.cols,
        height: GRID_CONFIG.rowHeight,
      };
  }
}

export function getContentConstrainedGridSize(
  definition: Pick<BlockDefinition, 'type' | 'defaultProperties'> & {
    defaultSize?: Partial<GridSize>;
  },
  options: { inheritedFontSize?: number } = {}
): GridSize {
  const inheritedFontSize = options.inheritedFontSize || 16;
  const fallbackSize = FALLBACK_GRID_SIZES[definition.type];
  const defaultWidth = parseCssNumber(
    definition.defaultSize?.w,
    fallbackSize.w
  );
  const contentSize = blockContentSize(
    definition.type,
    definition.defaultProperties,
    inheritedFontSize,
    { blockGridWidth: defaultWidth }
  );
  const width = contentSize.fullWidth
    ? GRID_CONFIG.cols
    : clamp(defaultWidth, 1, GRID_CONFIG.cols);
  const height = gridHeightForPixels(contentSize.height + SIZE_BUFFER);

  return {
    w: clamp(width, 1, GRID_CONFIG.cols),
    h: Math.max(2, height),
  };
}
