/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useRef } from 'react';
import { clearLocalStorage } from '../helpers/local-storage';
import { useCurrentCompany } from './useCurrentCompany';

const events = [
  'mousedown',
  'mousemove',
  'wheel',
  'keydown',
  'touchstart',
  'scroll',
];

export function useWebSessionTimeout() {
  const currentCompany = useCurrentCompany();

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onTimeout = () => {
    clearLocalStorage();
  };

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(onTimeout, currentCompany?.session_timeout);
  };

  const handleResetTimeout = () => {
    resetTimeout();
  };

  useEffect(() => {
    if (currentCompany?.session_timeout) {
      events.forEach((event) => {
        window.addEventListener(event, handleResetTimeout, { passive: true });
      });

      resetTimeout();
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      events.forEach((event) =>
        window.removeEventListener(event, handleResetTimeout)
      );
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      events.forEach((event) =>
        window.removeEventListener(event, handleResetTimeout)
      );
    };
  }, [currentCompany?.session_timeout]);

  return null;
}
