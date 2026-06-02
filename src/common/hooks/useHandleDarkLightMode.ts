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
    // Fire-and-forget; the optimistic atom write already flipped the UI.
    save('dark_mode', value).catch(() => undefined);
  };
}
