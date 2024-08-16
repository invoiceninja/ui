/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { atom, useAtom, useSetAtom } from 'jotai';
import { isNavigationModalVisibleAtom } from './usePreventNavigation';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface PreventLeavingPage {
  prevent: boolean;
  actionKey?: 'switchCompany' | 'browserBack';
}

interface HistoryLocation {
  lastLocation: string;
  nonPreventedLocations: string[];
}

export const preventLeavingPageAtom = atom<PreventLeavingPage>({
  prevent: false,
  actionKey: undefined,
});

export const lastHistoryLocationAtom = atom<HistoryLocation>({
  lastLocation: '',
  nonPreventedLocations: [],
});
export function useAddPreventNavigationEvents() {
  const location = useLocation();

  const setIsNavigationModalVisible = useSetAtom(isNavigationModalVisibleAtom);
  const [preventLeavingPage, setPreventLeavingPage] = useAtom(
    preventLeavingPageAtom
  );
  const [lastHistoryLocation, setLastHistoryLocation] = useAtom(
    lastHistoryLocationAtom
  );

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (
        preventLeavingPage.prevent &&
        preventLeavingPage.actionKey !== 'switchCompany'
      ) {
        event.preventDefault();

        return true;
      }
    };

    const isLastPushDifferent =
      lastHistoryLocation.lastLocation !== window.location.href;

    if (isLastPushDifferent && preventLeavingPage.prevent) {
      setLastHistoryLocation((current) => ({
        ...current,
        lastLocation: window.location.href,
      }));
      history.pushState(null, document.title, window.location.href);
    }

    const handlePopState = () => {
      if (preventLeavingPage.prevent) {
        if (isLastPushDifferent) {
          history.pushState(null, document.title, window.location.href);
        }

        setPreventLeavingPage(
          (current) => current && { ...current, actionKey: 'browserBack' }
        );

        setIsNavigationModalVisible(true);
      }
    };

    window.addEventListener('popstate', handlePopState);

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [preventLeavingPage]);

  useEffect(() => {
    !preventLeavingPage.prevent &&
      setLastHistoryLocation((current) => ({
        ...current,
        nonPreventedLocations: [
          ...current.nonPreventedLocations,
          location.pathname,
        ],
      }));
  }, [location]);
}
