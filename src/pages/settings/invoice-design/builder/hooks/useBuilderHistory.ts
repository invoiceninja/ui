/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState, useCallback } from 'react';
import { Block, BuilderHistoryEntry } from '../types';

interface UseBuilderHistoryReturn {
  history: BuilderHistoryEntry[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  addToHistory: (blocks: Block[], action: string) => void;
  undo: () => Block[] | null;
  redo: () => Block[] | null;
  clearHistory: () => void;
}

const MAX_HISTORY_SIZE = 50;

export function useBuilderHistory(): UseBuilderHistoryReturn {
  const [history, setHistory] = useState<BuilderHistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const addToHistory = useCallback(
    (blocks: Block[], action: string) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);

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

        // Limit history size
        if (newHistory.length > MAX_HISTORY_SIZE) {
          newHistory.shift();
        }

        return newHistory;
      });

      setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY_SIZE - 1));
    },
    [historyIndex]
  );

  const undo = useCallback((): Block[] | null => {
    if (historyIndex <= 0) return null;

    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    return history[newIndex]?.blocks || null;
  }, [history, historyIndex]);

  const redo = useCallback((): Block[] | null => {
    if (historyIndex >= history.length - 1) return null;

    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    return history[newIndex]?.blocks || null;
  }, [history, historyIndex]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  return {
    history,
    historyIndex,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    addToHistory,
    undo,
    redo,
    clearHistory,
  };
}
