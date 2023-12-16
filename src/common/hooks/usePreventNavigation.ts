/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { preventClosingTabOrBrowserAtom } from '$app/App';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';

interface URLInfo {
  url: string;
  externalLink?: boolean;
  buttonComponent?: boolean;
}
interface NavigationURL {
  url: string;
  externalLink?: boolean;
}
export const isNavigationModalVisibleAtom = atom<boolean>(false);
export const blockedNavigationURLAtom = atom<NavigationURL | undefined>(
  undefined
);
export function usePreventNavigation() {
  const navigate = useNavigate();

  const preventNavigation = useAtomValue(preventClosingTabOrBrowserAtom);
  const setIsNavigationModalVisible = useSetAtom(isNavigationModalVisibleAtom);
  const setBlockedNavigationURL = useSetAtom(blockedNavigationURLAtom);

  return ({ url, externalLink = false, buttonComponent = false }: URLInfo) => {
    if (preventNavigation) {
      setBlockedNavigationURL({
        url,
        externalLink,
      });
      setIsNavigationModalVisible(true);

      console.log('okkk', url);
    } else {
      if (buttonComponent) {
        if (url === 'back') {
          navigate(-1);
        } else {
          if (externalLink) {
            window.open(url, '_blank');
          } else {
            navigate(url);
          }
        }
      }
    }

    return preventNavigation;
  };
}
