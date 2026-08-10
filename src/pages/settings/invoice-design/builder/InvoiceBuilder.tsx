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
import {
  Eye,
  Download,
  FileJson,
  Clipboard,
  GripVertical,
  Type,
  Pencil,
  Settings as SettingsIcon,
  Code2,
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
import { CustomCssPanel } from './components/CustomCssPanel';
import { BlockRenderer } from './components/BlockRenderer';
import { PreviewModal } from './components/PreviewModal';
import { useBlockLabel } from './block-library';
import { getContentConstrainedGridSize } from './utils/block-sizing';
import { generateInvoiceHTML } from './utils/html-generator';
import { GRID_CONFIG } from './utils/grid-converter';
import { getPageDimensions } from './constants/page-dimensions';
import {
  extractBlocksFromDesign,
  normalizeSavedBlocksForBuilder,
} from './utils/grid/block-normalization';
import { repairGridPositionCollisions } from './utils/grid/collisions';
import { shouldGrowBlockToContent } from './utils/grid/content-height';
import {
  clampGridValue,
  GRIDSTACK_CELL_HEIGHT,
} from './utils/grid/grid-stack-widgets';
import {
  documentSettingsToGeneratorShape,
  mergeDesignParts,
} from './utils/persistence';
import { useGridStackCanvas } from './hooks/useGridStackCanvas';
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
import { getInvoiceWidgetClassName } from './constants/widget-classes';
import {
  sanitizeCustomCss,
  unwrapCustomCssFromApi,
} from './utils/custom-css';
import 'gridstack/dist/gridstack.min.css';
import './InvoiceBuilder.css';

export function InvoiceBuilder() {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const colors = useColorScheme();
  const accentColor = useAccentColor();
  const { id: designId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');

  const { data: existingDesign, isLoading: isLoadingDesign } = useDesignQuery({
    id: designId,
    enabled: Boolean(designId),
  });

  const company = useCurrentCompany();
  const designSettings = company?.settings;

  const [state, setState] = useState<BuilderState>({
    blocks: [],
    customCss: '',
    selectedBlockId: null,
    zoom: 100,
    templateId: templateId || undefined,
    documentSettings: createDefaultDocumentSettings(designSettings),
    panelMode: 'document',
  });

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

  const builderStateRef = useRef(state);
  builderStateRef.current = state;
  const designNameRef = useRef(designName);
  designNameRef.current = designName;
  const existingDesignRef = useRef(existingDesign);
  existingDesignRef.current = existingDesign;

  const setBlocks = useCallback((updater: (prev: Block[]) => Block[]) => {
    setState((prev) => {
      const nextBlocks = updater(prev.blocks);

      return nextBlocks === prev.blocks ? prev : { ...prev, blocks: nextBlocks };
    });
  }, []);

  const {
    gridContainerRef,
    isDraggingBlock,
    isResizing,
    getBlocksWithCurrentGridPositions,
    markShouldFitLoadedContentHeight,
  } = useGridStackCanvas({
    blocks: state.blocks,
    setBlocks,
    documentSettings: state.documentSettings,
    builderStateRef,
  });

  const [currentDragDefinition, setCurrentDragDefinition] =
    useState<BlockDefinition | null>(null);

  useEffect(() => {
    if (existingDesign && designId) {
      try {
        const blocks = extractBlocksFromDesign(existingDesign);
        if (blocks && blocks.length > 0) {
          const savedDocSettings = (
            existingDesign.design as { documentSettings?: DocumentSettings }
          )?.documentSettings;

          markShouldFitLoadedContentHeight();
          setState((prev) => ({
            ...prev,
            blocks,
            customCss: unwrapCustomCssFromApi(existingDesign.design.customCss),
            documentSettings:
              savedDocSettings || createDefaultDocumentSettings(designSettings),
          }));
          documentSettingsInitialized.current = true;
          setDesignName(existingDesign.name);
          setIsEditMode(true);
        } else {
          toast.error('design_not_created_with_visual_builder');
          navigate(route('/settings/invoice_design/custom_designs'));
        }
      } catch {
        toast.error('error_loading_design');
        navigate(route('/settings/invoice_design/custom_designs'));
      }
    }
  }, [
    designId,
    designSettings,
    existingDesign,
    markShouldFitLoadedContentHeight,
    navigate,
  ]);

  useEffect(() => {
    if (templateId) {
      const template = getTemplateById(templateId);
      if (template) {
        markShouldFitLoadedContentHeight();
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
  }, [markShouldFitLoadedContentHeight, templateId]);

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

    setState((prev) => ({
      ...prev,
      blocks: newBlocks,
      selectedBlockId: newBlock.id,
    }));
  }, []);

  const handleSelectBlock = useCallback((blockId: string | null) => {
    setState((prev) => ({
      ...prev,
      selectedBlockId: blockId || null,
      panelMode: blockId ? 'block' : 'document',
    }));
  }, []);

  const handleOpenCustomCss = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedBlockId: null,
      panelMode: 'css',
    }));
  }, []);

  const handleOpenDocumentSettings = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedBlockId: null,
      panelMode: 'document',
    }));
  }, []);

  const handleSidebarDragEnd = useCallback(() => {
    setCurrentDragDefinition(null);
  }, []);

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

      const newBlock = {
        id: newBlockId,
        type: definition.type,
        gridPosition: {
          x,
          y,
          w: size.w,
          h: size.h,
        },
        properties: seededProperties,
      } as Block;

      setState((prev) => ({
        ...prev,
        blocks: repairGridPositionCollisions([...prev.blocks, newBlock]),
        selectedBlockId: null,
      }));

      setCurrentDragDefinition(null);
    },
    [
      currentDragDefinition,
      designSettings?.primary_color,
      gridContainerRef,
      state.documentSettings.globalFontSize,
      state.zoom,
    ]
  );

  const selectedBlock = state.blocks.find(
    (b) => b.id === state.selectedBlockId
  );

  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [designNameInput, setDesignNameInput] = useState<string>('');

  const handleSave = useCallback(async () => {
    if (!state.blocks.length) {
      toast.error('add_blocks_first');
      return;
    }

    if (!isEditMode && !designName) {
      const defaultName = 'Visual Design ' + new Date().toLocaleDateString();
      setDesignNameInput(defaultName);
      setShowNameModal(true);
      return;
    }

    await performSave();
  }, [designName, isEditMode, state.blocks.length]);

  const performSave = async (nameToUseParam?: string) => {
    const nameToUse =
      nameToUseParam ||
      designNameRef.current ||
      'Visual Design ' + new Date().toLocaleDateString();

    setSaving(true);

    try {
      const blocks = getBlocksWithCurrentGridPositions();

      const htmlBody = generateInvoiceHTML(
        blocks,
        undefined,
        documentSettingsToGeneratorShape(
          builderStateRef.current.documentSettings
        ),
        builderStateRef.current.customCss
      );

      const mergedParts = mergeDesignParts(
        blocks,
        htmlBody,
        existingDesignRef.current?.design,
        builderStateRef.current.documentSettings,
        builderStateRef.current.customCss
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

  const handleDownloadJson = () => {
    const json = JSON.stringify(
      {
        blocks: state.blocks,
        templateId: state.templateId,
        documentSettings: state.documentSettings,
        customCss: state.customCss,
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
  };

  useSaveBtn(
    {
      onClick: handleSave,
      disableSaveButton: saving || state.blocks.length === 0,
    },
    [designId, handleSave, isEditMode, saving, state.blocks.length]
  );

  if (isLoadingDesign && designId && state.blocks.length === 0) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ backgroundColor: colors.$23 }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: colors.$3 }}
          />
          <p style={{ color: colors.$17 }}>{t('loading')}</p>
        </div>
      </div>
    );
  }

  const pageDimensions = getPageDimensions(
    state.documentSettings.pageSize,
    state.documentSettings.pageLayout
  );
  const sanitizedCustomCss = sanitizeCustomCss(state.customCss);

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
              className="w-64 !border-0 !bg-transparent focus:ring-0 focus:border-b"
              style={{ borderColor: colors.$24 }}
              debounceTimeout={0}
              changeOverride
            />

            <Pencil
              className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: colors.$17 }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type={
                state.selectedBlockId === null && state.panelMode === 'document'
                  ? 'primary'
                  : 'secondary'
              }
              behavior="button"
              onClick={handleOpenDocumentSettings}
              className="flex items-center gap-2"
            >
              <SettingsIcon className="w-4 h-4" />
              {t('settings')}
            </Button>
            <Button
              type={state.panelMode === 'css' ? 'primary' : 'secondary'}
              behavior="button"
              onClick={handleOpenCustomCss}
              className="flex items-center gap-2"
            >
              <Code2 className="w-4 h-4" />
              {t('css') || 'CSS'}
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
            <Button
              type="secondary"
              behavior="button"
              onClick={handleDownloadJson}
              disabled={state.blocks.length === 0}
              className="flex items-center gap-2"
              disableWithoutIcon={state.blocks.length === 0}
            >
              <FileJson className="w-4 h-4" />
            </Button>
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

        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            className="flex-1 overflow-auto p-8"
            style={{ backgroundColor: colors.$23 }}
          >
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
              {sanitizedCustomCss && (
                <style
                  data-invoice-custom-css
                >{`@scope (.invoice-gridstack-page) {
${sanitizedCustomCss}
}`}</style>
              )}
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
                          <div
                            className="block-topbar drag-handle h-7 rounded-t px-3 flex items-center justify-between text-xs cursor-move transition-colors"
                            style={{
                              backgroundColor: accentColor,
                              color: '#ffffff',
                              borderBottom: `1px solid ${accentColor}80`,
                            }}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <GripVertical className="w-3 h-3 flex-shrink-0 text-white/70" />
                              <span className="font-medium truncate text-white">
                                <BlockLabel type={block.type} />
                              </span>
                            </div>

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

                          <div
                            className="block-content cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectBlock(block.id);
                            }}
                          >
                            <div
                              className={`block-content-measure ${getInvoiceWidgetClassName(
                                block.type,
                                block.properties.cssClasses
                              )}`}
                              data-widget-type={block.type}
                            >
                              <BlockRenderer block={block} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

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
            ) : state.panelMode === 'css' ? (
              <CustomCssPanel
                value={state.customCss}
                onChange={(customCss) =>
                  setState((prev) => ({ ...prev, customCss }))
                }
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

      {showPreview && (
        <PreviewModal
          blocks={state.blocks}
          customCss={state.customCss}
          onClose={() => setShowPreview(false)}
          designSettings={documentSettingsToGeneratorShape(
            state.documentSettings
          )}
        />
      )}

      <Modal
        visible={showNameModal}
        onClose={(status) => {
          setShowNameModal(false);
          if (!status && !designName) {
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
