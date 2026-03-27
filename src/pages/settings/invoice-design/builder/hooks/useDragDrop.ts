/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState, useCallback, useRef } from 'react';
import type { Layout } from 'react-grid-layout';
import { Block, BlockDefinition, generateBlockId } from '../types';

interface UseDragDropReturn {
  // State
  droppingItem: { i: string; w: number; h: number } | undefined;
  currentDragDefinition: BlockDefinition | null;
  justDropped: boolean;

  // Refs
  isManuallySettingLayout: React.MutableRefObject<boolean>;

  // Actions
  onDragStart: (definition: BlockDefinition) => void;
  onDrop: (
    layout: Layout[],
    layoutItem: Layout,
    event: Event,
    currentDragDefinition: BlockDefinition | null,
    addToHistory: (blocks: Block[], action: string) => void
  ) => Block | null;
  resetDragState: () => void;
  setJustDropped: (value: boolean) => void;
}

export function useDragDrop(): UseDragDropReturn {
  const [droppingItem, setDroppingItem] = useState<
    { i: string; w: number; h: number } | undefined
  >();
  const [currentDragDefinition, setCurrentDragDefinition] =
    useState<BlockDefinition | null>(null);
  const [justDropped, setJustDroppedState] = useState(false);
  const isManuallySettingLayout = useRef(false);

  const onDragStart = useCallback((definition: BlockDefinition) => {
    setCurrentDragDefinition(definition);
    setDroppingItem({
      i: 'drop-placeholder',
      w: definition.defaultSize.w,
      h: definition.defaultSize.h,
    });
  }, []);

  const resetDragState = useCallback(() => {
    setCurrentDragDefinition(null);
    setDroppingItem(undefined);
  }, []);

  const setJustDropped = useCallback((value: boolean) => {
    setJustDroppedState(value);
  }, []);

  const onDrop = useCallback(
    (
      layout: Layout[],
      layoutItem: Layout,
      event: Event,
      dragDefinition: BlockDefinition | null,
      addToHistory: (blocks: Block[], action: string) => void
    ): Block | null => {
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
      }

      const definition = data || dragDefinition;

      if (!definition) {
        return null;
      }

      const newBlock: Block = {
        id: generateBlockId(definition.type),
        type: definition.type,
        gridPosition: {
          x: layoutItem.x,
          y: layoutItem.y,
          w: definition.defaultSize.w,
          h: definition.defaultSize.h,
        },
        properties: { ...definition.defaultProperties },
      };

      return newBlock;
    },
    []
  );

  return {
    droppingItem,
    currentDragDefinition,
    justDropped,
    isManuallySettingLayout,
    onDragStart,
    onDrop,
    resetDragState,
    setJustDropped,
  };
}
