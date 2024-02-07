/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import {
  lastHistoryLocationAtom,
  preventLeavingPageAtom,
} from './useAddPreventNavigationEvents';

interface NavigationAction {
  url?: string;
  externalLink?: boolean;
  fn?: () => void;
  actionKey?: 'switchCompany';
}
export const isNavigationModalVisibleAtom = atom<boolean>(false);
export const blockedNavigationActionAtom = atom<NavigationAction | undefined>(
  undefined
);
export function usePreventNavigation() {
  const navigate = useNavigate();

  const { nonPreventedLocations } = useAtomValue(lastHistoryLocationAtom);

  const [preventLeavingPage, setPreventLeavingPage] = useAtom(
    preventLeavingPageAtom
  );
  const setIsNavigationModalVisible = useSetAtom(isNavigationModalVisibleAtom);
  const setBlockedNavigationAction = useSetAtom(blockedNavigationActionAtom);

  return ({ url, externalLink = false, fn, actionKey }: NavigationAction) => {
    if (preventLeavingPage.prevent) {
      setBlockedNavigationAction({
        url,
        externalLink,
        fn,
      });
      setPreventLeavingPage((current) => current && { ...current, actionKey });

      setIsNavigationModalVisible(true);
    } else {
      if (url) {
        if (url === 'back') {
          const lastNonPreventedLocation =
            nonPreventedLocations[nonPreventedLocations.length - 2];

          lastNonPreventedLocation && navigate(lastNonPreventedLocation);
        } else {
          if (externalLink) {
            window.open(url, '_blank');
          } else {
            navigate(url);
          }
        }
      }

      fn?.();
    }

    return preventLeavingPage.prevent;
  };
}
