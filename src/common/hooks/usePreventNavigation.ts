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

export const isNavigationModalVisibleAtom = atom<boolean>(false);
export function usePreventNavigation() {
  const preventNavigation = useAtomValue(preventClosingTabOrBrowserAtom);
  const setIsNavigationModalVisible = useSetAtom(isNavigationModalVisibleAtom);

  return () => {
    if (!preventNavigation) {
      setIsNavigationModalVisible(true);
    }

    return preventNavigation;
  };
}
