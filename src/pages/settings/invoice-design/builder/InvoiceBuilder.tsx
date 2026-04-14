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
  Save,
  ArrowLeft,
  Download,
  FileJson,
  Clipboard,
  GripVertical,
} from 'lucide-react';
import { Button } from '$app/components/forms';
import { InputField } from '$app/components/forms/InputField';
import { Modal } from '$app/components/Modal';
import { Block, BuilderState, BlockDefinition, generateBlockId } from './types';
import { getTemplateById } from './templates/templates';
import { ComponentLibrary } from './components/ComponentLibrary';
import { PropertyPanel } from './components/PropertyPanel';
import { BlockRenderer } from './components/BlockRenderer';
import { PreviewModal } from './components/PreviewModal';
import { useBlockLabel } from './block-library';
import { generateInvoiceHTML } from './utils/html-generator';
import { SAMPLE_INVOICE_DATA } from './utils/variable-replacer';
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

  const [state, setState] = useState<BuilderState>({
    blocks: [],
    selectedBlockId: null,
    history: [],
    historyIndex: -1,
    zoom: 100,
    templateId: templateId || undefined,
  });

  const [designName, setDesignName] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState(false);

  const [layout, setLayout] = useState<Layout[]>([]);

  // Drag and drop state
  const [droppingItem, setDroppingItem] = useState<
    { i: string; w: number; h: number } | undefined
  >();
  const [currentDragDefinition, setCurrentDragDefinition] =
    useState<BlockDefinition | null>(null);
  const [justDropped, setJustDropped] = useState(false);

  // Refs for cleanup
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  // Ref to track if we're manually setting layout (to prevent useEffect from overwriting)
  const isManuallySettingLayout = useRef(false);

  // Load existing design when editing
  useEffect(() => {
    if (existingDesign && designId) {
      try {
        const blocks = extractBlocksFromDesign(existingDesign);
        if (blocks && blocks.length > 0) {
          // Update state with blocks
          setState((prev) => ({
            ...prev,
            blocks,
          }));
          // Immediately convert blocks to layout format to ensure proper positioning
          isManuallySettingLayout.current = true;
          const initialLayout = blocks.map((block) => ({
            i: block.id,
            x: block.gridPosition.x,
            y: block.gridPosition.y,
            w: block.gridPosition.w,
            h: block.gridPosition.h,
            minW: Math.min(block.gridPosition.w, 2),
            minH: Math.min(block.gridPosition.h, 1),
            maxW: block.gridPosition.w >= 12 ? 12 : undefined,
          }));
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
        const initialLayout = template.blocks.map((block) => ({
          i: block.id,
          x: block.gridPosition.x,
          y: block.gridPosition.y,
          w: block.gridPosition.w,
          h: block.gridPosition.h,
          minW: Math.min(block.gridPosition.w, 2),
          minH: Math.min(block.gridPosition.h, 1),
          maxW: block.gridPosition.w >= 12 ? 12 : undefined,
        }));
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

    const newLayout = state.blocks.map((block) => ({
      i: block.id,
      x: block.gridPosition.x,
      y: block.gridPosition.y,
      w: block.gridPosition.w,
      h: block.gridPosition.h,
      // minW must be <= w, otherwise react-grid-layout will warn
      minW: Math.min(block.gridPosition.w, 2),
      minH: Math.min(block.gridPosition.h, 1),
      // Ensure blocks can't be resized smaller than their current size
      maxW: block.gridPosition.w >= 12 ? 12 : undefined,
    }));
    setLayout(newLayout);
  }, [state.blocks]);

  // Simple layout change handler - let react-grid-layout handle all the logic
  const handleLayoutChange = useCallback(
    (newLayout: Layout[]) => {
      // Ignore layout changes immediately after external drop
      if (justDropped) {
        return;
      }

      // Update block positions to match the layout
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
    },
    [justDropped]
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

  const handleAddBlock = useCallback(
    (block: Block) => {
      setState((prev) => {
        // Find the lowest Y position to place the new block
        const maxY =
          prev.blocks.length > 0
            ? Math.max(
                ...prev.blocks.map((b) => b.gridPosition.y + b.gridPosition.h)
              )
            : 0;

        const newBlock = {
          ...block,
          gridPosition: {
            ...block.gridPosition,
            y: maxY,
          },
        };

        const newBlocks = [...prev.blocks, newBlock];

        // Add to history with self-cleanup
        const timeoutId = setTimeout(() => {
          addToHistory(newBlocks, `Add ${block.type}`);
          timeoutRefs.current = timeoutRefs.current.filter(
            (id) => id !== timeoutId
          );
        }, 0);
        timeoutRefs.current.push(timeoutId);

        return {
          ...prev,
          blocks: newBlocks,
          selectedBlockId: newBlock.id,
        };
      });
    },
    [addToHistory]
  );

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
    setState((prev) => {
      const blockToDuplicate = prev.blocks.find((b) => b.id === blockId);
      if (!blockToDuplicate) return prev;

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

      return {
        ...prev,
        blocks: [...prev.blocks, newBlock],
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

  // Set droppingItem immediately when drag definition changes
  useEffect(() => {
    if (currentDragDefinition) {
      const item = {
        i: '__dropping-elem__',
        w: currentDragDefinition.defaultSize.w,
        h: currentDragDefinition.defaultSize.h,
      };
      setDroppingItem(item);
    } else {
      // Clear when not dragging
      setDroppingItem(undefined);
    }
  }, [currentDragDefinition]);

  const handleDrop = useCallback(
    (layout: Layout[], layoutItem: Layout, event: Event) => {
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

      // CRITICAL FIX: Use definition.defaultSize for w/h, layoutItem for x/y position
      // layoutItem.w/h might be incorrect or the droppingItem placeholder size
      const newBlockId = generateBlockId(definition.type);

      const newBlock: Block = {
        id: newBlockId,
        type: definition.type,
        gridPosition: {
          x: layoutItem.x,
          y: layoutItem.y,
          w: definition.defaultSize.w, // Use definition, not layoutItem
          h: definition.defaultSize.h, // Use definition, not layoutItem
        },
        properties: { ...definition.defaultProperties },
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
      setJustDropped(true);
      const dropTimeoutId = setTimeout(() => {
        setJustDropped(false);
        timeoutRefs.current = timeoutRefs.current.filter(
          (id) => id !== dropTimeoutId
        );
      }, 100);
      timeoutRefs.current.push(dropTimeoutId);

      // Clear the drag state
      setCurrentDragDefinition(null);
    },
    [addToHistory, currentDragDefinition, t]
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

  const handleSave = async () => {
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
  };

  const performSave = async (nameToUseParam?: string) => {
    const nameToUse =
      nameToUseParam ||
      designName ||
      'Visual Design ' + new Date().toLocaleDateString();

    setSaving(true);

    try {
      // Generate HTML using the proper HTML generator
      const htmlBody = generateInvoiceHTML(state.blocks, SAMPLE_INVOICE_DATA);

      const designPayload = {
        name: nameToUse,
        design: {
          blocks: state.blocks,
          includes: '',
          header: '',
          body: htmlBody,
          product: '',
          task: '',
          footer: '',
        },
        is_custom: true,
        entities: 'invoice,quote,credit',
      };

      if (isEditMode && designId) {
        // Update existing design
        await request(
          'PUT',
          endpoint('/api/v1/designs/:id', { id: designId }),
          designPayload
        );
        $refetch(['designs']);
        toast.success('updated_design');
      } else {
        // Create new design
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

  const handleGoBack = () => {
    navigate(route('/settings/invoice_design/custom_designs'));
  };

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
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: colors.$23 }}
    >
      {/* Left Sidebar: Component Library */}
      <div
        className="w-72 flex flex-col overflow-hidden"
        style={{
          backgroundColor: colors.$1,
          borderRight: `1px solid ${colors.$24}`,
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
            onAddBlock={handleAddBlock}
            onDragStart={setCurrentDragDefinition}
          />
        </div>
      </div>

      {/* Center: Canvas */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Toolbar */}
        <div
          className="px-6 py-3 flex items-center justify-between shadow-sm"
          style={{
            backgroundColor: colors.$1,
            borderBottom: `1px solid ${colors.$24}`,
          }}
        >
          <div className="flex items-center gap-4">
            <Button
              type="secondary"
              behavior="button"
              onClick={handleGoBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('back')}
            </Button>

            <div className="h-6 w-px" style={{ backgroundColor: colors.$24 }} />

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
            </div>

            <div className="h-6 w-px" style={{ backgroundColor: colors.$24 }} />

            <span className="text-sm" style={{ color: colors.$17 }}>
              {t('zoom')}: {state.zoom}%
            </span>

            {/* Design name */}
            {(isEditMode || designName) && (
              <>
                <div
                  className="h-6 w-px"
                  style={{ backgroundColor: colors.$24 }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: colors.$3 }}
                >
                  {designName || t('untitled')}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="secondary"
              behavior="button"
              onClick={handlePreview}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {t('preview')}
            </Button>
            <Button
              type="secondary"
              behavior="button"
              onClick={handleSave}
              disabled={saving || state.blocks.length === 0}
              disableWithoutIcon={!saving}
              className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              {saving ? t('saving') : t('save_design')}
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

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-8 bg-gray-100">
          <div
            className={`mx-auto bg-white shadow-2xl relative transition-all canvas-drop-target`}
            style={{
              width: '210mm',
              minHeight: '297mm',
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
            <GridLayout
              className="layout"
              layout={layout}
              onLayoutChange={handleLayoutChange}
              onDrop={handleDrop}
              onDropDragOver={handleDropDragOver}
              cols={12}
              rowHeight={60}
              width={794} // 210mm in pixels at 96dpi
              margin={[10, 16]} // [horizontal, vertical] - vertical is 1rem (16px)
              containerPadding={[30, 30]}
              draggableHandle=".drag-handle"
              isDraggable
              isResizable
              isDroppable
              droppingItem={droppingItem}
              compactType="vertical" // Pack items toward top (Grafana-style)
              preventCollision={false} // Allow items to push each other
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
                        ? 'ring-1 z-10 selected'
                        : 'hover:ring-1'
                    }
                  `}
                  style={{
                    backgroundColor: colors.$1,
                    border: `1px dashed ${
                      state.selectedBlockId === block.id
                        ? colors.$3
                        : colors.$24
                    }`,
                    borderColor:
                      state.selectedBlockId === block.id
                        ? `${colors.$3}60`
                        : `${colors.$24}60`,
                    boxShadow:
                      state.selectedBlockId === block.id
                        ? `0 1px 3px ${colors.$24}40`
                        : 'none',
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
        className="w-80 flex flex-col overflow-hidden"
        style={{
          backgroundColor: colors.$1,
          borderLeft: `1px solid ${colors.$24}`,
        }}
      >
        <div
          className="p-4"
          style={{ borderBottom: `1px solid ${colors.$24}` }}
        >
          <h2 className="font-semibold text-lg" style={{ color: colors.$3 }}>
            {t('properties')}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {selectedBlock ? (
            <PropertyPanel
              block={selectedBlock}
              onChange={handleUpdateBlock}
              onDelete={() => handleDeleteBlock(selectedBlock.id)}
              onDuplicate={() => handleDuplicateBlock(selectedBlock.id)}
            />
          ) : (
            <div className="p-6 text-center" style={{ color: colors.$17 }}>
              <div className="mb-4">
                <div
                  className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                  style={{ backgroundColor: colors.$20 }}
                >
                  <Eye className="w-8 h-8" style={{ color: colors.$17 }} />
                </div>
              </div>
              <p className="text-sm">
                {t('select_a_component_to_edit_properties')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          blocks={state.blocks}
          onClose={() => setShowPreview(false)}
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
    </div>
  );
}

function BlockLabel({ type }: { type: string }) {
  const label = useBlockLabel(type);
  
  return <>{label}</>;
}

export default InvoiceBuilder;
