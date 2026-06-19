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
import {
  bindingFromState,
  isModifierKey,
  normalizeKey,
} from '../helpers/keyboard-shortcuts';

let recordingActive = false;

export function isShortcutRecordingActive(): boolean {
  return recordingActive;
}

interface UseShortcutRecorderOptions {
  onCommit: (binding: string) => void;
  onCancel?: () => void;
}

interface UseShortcutRecorderResult {
  isRecording: boolean;
  preview: string | null;
  start: () => void;
  stop: () => void;
}

export function useShortcutRecorder({
  onCommit,
  onCancel,
}: UseShortcutRecorderOptions): UseShortcutRecorderResult {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(null);

  const bestBindingRef = useRef<string | null>(null);
  const heldKeysRef = useRef<Set<string>>(new Set());

  const onCommitRef = useRef(onCommit);
  const onCancelRef = useRef(onCancel);
  onCommitRef.current = onCommit;
  onCancelRef.current = onCancel;

  const reset = useCallback(() => {
    bestBindingRef.current = null;
    heldKeysRef.current = new Set();
    setPreview(null);
  }, []);

  const stop = useCallback(() => {
    setIsRecording(false);
    reset();
  }, [reset]);

  const start = useCallback(() => {
    reset();
    setIsRecording(true);
  }, [reset]);

  useEffect(() => {
    if (!isRecording) {
      return;
    }

    recordingActive = true;

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (event.key === 'Escape') {
        onCancelRef.current?.();
        stop();
        return;
      }

      if (!isModifierKey(event.key)) {
        heldKeysRef.current.add(normalizeKey(event.key));
      }

      const binding = bindingFromState(event, [...heldKeysRef.current]);

      if (binding) {
        if (heldKeysRef.current.size > 0) {
          bestBindingRef.current = binding;
        }

        setPreview(binding);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (bestBindingRef.current) {
        onCommitRef.current(bestBindingRef.current);
        stop();
        return;
      }

      if (!isModifierKey(event.key)) {
        heldKeysRef.current.delete(normalizeKey(event.key));
      }

      const stillHeld =
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey ||
        heldKeysRef.current.size > 0;

      if (!stillHeld) {
        onCancelRef.current?.();
        stop();
        return;
      }

      setPreview(bindingFromState(event, [...heldKeysRef.current]));
    };

    const handleBlur = () => {
      onCancelRef.current?.();
      stop();
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', handleBlur);

    return () => {
      recordingActive = false;
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isRecording, stop]);

  return { isRecording, preview, start, stop };
}
