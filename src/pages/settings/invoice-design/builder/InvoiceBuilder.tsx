/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GridLayout, { Layout } from 'react-grid-layout';
import { Undo2, Redo2, Eye, Save, ArrowLeft, Download } from 'lucide-react';
import { Button } from '$app/components/forms';
import { Block, BuilderState } from './types';
import { getTemplateById } from './templates/templates';
import { ComponentLibrary } from './components/ComponentLibrary';
import { PropertyPanel } from './components/PropertyPanel';
import { BlockRenderer } from './components/BlockRenderer';
import { route } from '$app/common/helpers/route';
import 'react-grid-layout/css/styles.css';
import 'react-grid-layout/css/styles.css';

export function InvoiceBuilder() {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');

  const [state, setState] = useState<BuilderState>({
    blocks: [],
    selectedBlockId: null,
    history: [],
    historyIndex: -1,
    zoom: 100,
    templateId: templateId || undefined,
  });

  const [layout, setLayout] = useState<Layout[]>([]);

  // Load template on mount
  useEffect(() => {
    if (templateId) {
      const template = getTemplateById(templateId);
      if (template) {
        setState((prev) => ({
          ...prev,
          blocks: template.blocks,
          templateId: template.id,
        }));
      }
    }
  }, [templateId]);

  // Convert blocks to react-grid-layout format
  useEffect(() => {
    const newLayout = state.blocks.map((block) => ({
      i: block.id,
      x: block.gridPosition.x,
      y: block.gridPosition.y,
      w: block.gridPosition.w,
      h: block.gridPosition.h,
      minW: 1,
      minH: 1,
    }));
    setLayout(newLayout);
  }, [state.blocks]);

  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
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

  const handleAddBlock = useCallback((block: Block) => {
    setState((prev) => ({
      ...prev,
      blocks: [...prev.blocks, block],
      selectedBlockId: block.id,
    }));
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
      selectedBlockId: prev.selectedBlockId === blockId ? null : prev.selectedBlockId,
    }));
  }, []);

  const handleDuplicateBlock = useCallback((blockId: string) => {
    setState((prev) => {
      const blockToDuplicate = prev.blocks.find((b) => b.id === blockId);
      if (!blockToDuplicate) return prev;

      const newBlock: Block = {
        ...blockToDuplicate,
        id: `${blockToDuplicate.type}-${Date.now()}`,
        gridPosition: {
          ...blockToDuplicate.gridPosition,
          y: blockToDuplicate.gridPosition.y + blockToDuplicate.gridPosition.h + 1,
        },
      };

      return {
        ...prev,
        blocks: [...prev.blocks, newBlock],
        selectedBlockId: newBlock.id,
      };
    });
  }, []);

  const handleSelectBlock = useCallback((blockId: string) => {
    setState((prev) => ({
      ...prev,
      selectedBlockId: blockId,
    }));
  }, []);

  const selectedBlock = state.blocks.find((b) => b.id === state.selectedBlockId);

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving design...', state.blocks);
  };

  const handlePreview = () => {
    // TODO: Implement preview
    console.log('Preview...', state.blocks);
  };

  const handleGoBack = () => {
    navigate(route('/settings/invoice_design/custom_designs'));
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Left Sidebar: Component Library */}
      <div className="w-72 bg-white border-r flex flex-col overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg text-gray-900">{t('components')}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {t('drag_and_drop_to_add')}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <ComponentLibrary onAddBlock={handleAddBlock} />
        </div>
      </div>

      {/* Center: Canvas */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Toolbar */}
        <div className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm">
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

            <div className="h-6 w-px bg-gray-300" />

            <div className="flex items-center gap-2">
              <Button
                type="secondary"
                behavior="button"
                onClick={() => {/* TODO: Undo */}}
                disabled
                className="p-2"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button
                type="secondary"
                behavior="button"
                onClick={() => {/* TODO: Redo */}}
                disabled
                className="p-2"
              >
                <Redo2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="h-6 w-px bg-gray-300" />

            <span className="text-sm text-gray-600">
              {t('zoom')}: {state.zoom}%
            </span>
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
              className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              {t('save_design')}
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-8 bg-gray-100">
          <div
            className="mx-auto bg-white shadow-2xl"
            style={{
              width: '210mm',
              minHeight: '297mm',
              transform: `scale(${state.zoom / 100})`,
              transformOrigin: 'top center',
            }}
          >
            <GridLayout
              className="layout"
              layout={layout}
              onLayoutChange={handleLayoutChange}
              cols={12}
              rowHeight={20}
              width={794} // 210mm in pixels at 96dpi
              margin={[10, 10]}
              containerPadding={[20, 20]}
              draggableHandle=".drag-handle"
              isDraggable
              isResizable
              compactType={null}
              preventCollision={false}
            >
              {state.blocks.map((block) => (
                <div
                  key={block.id}
                  className={`
                    group relative border-2 rounded transition-all
                    ${state.selectedBlockId === block.id
                      ? 'border-blue-500 shadow-lg z-10'
                      : 'border-transparent hover:border-gray-300'
                    }
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectBlock(block.id);
                  }}
                >
                  {/* Block Toolbar - shows on hover or when selected */}
                  <div
                    className={`
                      drag-handle absolute -top-8 left-0 right-0 h-7
                      bg-gray-800 text-white rounded-t px-2
                      flex items-center justify-between text-xs
                      cursor-move
                      ${state.selectedBlockId === block.id || 'opacity-0 group-hover:opacity-100'}
                      transition-opacity
                    `}
                  >
                    <span className="font-medium truncate">
                      {block.type}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateBlock(block.id);
                        }}
                        className="hover:bg-gray-700 px-1 rounded"
                      >
                        ⎘
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBlock(block.id);
                        }}
                        className="hover:bg-red-600 px-1 rounded"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  {/* Block Content */}
                  <div className="h-full w-full overflow-hidden p-2">
                    <BlockRenderer block={block} />
                  </div>
                </div>
              ))}
            </GridLayout>

            {/* Empty State */}
            {state.blocks.length === 0 && (
              <div className="flex items-center justify-center h-full min-h-[297mm] text-gray-400">
                <div className="text-center">
                  <Download className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">{t('drag_components_here')}</p>
                  <p className="text-sm mt-2">{t('start_building_your_invoice')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar: Properties Panel */}
      <div className="w-80 bg-white border-l flex flex-col overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg text-gray-900">{t('properties')}</h2>
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
            <div className="p-6 text-center text-gray-500">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                  <Eye className="w-8 h-8 text-gray-400" />
                </div>
              </div>
              <p className="text-sm">
                {t('select_a_component_to_edit_properties')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InvoiceBuilder;
