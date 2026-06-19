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

const COMMIT_DELAY_MS = 500;

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
  const heldKeysRef = useRef<string[]>([]);
  const commitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onCommitRef = useRef(onCommit);
  const onCancelRef = useRef(onCancel);
  onCommitRef.current = onCommit;
  onCancelRef.current = onCancel;

  const clearCommitTimer = useCallback(() => {
    if (commitTimerRef.current !== null) {
      clearTimeout(commitTimerRef.current);
      commitTimerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearCommitTimer();
    bestBindingRef.current = null;
    heldKeysRef.current = [];
    setPreview(null);
  }, [clearCommitTimer]);

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

      clearCommitTimer();

      if (!isModifierKey(event.key)) {
        const key = normalizeKey(event.key);

        if (!heldKeysRef.current.includes(key)) {
          heldKeysRef.current.push(key);
        }
      }

      const binding = bindingFromState(event, heldKeysRef.current);

      if (binding) {
        if (heldKeysRef.current.length > 0) {
          bestBindingRef.current = binding;
        }

        setPreview(binding);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (bestBindingRef.current) {
        const binding = bestBindingRef.current;

        clearCommitTimer();
        commitTimerRef.current = setTimeout(() => {
          onCommitRef.current(binding);
          stop();
        }, COMMIT_DELAY_MS);
        return;
      }

      if (!isModifierKey(event.key)) {
        const key = normalizeKey(event.key);
        heldKeysRef.current = heldKeysRef.current.filter(
          (held) => held !== key
        );
      }

      const stillHeld =
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey ||
        heldKeysRef.current.length > 0;

      if (!stillHeld) {
        onCancelRef.current?.();
        stop();
        return;
      }

      setPreview(bindingFromState(event, heldKeysRef.current));
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
