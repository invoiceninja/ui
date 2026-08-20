/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import { GridStack } from 'gridstack';
import type { GridItemHTMLElement } from 'gridstack';
import { Block, BuilderState, DocumentSettings } from '../types';
import { GRID_CONFIG } from '../utils/grid-converter';
import {
  applyGridPositionsToBlocks,
  repairGridPositionCollisions,
} from '../utils/grid/collisions';
import {
  gridItemContentOverflows,
  shouldGrowBlockToContent,
  syncGridItemContentMinimum,
} from '../utils/grid/content-height';
import {
  blockToGridStackWidget,
  findGridStackElement,
  getGridStackBlockId,
  GRIDSTACK_CELL_HEIGHT,
  GRIDSTACK_MARGIN,
  readGridPositionsById,
} from '../utils/grid/grid-stack-widgets';

interface UseGridStackCanvasOptions {
  blocks: Block[];
  isCanvasMounted: boolean;
  setBlocks: (updater: (prev: Block[]) => Block[]) => void;
  documentSettings: Pick<DocumentSettings, 'globalFontSize' | 'primaryFont'>;
  builderStateRef: MutableRefObject<BuilderState>;
  shouldFitLoadedContentHeightRef: MutableRefObject<boolean>;
}

export function useGridStackCanvas({
  blocks,
  isCanvasMounted,
  setBlocks,
  documentSettings,
  builderStateRef,
  shouldFitLoadedContentHeightRef,
}: UseGridStackCanvasOptions) {
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<GridStack | null>(null);
  const isSyncingGridRef = useRef(false);
  const isDraggingGridRef = useRef(false);
  const isResizingGridRef = useRef(false);
  const isLayoutHydratingRef = useRef(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const [isDraggingBlock, setIsDraggingBlock] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const syncBlocksFromGrid = useCallback(() => {
    const grid = gridRef.current;

    if (!grid || isSyncingGridRef.current) {
      return;
    }

    const positionsById = readGridPositionsById(grid);

    if (!positionsById.size) {
      return;
    }

    setBlocks((prevBlocks) => {
      const nextBlocks = applyGridPositionsToBlocks(prevBlocks, positionsById);

      return nextBlocks === prevBlocks ? prevBlocks : nextBlocks;
    });
  }, [setBlocks]);

  const getBlocksWithCurrentGridPositions = useCallback(() => {
    const positionsById = readGridPositionsById(gridRef.current);
    const currentBlocks = builderStateRef.current.blocks;
    const nextBlocks = applyGridPositionsToBlocks(currentBlocks, positionsById);

    if (nextBlocks !== currentBlocks) {
      builderStateRef.current = {
        ...builderStateRef.current,
        blocks: nextBlocks,
      };

      setBlocks((prevBlocks) => {
        const updatedBlocks = applyGridPositionsToBlocks(
          prevBlocks,
          positionsById
        );

        return updatedBlocks === prevBlocks ? prevBlocks : updatedBlocks;
      });
    }

    return nextBlocks;
  }, [builderStateRef, setBlocks]);

  useEffect(() => {
    if (!isCanvasMounted) {
      return;
    }

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
      if (
        isSyncingGridRef.current ||
        isDraggingGridRef.current ||
        isResizingGridRef.current
      ) {
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
  }, [builderStateRef, isCanvasMounted, syncBlocksFromGrid]);

  useEffect(() => {
    if (!isCanvasMounted) {
      return;
    }

    const grid = gridRef.current;
    const container = gridContainerRef.current;

    if (!grid || !container) {
      return;
    }

    const repairedBlocks = repairGridPositionCollisions(blocks);

    if (repairedBlocks !== blocks) {
      setBlocks((prevBlocks) => {
        const nextBlocks = repairGridPositionCollisions(prevBlocks);

        return nextBlocks === prevBlocks ? prevBlocks : nextBlocks;
      });
      return;
    }

    isLayoutHydratingRef.current = true;
    isSyncingGridRef.current = true;
    grid.batchUpdate();

    const blockIds = new Set(blocks.map((block) => block.id));

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

    blocks.forEach((block) => {
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
        isLayoutHydratingRef.current = false;
        return;
      }

      const shouldFitLoadedContentHeight =
        shouldFitLoadedContentHeightRef.current;
      let didResizeToContent = false;

      if (shouldFitLoadedContentHeight) {
        blocks.forEach((block) => {
          if (!shouldGrowBlockToContent(block)) {
            return;
          }

          const item = findGridStackElement(container, block.id);

          if (item) {
            didResizeToContent =
              syncGridItemContentMinimum(grid, item, {
                grow: true,
                shrink: true,
              }) || didResizeToContent;
          }
        });

        shouldFitLoadedContentHeightRef.current = false;
      }

      isLayoutHydratingRef.current = false;

      if (didResizeToContent) {
        syncBlocksFromGrid();
      }
    });
  }, [
    blocks,
    documentSettings.globalFontSize,
    documentSettings.primaryFont,
    isCanvasMounted,
    setBlocks,
    syncBlocksFromGrid,
  ]);

  useEffect(() => {
    if (!isCanvasMounted) {
      return;
    }

    const grid = gridRef.current;
    const container = gridContainerRef.current;

    resizeObserverRef.current?.disconnect();

    if (!grid || !container) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      requestAnimationFrame(() => {
        if (
          isLayoutHydratingRef.current ||
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
          if (!gridItemContentOverflows(grid, item)) {
            return;
          }

          didGrow =
            syncGridItemContentMinimum(grid, item, { grow: true }) || didGrow;
        });

        if (didGrow) {
          syncBlocksFromGrid();
        }
      });
    });

    blocks.forEach((block) => {
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
  }, [blocks, builderStateRef, isCanvasMounted, syncBlocksFromGrid]);

  return {
    gridContainerRef,
    isDraggingBlock,
    isResizing,
    syncBlocksFromGrid,
    getBlocksWithCurrentGridPositions,
  };
}
