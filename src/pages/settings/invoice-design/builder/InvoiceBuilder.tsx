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
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GridLayout from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
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
import { PageBreakGuides } from './components/PageBreakGuides';
import { useBlockLabel } from './block-library';
import { getContentConstrainedGridSize } from './utils/block-sizing';
import { generateInvoiceHTML } from './utils/html-generator';
import { annotateBlocksWithRowLayout } from './utils/row-layout';
import { pushLayoutCollisionsDown } from './utils/layout-normalizer';
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
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './InvoiceBuilder.css';

/**
 * Extract blocks from design object
 */
function extractBlocksFromDesign(design: Design): Block[] | null {
  const blocks = design.design?.blocks;
  if (Array.isArray(blocks) && blocks.length > 0) {
    return blocks as Block[];
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
  const annotatedBlocks = annotateBlocksWithRowLayout(blocks);

  return {
    includes: previous?.includes ?? '',
    header: previous?.header ?? '',
    body: htmlBody,
    product: previous?.product ?? '',
    task: previous?.task ?? '',
    footer: previous?.footer ?? '',
    blocks: annotatedBlocks,
    documentSettings,
    ...(previous?.pageSettings
      ? { pageSettings: previous.pageSettings }
      : {}),
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

function blocksToLayout(blocks: Block[]): Layout[] {
  return blocks.map((block) => ({
    i: block.id,
    x: block.gridPosition.x,
    y: block.gridPosition.y,
    w: block.gridPosition.w,
    h: block.gridPosition.h,
    // minW must be <= w, otherwise react-grid-layout will warn
    minW: Math.min(block.gridPosition.w, 2),
    minH: Math.min(block.gridPosition.h, 1),
    maxW: block.gridPosition.w >= 12 ? 12 : undefined,
  }));
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

  const [layout, setLayout] = useState<Layout[]>([]);

  // Drag and drop state
  const [droppingItem, setDroppingItem] = useState<
    { i: string; w: number; h: number } | undefined
  >();
  const [currentDragDefinition, setCurrentDragDefinition] =
    useState<BlockDefinition | null>(null);
  const [justDropped, setJustDropped] = useState(false);
  const [isDraggingBlock, setIsDraggingBlock] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Refs for cleanup
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  // Ref to track if we're manually setting layout (to prevent useEffect from overwriting)
  const isManuallySettingLayout = useRef(false);
  const isResizeInteraction = useRef(false);
  const justDroppedRef = useRef(false);

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
          setState((prev) => ({
            ...prev,
            blocks,
            documentSettings:
              savedDocSettings || createDefaultDocumentSettings(designSettings),
          }));
          documentSettingsInitialized.current = true;
          // Immediately convert blocks to layout format to ensure proper positioning
          isManuallySettingLayout.current = true;
          const initialLayout = blocksToLayout(blocks);
          setLayout(initialLayout);
          // Reset flag after a brief delay to allow layout to be set
          setTimeout(() => {
            isManuallySettingLayout.current = false;
          }, 0);
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
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      // Use structuredClone for better performance and type safety
      const clonedBlocks =
        typeof structuredClone !== 'undefined'
          ? structuredClone(blocks)
          : JSON.parse(JSON.stringify(blocks));

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
        setState((prev) => ({
          ...prev,
          blocks: template.blocks,
          templateId: template.id,
        }));
        // Immediately convert blocks to layout format to ensure proper positioning
        isManuallySettingLayout.current = true;
        const initialLayout = blocksToLayout(template.blocks);
        setLayout(initialLayout);
        // Reset flag after a brief delay to allow layout to be set
        setTimeout(() => {
          isManuallySettingLayout.current = false;
        }, 0);
      }
    }
  }, [templateId]);

  // Convert blocks to react-grid-layout format
  useEffect(() => {
    // Skip if we're manually setting layout (e.g., when loading a design)
    if (isManuallySettingLayout.current) {
      return;
    }

    const newLayout = blocksToLayout(state.blocks);
    setLayout(newLayout);
  }, [state.blocks]);

  const syncBlocksToLayout = useCallback((newLayout: Layout[]) => {
    setState((prev) => {
      const updatedBlocks = prev.blocks.map((block) => {
        const layoutItem = newLayout.find((l) => l.i === block.id);
        if (layoutItem) {
          return {
            ...block,
            gridPosition: {
              x: layoutItem.x,
              y: layoutItem.y,
              w: layoutItem.w,
              h: layoutItem.h,
            },
          };
        }
        return block;
      });
      return { ...prev, blocks: updatedBlocks };
    });
  }, []);

  // Keep the block model in sync with react-grid-layout, with resize-only
  // overlap cleanup so growing one widget can make room below it.
  const handleLayoutChange = useCallback(
    (newLayout: Layout[]) => {
      // Ignore layout changes immediately after external drop
      if (justDropped || justDroppedRef.current) {
        return;
      }

      const layoutToApply = isResizeInteraction.current
        ? pushLayoutCollisionsDown(newLayout)
        : newLayout;

      if (isResizeInteraction.current) {
        setLayout(layoutToApply);
      }

      // Update block positions to match the layout
      syncBlocksToLayout(layoutToApply);
    },
    [justDropped, syncBlocksToLayout]
  );

  const handleResizeStart = useCallback(() => {
    isResizeInteraction.current = true;
    setIsResizing(true);
  }, []);

  const handleResizeStop = useCallback(
    (newLayout: Layout[]) => {
      const layoutToApply = pushLayoutCollisionsDown(newLayout);

      setLayout(layoutToApply);
      syncBlocksToLayout(layoutToApply);

      const resizeTimeoutId = setTimeout(() => {
        isResizeInteraction.current = false;
        setIsResizing(false);
        timeoutRefs.current = timeoutRefs.current.filter(
          (id) => id !== resizeTimeoutId
        );
      }, 0);

      timeoutRefs.current.push(resizeTimeoutId);
    },
    [syncBlocksToLayout]
  );

  const handleGridDragStart = useCallback(() => {
    setIsDraggingBlock(true);
  }, []);

  const handleGridDragStop = useCallback(
    (newLayout: Layout[]) => {
      setLayout(newLayout);
      syncBlocksToLayout(newLayout);

      const dragTimeoutId = setTimeout(() => {
        setIsDraggingBlock(false);
        timeoutRefs.current = timeoutRefs.current.filter(
          (id) => id !== dragTimeoutId
        );
      }, 0);

      timeoutRefs.current.push(dragTimeoutId);
    },
    [syncBlocksToLayout]
  );

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
          blocks: clonedBlocks,
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
          blocks: clonedBlocks,
          historyIndex: newIndex,
        };
      }
      return prev;
    });
  }, []);

  const handleUpdateBlock = useCallback((updatedBlock: Block) => {
    setState((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === updatedBlock.id ? updatedBlock : block
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
          blockToDuplicate.gridPosition.y +
          blockToDuplicate.gridPosition.h +
          1,
      },
    };
    const newBlocks = [...currentBlocks, newBlock];

    setLayout(blocksToLayout(newBlocks));
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

  // Set droppingItem immediately when drag definition changes
  useEffect(() => {
    if (currentDragDefinition) {
      const size = getContentConstrainedGridSize(currentDragDefinition);
      const item = {
        i: '__dropping-elem__',
        w: size.w,
        h: size.h,
      };
      setDroppingItem(item);
    } else {
      // Clear when not dragging
      setDroppingItem(undefined);
    }
  }, [currentDragDefinition]);

  const handleDrop = useCallback(
    (_layout: Layout[], layoutItem: Layout, event: Event) => {
      const nativeEvent = event as DragEvent;
      let data: BlockDefinition | null = null;

      try {
        const dataString =
          nativeEvent.dataTransfer?.getData('application/json');
        if (dataString) {
          data = JSON.parse(dataString) as BlockDefinition;
        }
      } catch (error) {
        console.error('Failed to parse dropped block data:', error);
        // If parsing fails, use currentDragDefinition as fallback
      }

      // Use currentDragDefinition as the source since dataTransfer might be empty
      const definition = data || currentDragDefinition;

      if (!definition) {
        toast.error('error_dropping_block');
        setCurrentDragDefinition(null);
        return;
      }

      // Use content-constrained sizing for new blocks, and layoutItem for x/y.
      const newBlockId = generateBlockId(definition.type);
      const size = getContentConstrainedGridSize(definition);

      // Seed branding-relevant accents from the company's primary color so
      // dropped blocks adopt the brand. Limited to surfaces that read as
      // accents (table header bg, divider line) — text color and totals stay
      // on their per-block defaults so readability is preserved.
      const seededProperties = { ...definition.defaultProperties };
      const companyPrimary = designSettings?.primary_color;
      if (companyPrimary) {
        if (
          (definition.type === 'table' ||
            definition.type === 'tasks-table') &&
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
          x: layoutItem.x,
          y: layoutItem.y,
          w: size.w,
          h: size.h,
        },
        properties: seededProperties,
      };

      // Update state with the new block
      // The layout will be synced via useEffect when state.blocks changes
      setState((prev) => {
        const newBlocks = [...prev.blocks, newBlock];

        // Add to history with self-cleanup
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
          // Don't auto-select after drop to avoid toolbar showing immediately
          selectedBlockId: null,
        };
      });

      // Set flag to prevent handleLayoutChange from overwriting the drop position
      // Use a very short timeout to allow the grid to process but then immediately
      // allow layout changes to sync block positions (resolves overlap issues)
      justDroppedRef.current = true;
      setJustDropped(true);
      const dropTimeoutId = setTimeout(() => {
        justDroppedRef.current = false;
        setJustDropped(false);
        setTimeout(() => compactLayout(), 50);
        timeoutRefs.current = timeoutRefs.current.filter(
          (id) => id !== dropTimeoutId
        );
      }, 50);
      timeoutRefs.current.push(dropTimeoutId);

      // Clear the drag state
      setCurrentDragDefinition(null);
    },
    [addToHistory, currentDragDefinition]
  );

  // Called by react-grid-layout during drag over
  const handleDropDragOver = useCallback(() => {
    // Return the dimensions for the placeholder
    // This tells react-grid-layout how big the dropping item should be
    if (droppingItem) {
      return { w: droppingItem.w, h: droppingItem.h };
    }
    return { w: 6, h: 3 }; // Default fallback size
  }, [droppingItem]);

  const compactLayout = useCallback(() => {
    setLayout((prevLayout) => {
      const sorted = [...prevLayout].sort((a, b) => {
        if (a.y !== b.y) return a.y - b.y;
        return a.x - b.x;
      });

      const compacted: Layout[] = [];

      for (const item of sorted) {
        let newY = item.y;

        while (newY > 0) {
          const testY = newY - 1;
          const wouldOverlap = compacted.some(
            (other) =>
              item.x < other.x + other.w &&
              item.x + item.w > other.x &&
              testY < other.y + other.h &&
              item.h + testY > other.y
          );
          if (wouldOverlap) break;
          newY = testY;
        }
        compacted.push({ ...item, y: newY });
      }

      setState((prev) => ({
        ...prev,
        blocks: prev.blocks.map((block) => {
          const layoutItem = compacted.find((l) => l.i === block.id);
          if (layoutItem) {
            return {
              ...block,
              gridPosition: {
                x: layoutItem.x,
                y: layoutItem.y,
                w: layoutItem.w,
                h: layoutItem.h,
              },
            };
          }
          return block;
        }),
      }));

      return compacted;
    });
  }, []);

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
      const blocks = builderStateRef.current.blocks;

      // Save path: emit HTML with literal $tokens so the backend's
      // HtmlEngine::parseLabelsAndValues can substitute real data at render time.
      // Pass the per-template document settings so styling baked into the saved
      // HTML reflects the builder's globals (not the generator's hardcoded
      // fallbacks).
      const htmlBody = generateInvoiceHTML(
        blocks,
        undefined,
        documentSettingsToGeneratorShape(builderStateRef.current.documentSettings)
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
  if (isLoadingDesign && designId) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

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
            {t('page_settings')}
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
              className={`mx-auto bg-white shadow-2xl relative transition-all canvas-drop-target`}
              style={{
                width: getPageDimensions(
                  state.documentSettings.pageSize,
                  state.documentSettings.pageLayout
                ).width,
                minHeight: getPageDimensions(
                  state.documentSettings.pageSize,
                  state.documentSettings.pageLayout
                ).minHeight,
                fontSize: `${state.documentSettings.globalFontSize}px`,
                fontFamily: `'${state.documentSettings.primaryFont.replace(/_/g, ' ')}', sans-serif`,
                color: '#000000',
                transform: `scale(${state.zoom / 100})`,
                transformOrigin: 'top center',
            }}
            onClick={(e) => {
              // Deselect when clicking on canvas background (not on a block)
              const target = e.target as HTMLElement;
              if (
                target === e.currentTarget ||
                target.classList.contains('react-grid-layout') ||
                target.classList.contains('layout')
              ) {
                handleSelectBlock(null);
              }
            }}
          >
            <PageBreakGuides
              blocks={state.blocks}
              pageSize={designSettings?.page_size}
            />

            <GridLayout
              className="layout"
              layout={layout}
              onLayoutChange={handleLayoutChange}
              onDragStart={handleGridDragStart}
              onDragStop={handleGridDragStop}
              onResizeStart={handleResizeStart}
              onResizeStop={handleResizeStop}
              onDrop={handleDrop}
              onDropDragOver={handleDropDragOver}
              cols={12}
              rowHeight={60}
              width={
                getPageDimensions(
                  state.documentSettings.pageSize,
                  state.documentSettings.pageLayout
                ).pixels
              }
              margin={[10, 16]} // [horizontal, vertical] - vertical is 1rem (16px)
              containerPadding={[30, 30]}
              draggableHandle=".drag-handle"
              isDraggable
              isResizable
              isDroppable
              droppingItem={droppingItem}
              compactType="vertical" // Pack items toward top (Grafana-style)
              preventCollision={!isDraggingBlock && !isResizing}
              useCSSTransforms={true}
              style={{ minHeight: '1000px' }}
            >
              {state.blocks.map((block) => (
                <div
                  key={block.id}
                  className={`
                    block-wrapper
                    group rounded-lg transition-all duration-200
                    ${
                      state.selectedBlockId === block.id
                        ? 'z-10 selected'
                        : ''
                    }
                  `}
                  style={{
                    backgroundColor: colors.$1,
                    border: `1px dashed ${
                      state.selectedBlockId === block.id
                        ? colors.$3
                        : colors.$24
                    }`,
                  }}
                  onClick={() => {
                    handleSelectBlock(block.id);
                  }}
                >
                  {/* Top Bar - Always visible with drag handle, title, and actions */}
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
                          const blockJson = JSON.stringify(block, null, 2);
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

                  {/* Block Content - clicking here selects the block */}
                  <div
                    className="block-content p-3 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectBlock(block.id);
                    }}
                  >
                    <BlockRenderer block={block} />
                  </div>
                </div>
              ))}
            </GridLayout>

            {/* Empty State */}
            {state.blocks.length === 0 && (
              <div
                className="flex items-center justify-center h-full min-h-[297mm]"
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
        title={String(t('enter_design_name'))}
        size="small"
      >
        <div className="space-y-4">
          <div
            onKeyDown={(e: React.KeyboardEvent) => {
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
