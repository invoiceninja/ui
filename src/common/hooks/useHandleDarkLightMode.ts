/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useSaveReactSettings } from './useReactSettings';

export function useHandleDarkLightMode() {
  const save = useSaveReactSettings();

  return (value: boolean) => {
    // Fire-and-forget; swallow the rejection so a transient network error
    // doesn't surface as an unhandled promise rejection. The optimistic
    // atom write already flipped the UI; convergence happens on the next
    // successful save or page reload.
    save('dark_mode', value).catch(() => undefined);
  };
}
