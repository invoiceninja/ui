/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { DragEvent as ReactDragEvent, KeyboardEvent } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GridStack } from 'gridstack';
import type {
  GridItemHTMLElement,
  GridStackNode,
  GridStackWidget,
} from 'gridstack';
import {
  Undo2,
  Redo2,
  Eye,
  Download,
  FileJson,
  Clipboard,
  GripVertical,
  LayoutGrid,
  Type,
  Pencil,
  Settings as SettingsIcon,
} from 'lucide-react';
import { Button } from '$app/components/forms';
import { InputField } from '$app/components/forms/InputField';
import { Modal } from '$app/components/Modal';
import { Card } from '$app/components/cards';
import { useSaveBtn } from '$app/components/layouts/common/hooks';
import {
  Block,
  BuilderState,
  BlockDefinition,
  DocumentSettings,
  createDefaultDocumentSettings,
  generateBlockId,
} from './types';
import { getTemplateById } from './templates/templates';
import { ComponentLibrary } from './components/ComponentLibrary';
import { PropertyPanel } from './components/PropertyPanel';
import { DocumentSettingsPanel } from './components/DocumentSettingsPanel';
import { BlockRenderer } from './components/BlockRenderer';
import { PreviewModal } from './components/PreviewModal';
import { useBlockLabel } from './block-library';
import { getContentConstrainedGridSize } from './utils/block-sizing';
import { generateInvoiceHTML } from './utils/html-generator';
import { annotateBlocksWithRowLayout } from './utils/row-layout';
import { GRID_CONFIG } from './utils/grid-converter';
import { route } from '$app/common/helpers/route';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { Design } from '$app/common/interfaces/design';
import { useDesignQuery } from '$app/common/queries/designs';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useColorScheme } from '$app/common/colors';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import 'gridstack/dist/gridstack.min.css';
import './InvoiceBuilder.css';

/**
 * Extract blocks from design object
 */
type SavedBuilderBlock = Partial<Omit<Block, 'gridPosition'>> & {
  gridPosition?: Partial<Record<keyof Block['gridPosition'], unknown>>;
  colStart?: unknown;
  colSpan?: unknown;
  rowAlign?: unknown;
  rowWidth?: unknown;
};
type GridMetrics = {
  rowHeight: number;
  margin: [number, number];
};

const BUILDER_GRID_VERSION = 2;
const LEGACY_GRID_METRICS: GridMetrics = {
  rowHeight: 60,
  margin: [10, 16],
};
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value !== '' ? value : undefined;
}

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

function normalizeTotalTypographyProperties(
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

function parseSavedNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function clampGridInteger(value: number, min: number, max: number): number {
  const rounded = Number.isFinite(value) ? Math.round(value) : min;

  return Math.min(Math.max(rounded, min), max);
}

function normalizeSavedGridPosition(
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

function rowTrackHeight(metrics: GridMetrics): number {
  return metrics.rowHeight + metrics.margin[1];
}

function pixelHeightForGridRows(rows: number, metrics: GridMetrics): number {
  return rows * metrics.rowHeight + Math.max(0, rows - 1) * metrics.margin[1];
}

function gridRowsForPixelHeight(height: number, metrics: GridMetrics): number {
  return Math.max(
    1,
    Math.ceil((height + metrics.margin[1]) / rowTrackHeight(metrics))
  );
}

function convertGridPositionMetrics(
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

function normalizeGridPosition(
  position: Block['gridPosition']
): Block['gridPosition'] {
  const w = clampGridInteger(position.w, 1, GRID_CONFIG.cols);
  const x = clampGridInteger(position.x, 0, GRID_CONFIG.cols - w);
  const y = Math.max(0, Math.round(position.y));
  const h = Math.max(1, Math.round(position.h));

  return { x, y, w, h };
}

function isSameGridPosition(
  a: Block['gridPosition'],
  b: Block['gridPosition']
): boolean {
  return a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;
}

function gridPositionsOverlap(
  a: Block['gridPosition'],
  b: Block['gridPosition']
): boolean {
  return !(
    a.x + a.w <= b.x ||
    b.x + b.w <= a.x ||
    a.y + a.h <= b.y ||
    b.y + b.h <= a.y
  );
}

function repairGridPositionCollisions(blocks: Block[]): Block[] {
  if (blocks.length <= 1) {
    return blocks;
  }

  let changed = false;
  const indexedBlocks = blocks.map((block, index) => {
    const gridPosition = normalizeGridPosition(block.gridPosition);

    if (!isSameGridPosition(block.gridPosition, gridPosition)) {
      changed = true;
    }

    return {
      block,
      index,
      gridPosition,
    };
  });
  const repairedByIndex = new Map<number, Block['gridPosition']>();
  const placed: Block['gridPosition'][] = [];

  indexedBlocks
    .slice()
    .sort((a, b) => {
      if (a.gridPosition.y !== b.gridPosition.y) {
        return a.gridPosition.y - b.gridPosition.y;
      }

      if (a.gridPosition.x !== b.gridPosition.x) {
        return a.gridPosition.x - b.gridPosition.x;
      }

      return a.index - b.index;
    })
    .forEach(({ index, gridPosition }) => {
      const repairedPosition = { ...gridPosition };

      while (
        placed.some((placedPosition) =>
          gridPositionsOverlap(repairedPosition, placedPosition)
        )
      ) {
        const nextY = Math.max(
          ...placed
            .filter((placedPosition) =>
              gridPositionsOverlap(repairedPosition, placedPosition)
            )
            .map((placedPosition) => placedPosition.y + placedPosition.h)
        );

        repairedPosition.y = Math.max(repairedPosition.y + 1, nextY);
      }

      if (!isSameGridPosition(gridPosition, repairedPosition)) {
        changed = true;
      }

      placed.push(repairedPosition);
      repairedByIndex.set(index, repairedPosition);
    });

  if (!changed) {
    return blocks;
  }

  return blocks.map((block, index) => {
    const gridPosition = repairedByIndex.get(index);

    if (!gridPosition || isSameGridPosition(block.gridPosition, gridPosition)) {
      return block;
    }

    return {
      ...block,
      gridPosition,
    };
  });
}

function omitBlockLevelFontSizeWhenElementSized(block: Block): Block {
  if (!ELEMENT_TYPOGRAPHY_FONT_SIZE_BLOCK_TYPES.has(block.type)) {
    return block;
  }

  const properties =
    block.type === 'total'
      ? normalizeTotalTypographyProperties(block.properties)
      : { ...block.properties };
  let changed = false;

  if ('fontSize' in properties) {
    delete properties.fontSize;
    changed = true;
  }

  return changed || block.type === 'total' ? { ...block, properties } : block;
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

  return blockProperties;
}

function normalizeSavedBlocksForBuilder(
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

function parseGridMetrics(value: unknown): GridMetrics | null {
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

function extractBlocksFromDesign(design: Design): Block[] | null {
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

/** Merge visual-builder output into the API `design` shape without wiping server fields. */
function mergeDesignParts(
  blocks: Block[],
  htmlBody: string,
  previous: Design['design'] | undefined,
  documentSettings: DocumentSettings
): Design['design'] {
  // Annotate each block with row-layout hints (rowAlign, rowWidth, colStart,
  // colSpan) so the API can place blocks within their flex-row correctly —
  // the API otherwise loses `gridPosition.x` and packs every block left.
  const annotatedBlocks = annotateBlocksWithRowLayout(
    repairGridPositionCollisions(blocks).map(
      omitBlockLevelFontSizeWhenElementSized
    )
  );

  return {
    includes: previous?.includes ?? '',
    header: previous?.header ?? '',
    body: htmlBody,
    product: previous?.product ?? '',
    task: previous?.task ?? '',
    footer: previous?.footer ?? '',
    blocks: annotatedBlocks,
    documentSettings,
    builderGridVersion: BUILDER_GRID_VERSION,
    layout: {
      cols: GRID_CONFIG.cols,
      rowHeight: GRID_CONFIG.rowHeight,
      margin: GRID_CONFIG.margin,
      containerPadding: GRID_CONFIG.containerPadding,
    },
    ...(previous?.pageSettings ? { pageSettings: previous.pageSettings } : {}),
  } as Design['design'];
}

/**
 * Map per-template DocumentSettings (camelCase) → the snake_case shape that
 * `generateInvoiceHTML` consumes. This lets the generator stay agnostic of
 * whether values originated from company.settings or per-template overrides.
 */
function documentSettingsToGeneratorShape(ds: DocumentSettings) {
  return {
    page_size: ds.pageSize,
    page_layout: ds.pageLayout,
    primary_font: ds.primaryFont,
    secondary_font: ds.secondaryFont,
    font_size: ds.globalFontSize,
    show_paid_stamp: ds.showPaidStamp,
    show_shipping_address: ds.showShippingAddress,
    embed_documents: ds.embedDocuments,
    hide_empty_columns: ds.hideEmptyColumns,
    page_numbering: ds.pageNumbering,
    page_margin_top: ds.pageMarginTop,
    page_margin_right: ds.pageMarginRight,
    page_margin_bottom: ds.pageMarginBottom,
    page_margin_left: ds.pageMarginLeft,
    page_padding_top: ds.pagePaddingTop,
    page_padding_right: ds.pagePaddingRight,
    page_padding_bottom: ds.pagePaddingBottom,
    page_padding_left: ds.pagePaddingLeft,
  };
}

interface PageDimensions {
  width: string;
  minHeight: string;
  pixels: number;
}

const PAGE_SIZE_DIMENSIONS: Record<
  string,
  { widthMm: number; heightMm: number }
> = {
  A3: { widthMm: 297, heightMm: 420 },
  A4: { widthMm: 210, heightMm: 297 },
  A5: { widthMm: 148, heightMm: 210 },
  B4: { widthMm: 250, heightMm: 353 },
  B5: { widthMm: 176, heightMm: 250 },
  'JIS-B4': { widthMm: 257, heightMm: 364 },
  'JIS-B5': { widthMm: 182, heightMm: 257 },
  letter: { widthMm: 215.9, heightMm: 279.4 },
  legal: { widthMm: 215.9, heightMm: 355.6 },
  ledger: { widthMm: 279.4, heightMm: 431.8 },
};

function getPageDimensions(
  pageSize: string = 'A4',
  layout: 'portrait' | 'landscape' = 'portrait'
): PageDimensions {
  const dims = PAGE_SIZE_DIMENSIONS[pageSize] || PAGE_SIZE_DIMENSIONS.A4;
  const widthMm = layout === 'landscape' ? dims.heightMm : dims.widthMm;
  const heightMm = layout === 'landscape' ? dims.widthMm : dims.heightMm;
  // 96dpi: 1mm ≈ 3.7795px
  return {
    width: `${widthMm}mm`,
    minHeight: `${heightMm}mm`,
    pixels: Math.round(widthMm * 3.7795),
  };
}

function clampGridValue(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

const GRIDSTACK_CELL_HEIGHT = GRID_CONFIG.rowHeight + GRID_CONFIG.margin[1];
const GRIDSTACK_MARGIN = `0px ${GRID_CONFIG.margin[0] / 2}px ${
  GRID_CONFIG.margin[1]
}px ${GRID_CONFIG.margin[0] / 2}px`;
const GRIDSTACK_CONTENT_HEIGHT_BUFFER = 2;
const CONTENT_GROW_BLOCK_TYPES = new Set<Block['type']>([
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

function blockToGridStackWidget(block: Block): GridStackWidget {
  const { x, y, w, h } = block.gridPosition;

  const widget: GridStackWidget = {
    id: block.id,
    x,
    y,
    w,
    h,
    minW: Math.min(w, 2),
    maxW: w >= GRID_CONFIG.cols ? GRID_CONFIG.cols : undefined,
    noMove: Boolean(block.locked),
    noResize: Boolean(block.locked),
  };

  if (!shouldGrowBlockToContent(block)) {
    widget.minH = 1;
  }

  return widget;
}

function getGridStackBlockId(node: GridStackNode): string | null {
  const id = node.id || node.el?.getAttribute('gs-id');

  return id ? String(id) : null;
}

function findGridStackElement(
  container: HTMLElement,
  blockId: string
): GridItemHTMLElement | null {
  const items = Array.from(
    container.querySelectorAll<GridItemHTMLElement>('.grid-stack-item')
  );

  return (
    items.find((item) => item.getAttribute('data-block-id') === blockId) || null
  );
}

function readGridPositionsById(
  grid: GridStack | null
): Map<string, Block['gridPosition']> {
  const positionsById = new Map<string, Block['gridPosition']>();

  if (!grid) {
    return positionsById;
  }

  grid.getGridItems().forEach((item) => {
    const node = item.gridstackNode;

    if (!node) {
      return;
    }

    const blockId = getGridStackBlockId(node);

    if (!blockId) {
      return;
    }

    positionsById.set(blockId, {
      x: node.x ?? 0,
      y: node.y ?? 0,
      w: node.w ?? 1,
      h: node.h ?? 1,
    });
  });

  return positionsById;
}

function applyGridPositionsToBlocks(
  blocks: Block[],
  positionsById: Map<string, Block['gridPosition']>
): Block[] {
  if (!positionsById.size) {
    return repairGridPositionCollisions(blocks);
  }

  let changed = false;
  const nextBlocks = blocks.map((block) => {
    const nextPosition = positionsById.get(block.id);

    if (!nextPosition) {
      return block;
    }

    const current = block.gridPosition;
    const isSame =
      current.x === nextPosition.x &&
      current.y === nextPosition.y &&
      current.w === nextPosition.w &&
      current.h === nextPosition.h;

    if (isSame) {
      return block;
    }

    changed = true;

    return {
      ...block,
      gridPosition: nextPosition,
    };
  });

  return repairGridPositionCollisions(changed ? nextBlocks : blocks);
}

function shouldGrowBlockToContent(block: Block): boolean {
  return CONTENT_GROW_BLOCK_TYPES.has(block.type);
}

function measureGridItemContentHeight(el: GridItemHTMLElement): number {
  const content = el.querySelector<HTMLElement>('.block-content');
  const measuredContent = content?.querySelector<HTMLElement>(
    '.block-content-measure'
  );

  if (!content) {
    return 0;
  }

  const measurementTarget = measuredContent || content;
  const contentHeight = Math.max(
    measurementTarget.getBoundingClientRect().height,
    measurementTarget.scrollHeight
  );

  return contentHeight;
}

function getContentGridRows(grid: GridStack, el: GridItemHTMLElement): number {
  const wantedHeight = measureGridItemContentHeight(el);

  if (!wantedHeight) {
    return 1;
  }

  const cellHeight = grid.getCellHeight(true);

  return Math.max(
    1,
    Math.ceil(
      (wantedHeight + GRID_CONFIG.margin[1] + GRIDSTACK_CONTENT_HEIGHT_BUFFER) /
        cellHeight
    )
  );
}

function syncGridItemContentMinimum(
  grid: GridStack,
  el: GridItemHTMLElement,
  options: { grow: boolean; shrink?: boolean }
): boolean {
  const node = el.gridstackNode;

  if (!node) {
    return false;
  }

  const minRows = getContentGridRows(grid, el);
  const currentRows = node.h || 1;
  const widget: GridStackWidget = {};

  if (node.minH !== minRows) {
    widget.minH = minRows;
  }

  if (options.grow && currentRows < minRows) {
    widget.h = minRows;
  }

  if (options.shrink && currentRows > minRows) {
    widget.h = minRows;
  }

  if (!Object.keys(widget).length) {
    return false;
  }

  grid.update(el, widget);

  return widget.h !== undefined;
}

export function InvoiceBuilder() {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const colors = useColorScheme();
  const accentColor = useAccentColor();
  const { id: designId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');

  // Load existing design if editing
  const { data: existingDesign, isLoading: isLoadingDesign } = useDesignQuery({
    id: designId,
    enabled: Boolean(designId),
  });

  const company = useCurrentCompany();
  const designSettings = company?.settings;

  const [state, setState] = useState<BuilderState>({
    blocks: [],
    selectedBlockId: null,
    history: [],
    historyIndex: -1,
    zoom: 100,
    templateId: templateId || undefined,
    documentSettings: createDefaultDocumentSettings(designSettings),
    panelMode: 'document',
  });

  // Once company settings load, seed any unset document settings (handles the
  // first render where designSettings may not be ready yet).
  const documentSettingsInitialized = useRef(false);
  useEffect(() => {
    if (documentSettingsInitialized.current || !designSettings) return;
    documentSettingsInitialized.current = true;
    setState((prev) => ({
      ...prev,
      documentSettings: createDefaultDocumentSettings(designSettings),
    }));
  }, [designSettings]);

  const handleUpdateDocumentSettings = useCallback(
    (documentSettings: DocumentSettings) => {
      setState((prev) => ({ ...prev, documentSettings }));
    },
    []
  );

  const [designName, setDesignName] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState(false);

  // Refs so save always reads latest builder state / loaded design. `handleSave` is
  // memoised with shallow deps; without refs, `performSave` would close over stale
  // `state.blocks` whenever only block properties change (same block count).
  const builderStateRef = useRef(state);
  builderStateRef.current = state;
  const designNameRef = useRef(designName);
  designNameRef.current = designName;
  const existingDesignRef = useRef(existingDesign);
  existingDesignRef.current = existingDesign;

  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<GridStack | null>(null);
  const isSyncingGridRef = useRef(false);
  const isDraggingGridRef = useRef(false);
  const isResizingGridRef = useRef(false);
  const shouldFitLoadedContentHeightRef = useRef(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Sidebar drag and drop state.
  const [currentDragDefinition, setCurrentDragDefinition] =
    useState<BlockDefinition | null>(null);
  const [isDraggingBlock, setIsDraggingBlock] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Refs for cleanup
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Load existing design when editing
  useEffect(() => {
    if (existingDesign && designId) {
      try {
        const blocks = extractBlocksFromDesign(existingDesign);
        if (blocks && blocks.length > 0) {
          // Existing designs may not yet have documentSettings — fall back to
          // company defaults so the panel always has a complete object.
          const savedDocSettings = (
            existingDesign.design as { documentSettings?: DocumentSettings }
          )?.documentSettings;

          // Update state with blocks
          shouldFitLoadedContentHeightRef.current = true;
          setState((prev) => ({
            ...prev,
            blocks,
            documentSettings:
              savedDocSettings || createDefaultDocumentSettings(designSettings),
          }));
          documentSettingsInitialized.current = true;
          setDesignName(existingDesign.name);
          setIsEditMode(true);
        } else {
          // Design exists but wasn't created with visual builder
          toast.error('design_not_created_with_visual_builder');
          navigate(route('/settings/invoice_design/custom_designs'));
        }
      } catch (error) {
        toast.error('error_loading_design');
        navigate(route('/settings/invoice_design/custom_designs'));
      }
    }
  }, [existingDesign, designId, navigate, t]);

  // Add to history when blocks change
  const addToHistory = useCallback((blocks: Block[], action: string) => {
    setState((prev) => {
      const repairedBlocks = repairGridPositionCollisions(blocks);
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      // Use structuredClone for better performance and type safety
      const clonedBlocks =
        typeof structuredClone !== 'undefined'
          ? structuredClone(repairedBlocks)
          : JSON.parse(JSON.stringify(repairedBlocks));

      newHistory.push({
        blocks: clonedBlocks,
        timestamp: Date.now(),
        action,
      });

      // Limit history to 50 entries
      if (newHistory.length > 50) {
        newHistory.shift();
      }

      return {
        ...prev,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  // Load template on mount
  useEffect(() => {
    if (templateId) {
      const template = getTemplateById(templateId);
      if (template) {
        // Update state with template blocks
        shouldFitLoadedContentHeightRef.current = true;
        setState((prev) => ({
          ...prev,
          blocks: normalizeSavedBlocksForBuilder(
            template.blocks,
            template.layout
          ),
          templateId: template.id,
        }));
      }
    }
  }, [templateId]);

  const handleUndo = useCallback(() => {
    setState((prev) => {
      if (prev.historyIndex > 0) {
        const newIndex = prev.historyIndex - 1;
        const clonedBlocks =
          typeof structuredClone !== 'undefined'
            ? structuredClone(prev.history[newIndex].blocks)
            : JSON.parse(JSON.stringify(prev.history[newIndex].blocks));
        return {
          ...prev,
          blocks: repairGridPositionCollisions(clonedBlocks),
          historyIndex: newIndex,
        };
      }
      return prev;
    });
  }, []);

  const handleRedo = useCallback(() => {
    setState((prev) => {
      if (prev.historyIndex < prev.history.length - 1) {
        const newIndex = prev.historyIndex + 1;
        const clonedBlocks =
          typeof structuredClone !== 'undefined'
            ? structuredClone(prev.history[newIndex].blocks)
            : JSON.parse(JSON.stringify(prev.history[newIndex].blocks));
        return {
          ...prev,
          blocks: repairGridPositionCollisions(clonedBlocks),
          historyIndex: newIndex,
        };
      }
      return prev;
    });
  }, []);

  const handleUpdateBlock = useCallback((updatedBlock: Block) => {
    setState((prev) => ({
      ...prev,
      blocks: repairGridPositionCollisions(
        prev.blocks.map((block) =>
          block.id === updatedBlock.id ? updatedBlock : block
        )
      ),
    }));
  }, []);

  const handleDeleteBlock = useCallback((blockId: string) => {
    setState((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((block) => block.id !== blockId),
      selectedBlockId:
        prev.selectedBlockId === blockId ? null : prev.selectedBlockId,
    }));
  }, []);

  const handleDuplicateBlock = useCallback((blockId: string) => {
    const currentBlocks = builderStateRef.current.blocks;
    const blockToDuplicate = currentBlocks.find((b) => b.id === blockId);

    if (!blockToDuplicate) {
      return;
    }

    const newBlock: Block = {
      ...blockToDuplicate,
      id: generateBlockId(blockToDuplicate.type),
      gridPosition: {
        ...blockToDuplicate.gridPosition,
        y:
          blockToDuplicate.gridPosition.y + blockToDuplicate.gridPosition.h + 1,
      },
    };
    const newBlocks = repairGridPositionCollisions([
      ...currentBlocks,
      newBlock,
    ]);

    setState((prev) => {
      return {
        ...prev,
        blocks: newBlocks,
        selectedBlockId: newBlock.id,
      };
    });
  }, []);

  const handleSelectBlock = useCallback((blockId: string | null) => {
    setState((prev) => ({
      ...prev,
      selectedBlockId: blockId || null,
    }));
  }, []);

  const handleSidebarDragEnd = useCallback(() => {
    setCurrentDragDefinition(null);
  }, []);

  const syncBlocksFromGrid = useCallback(() => {
    const grid = gridRef.current;

    if (!grid || isSyncingGridRef.current) {
      return;
    }

    const positionsById = readGridPositionsById(grid);

    if (!positionsById.size) {
      return;
    }

    setState((prev) => {
      const blocks = applyGridPositionsToBlocks(prev.blocks, positionsById);

      return blocks === prev.blocks ? prev : { ...prev, blocks };
    });
  }, []);

  const getBlocksWithCurrentGridPositions = useCallback(() => {
    const positionsById = readGridPositionsById(gridRef.current);
    const currentBlocks = builderStateRef.current.blocks;
    const blocks = applyGridPositionsToBlocks(currentBlocks, positionsById);

    if (blocks !== currentBlocks) {
      builderStateRef.current = {
        ...builderStateRef.current,
        blocks,
      };

      setState((prev) => {
        const nextBlocks = applyGridPositionsToBlocks(
          prev.blocks,
          positionsById
        );

        return nextBlocks === prev.blocks
          ? prev
          : { ...prev, blocks: nextBlocks };
      });
    }

    return blocks;
  }, []);

  useEffect(() => {
    const container = gridContainerRef.current;

    if (!container || gridRef.current) {
      return;
    }

    const grid = GridStack.init(
      {
        column: GRID_CONFIG.cols,
        cellHeight: GRIDSTACK_CELL_HEIGHT,
        margin: GRIDSTACK_MARGIN,
        float: false,
        animate: true,
        auto: false,
        acceptWidgets: false,
        draggable: {
          handle: '.drag-handle',
          appendTo: 'body',
          scroll: true,
        },
        resizable: {
          handles: 'e,se,s',
          autoHide: true,
        },
      },
      container
    );

    gridRef.current = grid;

    const handleGridChange = () => {
      if (isDraggingGridRef.current || isResizingGridRef.current) {
        return;
      }

      syncBlocksFromGrid();
    };
    const handleDragStart = () => {
      isDraggingGridRef.current = true;
      setIsDraggingBlock(true);
    };
    const handleDragStop = () => {
      isDraggingGridRef.current = false;
      setIsDraggingBlock(false);
      syncBlocksFromGrid();
    };
    const handleResizeStart = (_event: Event, el: GridItemHTMLElement) => {
      isResizingGridRef.current = true;
      setIsResizing(true);

      const blockId = el.getAttribute('data-block-id');
      const block = builderStateRef.current.blocks.find(
        (currentBlock) => currentBlock.id === blockId
      );

      if (block && shouldGrowBlockToContent(block)) {
        syncGridItemContentMinimum(grid, el, { grow: false });
      }
    };
    const handleResizeStop = (_event: Event, el: GridItemHTMLElement) => {
      requestAnimationFrame(() => {
        const blockId = el.getAttribute('data-block-id');
        const block = builderStateRef.current.blocks.find(
          (currentBlock) => currentBlock.id === blockId
        );

        if (block && shouldGrowBlockToContent(block)) {
          syncGridItemContentMinimum(grid, el, { grow: true });
        }

        isResizingGridRef.current = false;
        setIsResizing(false);
        syncBlocksFromGrid();
      });
    };

    grid.on('change', handleGridChange);
    grid.on('dragstart', handleDragStart);
    grid.on('dragstop', handleDragStop);
    grid.on('resizestart', handleResizeStart);
    grid.on('resizestop', handleResizeStop);

    return () => {
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      grid.offAll();
      grid.destroy(false);
      gridRef.current = null;
    };
  }, [syncBlocksFromGrid]);

  useEffect(() => {
    const grid = gridRef.current;
    const container = gridContainerRef.current;

    if (!grid || !container) {
      return;
    }

    const repairedBlocks = repairGridPositionCollisions(state.blocks);

    if (repairedBlocks !== state.blocks) {
      setState((prev) => {
        const nextBlocks = repairGridPositionCollisions(prev.blocks);

        return nextBlocks === prev.blocks
          ? prev
          : { ...prev, blocks: nextBlocks };
      });
      return;
    }

    isSyncingGridRef.current = true;
    grid.batchUpdate();

    const blockIds = new Set(state.blocks.map((block) => block.id));

    grid.engine.nodes
      .filter((node) => {
        const blockId = getGridStackBlockId(node);

        return blockId ? !blockIds.has(blockId) : false;
      })
      .forEach((node) => {
        if (node.el) {
          grid.removeWidget(node.el, false, false);
        }
      });

    grid.getGridItems().forEach((item) => {
      const blockId =
        item.getAttribute('data-block-id') ||
        (item.gridstackNode ? getGridStackBlockId(item.gridstackNode) : null);

      if (!blockId || !blockIds.has(blockId)) {
        grid.removeWidget(item, false, false);
      }
    });

    state.blocks.forEach((block) => {
      const item = findGridStackElement(container, block.id);

      if (!item) {
        return;
      }

      const widget = blockToGridStackWidget(block);

      if (!item.gridstackNode) {
        grid.makeWidget(item, widget);
      } else {
        grid.update(item, widget);
      }
    });

    grid.batchUpdate(false);
    isSyncingGridRef.current = false;

    requestAnimationFrame(() => {
      if (isDraggingGridRef.current || isResizingGridRef.current) {
        return;
      }

      const shouldFitLoadedContentHeight =
        shouldFitLoadedContentHeightRef.current;
      let didResizeToContent = false;

      state.blocks.forEach((block) => {
        if (!shouldGrowBlockToContent(block)) {
          return;
        }

        const item = findGridStackElement(container, block.id);

        if (item) {
          didResizeToContent =
            syncGridItemContentMinimum(grid, item, {
              grow: true,
              shrink: shouldFitLoadedContentHeight,
            }) || didResizeToContent;
        }
      });

      if (shouldFitLoadedContentHeight) {
        shouldFitLoadedContentHeightRef.current = false;
      }

      if (didResizeToContent) {
        syncBlocksFromGrid();
      }
    });
  }, [
    state.blocks,
    state.documentSettings.globalFontSize,
    state.documentSettings.primaryFont,
    syncBlocksFromGrid,
  ]);

  useEffect(() => {
    const grid = gridRef.current;
    const container = gridContainerRef.current;

    resizeObserverRef.current?.disconnect();

    if (!grid || !container) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      requestAnimationFrame(() => {
        if (
          isDraggingGridRef.current ||
          isResizingGridRef.current ||
          isSyncingGridRef.current
        ) {
          return;
        }

        const itemsToGrow = new Set<GridItemHTMLElement>();

        entries.forEach((entry) => {
          const item = (entry.target as HTMLElement).closest(
            '.grid-stack-item'
          ) as GridItemHTMLElement | null;

          if (!item) {
            return;
          }

          const blockId = item.getAttribute('data-block-id');
          const block = builderStateRef.current.blocks.find(
            (currentBlock) => currentBlock.id === blockId
          );

          if (block && shouldGrowBlockToContent(block)) {
            itemsToGrow.add(item);
          }
        });

        let didGrow = false;
        itemsToGrow.forEach((item) => {
          didGrow =
            syncGridItemContentMinimum(grid, item, { grow: true }) || didGrow;
        });

        if (didGrow) {
          syncBlocksFromGrid();
        }
      });
    });

    state.blocks.forEach((block) => {
      if (!shouldGrowBlockToContent(block)) {
        return;
      }

      const item = findGridStackElement(container, block.id);
      const content = item?.querySelector<HTMLElement>('.block-content');
      const measuredContent = item?.querySelector<HTMLElement>(
        '.block-content-measure'
      );

      if (!content) {
        return;
      }

      observer.observe(content);
      if (measuredContent) {
        observer.observe(measuredContent);
      }
      (measuredContent || content)
        .querySelectorAll<HTMLElement>('table, thead, tbody')
        .forEach((child) => observer.observe(child));
    });

    resizeObserverRef.current = observer;

    return () => {
      observer.disconnect();
      if (resizeObserverRef.current === observer) {
        resizeObserverRef.current = null;
      }
    };
  }, [state.blocks, syncBlocksFromGrid]);

  const handleCanvasDragOver = useCallback(
    (event: ReactDragEvent<HTMLDivElement>) => {
      if (!currentDragDefinition) {
        return;
      }

      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    },
    [currentDragDefinition]
  );

  const handleCanvasDrop = useCallback(
    (event: ReactDragEvent<HTMLDivElement>) => {
      if (!currentDragDefinition) {
        return;
      }

      event.preventDefault();

      let data: BlockDefinition | null = null;

      try {
        const dataString = event.dataTransfer.getData('application/json');
        if (dataString) {
          data = JSON.parse(dataString) as BlockDefinition;
        }
      } catch (error) {
        console.error('Failed to parse dropped block data:', error);
      }

      const definition = data || currentDragDefinition;

      if (!definition) {
        toast.error('error_dropping_block');
        setCurrentDragDefinition(null);
        return;
      }

      const gridElement = gridContainerRef.current;

      if (!gridElement) {
        toast.error('error_dropping_block');
        setCurrentDragDefinition(null);
        return;
      }

      const size = getContentConstrainedGridSize(definition, {
        inheritedFontSize: state.documentSettings.globalFontSize,
      });
      const gridRect = gridElement.getBoundingClientRect();
      const scale = state.zoom / 100 || 1;
      const relativeX = (event.clientX - gridRect.left) / scale;
      const relativeY = (event.clientY - gridRect.top) / scale;
      const unscaledGridWidth = gridRect.width / scale;
      const columnWidth = unscaledGridWidth / GRID_CONFIG.cols;
      const rowUnit = GRIDSTACK_CELL_HEIGHT;
      const x = clampGridValue(
        Math.floor(relativeX / columnWidth),
        0,
        GRID_CONFIG.cols - size.w
      );
      const y = Math.max(0, Math.floor(relativeY / rowUnit));
      const newBlockId = generateBlockId(definition.type);

      const seededProperties = { ...definition.defaultProperties };
      const companyPrimary = designSettings?.primary_color;
      if (companyPrimary) {
        if (
          (definition.type === 'table' || definition.type === 'tasks-table') &&
          'headerColor' in seededProperties
        ) {
          seededProperties.headerColor = companyPrimary;
        }
        if (definition.type === 'divider' && 'color' in seededProperties) {
          seededProperties.color = companyPrimary;
        }
      }

      const newBlock: Block = {
        id: newBlockId,
        type: definition.type,
        gridPosition: {
          x,
          y,
          w: size.w,
          h: size.h,
        },
        properties: seededProperties,
      };

      setState((prev) => {
        const newBlocks = repairGridPositionCollisions([
          ...prev.blocks,
          newBlock,
        ]);
        const timeoutId = setTimeout(() => {
          addToHistory(newBlocks, `Add ${definition.type}`);
          timeoutRefs.current = timeoutRefs.current.filter(
            (id) => id !== timeoutId
          );
        }, 0);
        timeoutRefs.current.push(timeoutId);

        return {
          ...prev,
          blocks: newBlocks,
          selectedBlockId: null,
        };
      });

      setCurrentDragDefinition(null);
    },
    [
      addToHistory,
      currentDragDefinition,
      designSettings?.primary_color,
      state.documentSettings.globalFontSize,
      state.zoom,
    ]
  );

  const compactLayout = useCallback(() => {
    const grid = gridRef.current;

    if (!grid) {
      return;
    }

    grid.compact();
    syncBlocksFromGrid();
  }, [syncBlocksFromGrid]);

  const selectedBlock = state.blocks.find(
    (b) => b.id === state.selectedBlockId
  );

  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [designNameInput, setDesignNameInput] = useState<string>('');

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((timeoutId) => clearTimeout(timeoutId));
      timeoutRefs.current = [];
    };
  }, []);

  const handleSave = useCallback(async () => {
    if (!state.blocks.length) {
      toast.error('add_blocks_first');
      return;
    }

    // For new designs, show modal for name
    if (!isEditMode && !designName) {
      const defaultName = 'Visual Design ' + new Date().toLocaleDateString();
      setDesignNameInput(defaultName);
      setShowNameModal(true);
      return;
    }

    await performSave();
  }, [isEditMode, designName, state.blocks.length]);

  const performSave = async (nameToUseParam?: string) => {
    const nameToUse =
      nameToUseParam ||
      designNameRef.current ||
      'Visual Design ' + new Date().toLocaleDateString();

    setSaving(true);

    try {
      const blocks = getBlocksWithCurrentGridPositions();

      // Save path: emit HTML with literal $tokens so the backend's
      // HtmlEngine::parseLabelsAndValues can substitute real data at render time.
      // Pass the per-template document settings so styling baked into the saved
      // HTML reflects the builder's globals (not the generator's hardcoded
      // fallbacks).
      const htmlBody = generateInvoiceHTML(
        blocks,
        undefined,
        documentSettingsToGeneratorShape(
          builderStateRef.current.documentSettings
        )
      );

      // PUT must send the full Design resource (same as custom design editor): merge
      // with the loaded design so `design.blocks`, `body`, and other `design.*`
      // parts persist. Sending only a partial `design` object can overwrite or
      // drop keys the API merges into the JSON `design` column.
      const mergedParts = mergeDesignParts(
        blocks,
        htmlBody,
        existingDesignRef.current?.design,
        builderStateRef.current.documentSettings
      );

      if (isEditMode && designId) {
        const loaded = existingDesignRef.current;
        if (!loaded) {
          toast.error('loading');
          return;
        }

        const designPayload: Design = {
          ...loaded,
          name: nameToUse,
          design: mergedParts,
        };

        await request(
          'PUT',
          endpoint('/api/v1/designs/:id', { id: designId }),
          designPayload
        );
        $refetch(['designs']);
        toast.success('updated_design');
      } else {
        const designPayload = {
          name: nameToUse,
          design: mergedParts,
          is_custom: true,
          entities: 'invoice,quote,credit',
        };

        const response = (await request(
          'POST',
          endpoint('/api/v1/designs'),
          designPayload
        )) as GenericSingleResourceResponse<Design>;
        $refetch(['designs']);
        toast.success('saved_design');
        // Navigate to edit mode for the new design
        navigate(
          route('/settings/invoice_design/builder/:id', {
            id: response.data.data.id,
          })
        );
        setIsEditMode(true);
        setDesignName(nameToUse);
        setShowNameModal(false);
      }
    } catch (error: unknown) {
      const errorResponse = (
        error as {
          response?: {
            status?: number;
            data?: { errors?: Record<string, string[]>; message?: string };
          };
        }
      )?.response;
      const errorMessage =
        errorResponse?.data?.message ||
        (error instanceof Error ? error.message : undefined);

      if (errorResponse?.status === 422) {
        setShowNameModal(true);
        toast.error(errorMessage || 'error_saving_design');
      } else {
        setShowNameModal(false);
        toast.error(errorMessage || 'error_saving_design');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleNameModalConfirm = () => {
    if (!designNameInput.trim()) {
      toast.error('design_name_required');
      return;
    }
    setDesignName(designNameInput.trim());
    performSave(designNameInput.trim());
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  useSaveBtn(
    {
      onClick: handleSave,
      disableSaveButton: saving || state.blocks.length === 0,
    },
    [saving, state.blocks.length, handleSave, isEditMode, designId]
  );

  // Show loading state when loading existing design
  if (isLoadingDesign && designId && state.blocks.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  const pageDimensions = getPageDimensions(
    state.documentSettings.pageSize,
    state.documentSettings.pageLayout
  );

  return (
    <>
      <Card
        className="mb-4"
        withoutBodyPadding
        style={{ borderColor: colors.$24 }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 group">
            <Type className="w-4 h-4" style={{ color: colors.$17 }} />

            <InputField
              value={designName || ''}
              onValueChange={(value) => setDesignName(value)}
              placeholder={t('design_name')}
              className="w-64 !border-0 !bg-transparent focus:ring-0 focus:border-b focus:border-gray-300"
              debounceTimeout={0}
              changeOverride
            />

            <Pencil
              className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: colors.$17 }}
            />
          </div>

          {/* Action Buttons - Right Side */}
          <div className="flex items-center gap-2">
            <Button
              type="secondary"
              behavior="button"
              onClick={handleUndo}
              disabled={state.historyIndex <= 0}
              className="p-2"
              disableWithoutIcon={state.historyIndex <= 0}
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              type="secondary"
              behavior="button"
              onClick={handleRedo}
              disabled={state.historyIndex >= state.history.length - 1}
              className="p-2"
              disableWithoutIcon={
                state.historyIndex >= state.history.length - 1
              }
            >
              <Redo2 className="w-4 h-4" />
            </Button>
            <Button
              type="secondary"
              behavior="button"
              onClick={compactLayout}
              disabled={state.blocks.length === 0}
              className="flex items-center gap-2"
            >
              <LayoutGrid className="w-4 h-4" />
              {t('fix_overlaps')}
            </Button>
            <Button
              type={state.selectedBlockId === null ? 'primary' : 'secondary'}
              behavior="button"
              onClick={() => handleSelectBlock(null)}
              className="flex items-center gap-2"
            >
              <SettingsIcon className="w-4 h-4" />
              {t('settings')}
            </Button>
            <Button
              type="secondary"
              behavior="button"
              onClick={handlePreview}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {t('preview')}
            </Button>
            <button
              type="button"
              onClick={() => {
                const json = JSON.stringify(
                  {
                    blocks: state.blocks,
                    templateId: state.templateId,
                  },
                  null,
                  2
                );
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `invoice-design-${Date.now()}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast.success('json_downloaded');
              }}
              disabled={state.blocks.length === 0}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title={String(t('download_json'))}
            >
              <FileJson className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      <div
        className="flex h-screen overflow-hidden"
        style={{ backgroundColor: colors.$23 }}
      >
        <div
          className="w-72 flex flex-col overflow-hidden rounded-md"
          style={{
            backgroundColor: colors.$1,
            border: `1px solid ${colors.$24}`,
          }}
        >
          <div
            className="p-4"
            style={{ borderBottom: `1px solid ${colors.$24}` }}
          >
            <h2 className="font-semibold text-lg" style={{ color: colors.$3 }}>
              {t('components')}
            </h2>
            <p className="text-sm mt-1" style={{ color: colors.$17 }}>
              {t('drag_and_drop_to_add')}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <ComponentLibrary
              onDragStart={setCurrentDragDefinition}
              onDragEnd={handleSidebarDragEnd}
            />
          </div>
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Canvas Area */}
          <div className="flex-1 overflow-auto p-8 bg-gray-100">
            <div
              className={`invoice-gridstack-page mx-auto bg-white shadow-2xl relative transition-all canvas-drop-target ${
                currentDragDefinition ? 'drag-over' : ''
              }`}
              style={{
                width: pageDimensions.width,
                minHeight: pageDimensions.minHeight,
                fontSize: `${state.documentSettings.globalFontSize}px`,
                fontFamily: `'${state.documentSettings.primaryFont.replace(
                  /_/g,
                  ' '
                )}', sans-serif`,
                color: '#000000',
                transform: `scale(${state.zoom / 100})`,
                transformOrigin: 'top center',
              }}
              onDragOver={handleCanvasDragOver}
              onDrop={handleCanvasDrop}
              onClick={(e) => {
                // Deselect when clicking on canvas background (not on a block)
                const target = e.target as HTMLElement;
                if (
                  target === e.currentTarget ||
                  target.classList.contains('invoice-gridstack-page') ||
                  target.classList.contains('invoice-gridstack-stage') ||
                  target.classList.contains('invoice-gridstack-grid')
                ) {
                  handleSelectBlock(null);
                }
              }}
            >
              <div
                className="invoice-gridstack-stage"
                style={{
                  padding: `${GRID_CONFIG.containerPadding[1]}px ${GRID_CONFIG.containerPadding[0]}px`,
                }}
              >
                <div
                  ref={gridContainerRef}
                  className={`grid-stack invoice-gridstack-grid ${
                    isDraggingBlock ? 'is-dragging' : ''
                  } ${isResizing ? 'is-resizing' : ''}`}
                  style={{
                    minHeight: `calc(${pageDimensions.minHeight} - ${
                      GRID_CONFIG.containerPadding[1] * 2
                    }px)`,
                  }}
                >
                  {state.blocks.map((block) => (
                    <div
                      key={block.id}
                      className={`grid-stack-item ${
                        state.selectedBlockId === block.id ? 'selected' : ''
                      }`}
                      data-block-id={block.id}
                      gs-id={block.id}
                      gs-x={block.gridPosition.x}
                      gs-y={block.gridPosition.y}
                      gs-w={block.gridPosition.w}
                      gs-h={block.gridPosition.h}
                    >
                      <div className="grid-stack-item-content">
                        <div
                          className={`
                            block-wrapper
                            group rounded-lg transition-all duration-200
                            ${
                              state.selectedBlockId === block.id
                                ? 'z-10 selected'
                                : ''
                            }
                            ${
                              shouldGrowBlockToContent(block)
                                ? 'block-wrapper--grow-to-content'
                                : ''
                            }
                          `}
                          style={{
                            backgroundColor: colors.$1,
                            outline: `1px dashed ${
                              state.selectedBlockId === block.id
                                ? colors.$3
                                : colors.$24
                            }`,
                          }}
                          onClick={() => {
                            handleSelectBlock(block.id);
                          }}
                        >
                          {/* Editor controls are overlay chrome and do not affect invoice layout height. */}
                          <div
                            className="block-topbar drag-handle h-7 rounded-t px-3 flex items-center justify-between text-xs cursor-move transition-colors"
                            style={{
                              backgroundColor: accentColor,
                              color: '#ffffff',
                              borderBottom: `1px solid ${accentColor}80`,
                            }}
                          >
                            {/* Drag Handle Icon */}
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <GripVertical className="w-3 h-3 flex-shrink-0 text-white/70" />
                              <span className="font-medium truncate text-white">
                                <BlockLabel type={block.type} />
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1 items-center flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  const blockJson = JSON.stringify(
                                    block,
                                    null,
                                    2
                                  );
                                  navigator.clipboard.writeText(blockJson);
                                  toast.success('block_copied_to_clipboard');
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                className="p-1 rounded transition-colors text-white/80 hover:text-white hover:bg-white/20"
                                title={String(t('copy_block_to_clipboard'))}
                              >
                                <Clipboard className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  handleDuplicateBlock(block.id);
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                className="p-1 rounded transition-colors text-white/80 hover:text-white hover:bg-white/20"
                                title={String(t('duplicate_block'))}
                              >
                                ⎘
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  handleDeleteBlock(block.id);
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                className="p-1 rounded transition-colors text-white/80 hover:text-white hover:bg-red-500"
                                title={String(t('delete_block'))}
                              >
                                ×
                              </button>
                            </div>
                          </div>

                          {/* Invoice content - clicking here selects the block */}
                          <div
                            className="block-content cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectBlock(block.id);
                            }}
                          >
                            <div className="block-content-measure">
                              <BlockRenderer block={block} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Empty State */}
                {state.blocks.length === 0 && (
                  <div
                    className="invoice-gridstack-empty-state pointer-events-none flex items-center justify-center"
                    style={{ color: colors.$17 }}
                  >
                    <div className="text-center">
                      <Download className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">
                        {t('drag_components_here')}
                      </p>
                      <p className="text-sm mt-2">
                        {t('start_building_your_invoice')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Properties Panel */}
        <div
          className="w-80 flex flex-col overflow-hidden rounded-md"
          style={{
            backgroundColor: colors.$1,
            border: `1px solid ${colors.$24}`,
          }}
        >
          <div className="flex-1 overflow-y-auto">
            {selectedBlock ? (
              <PropertyPanel
                block={selectedBlock}
                onChange={handleUpdateBlock}
                onDelete={() => handleDeleteBlock(selectedBlock.id)}
                onDuplicate={() => handleDuplicateBlock(selectedBlock.id)}
              />
            ) : (
              <DocumentSettingsPanel
                settings={state.documentSettings}
                onChange={handleUpdateDocumentSettings}
              />
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          blocks={state.blocks}
          onClose={() => setShowPreview(false)}
          designSettings={documentSettingsToGeneratorShape(
            state.documentSettings
          )}
        />
      )}

      {/* Design Name Modal */}
      <Modal
        visible={showNameModal}
        onClose={(status) => {
          setShowNameModal(false);
          if (!status && !designName) {
            // User cancelled, don't save
            return;
          }
        }}
        title={String(t('name'))}
        size="small"
      >
        <div className="space-y-4">
          <div
            onKeyDown={(e: KeyboardEvent) => {
              if (e.key === 'Enter') {
                handleNameModalConfirm();
              }
            }}
          >
            <InputField
              id="design-name"
              value={designNameInput}
              onValueChange={(value) => setDesignNameInput(value)}
              placeholder={String(t('design_name'))}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="secondary"
              behavior="button"
              onClick={() => setShowNameModal(false)}
            >
              {t('cancel')}
            </Button>
            <Button
              type="primary"
              behavior="button"
              onClick={handleNameModalConfirm}
            >
              {t('save')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function BlockLabel({ type }: { type: string }) {
  const label = useBlockLabel(type);

  return <>{label}</>;
}

export default InvoiceBuilder;
