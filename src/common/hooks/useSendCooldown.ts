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

type State = 'idle' | 'sending' | 'cooldown';

interface Options {
  durationMs?: number;
  onElapsed?: () => void;
}

// Default cooldown covers backend Peppol ack latency before status is queryable.
const DEFAULT_COOLDOWN_MS = 30_000;

export function useSendCooldown({
  durationMs = DEFAULT_COOLDOWN_MS,
  onElapsed,
}: Options = {}) {
  const [state, setState] = useState<State>('idle');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const onElapsedRef = useRef<(() => void) | undefined>(onElapsed);

  onElapsedRef.current = onElapsed;

  const clearTicker = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearTicker();
    };
  }, [clearTicker]);

  const send = useCallback(
    (performSend: () => Promise<unknown>) => {
      if (state !== 'idle') return;

      setState('sending');

      const abort = new AbortController();

      performSend()
        .then(() => {
          if (!isMountedRef.current) return;

          const deadline = Date.now() + durationMs;

          setState('cooldown');
          setSecondsRemaining(Math.ceil(durationMs / 1000));

          intervalRef.current = setInterval(() => {
            if (!isMountedRef.current) return;

            const remaining = Math.max(
              0,
              Math.ceil((deadline - Date.now()) / 1000)
            );

            setSecondsRemaining(remaining);

            if (remaining === 0) {
              clearTicker();
              setState('idle');
              onElapsedRef.current?.();
            }
          }, 1000);
        })
        .catch(() => {
          if (!isMountedRef.current) return;
          setState('idle');
        });
        
        return () => {
          abort.abort();
        };
    },
    [durationMs, state, clearTicker]
  );

  return {
    send,
    isBusy: state !== 'idle',
    secondsRemaining: state === 'cooldown' ? secondsRemaining : 0,
  };
}
