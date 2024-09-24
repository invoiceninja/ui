/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useReactSettings } from './useReactSettings';

export function useUserNumberPrecision() {
  const reactSettings = useReactSettings();

  return reactSettings?.number_precision &&
    reactSettings?.number_precision > 0 &&
    reactSettings?.number_precision <= 100
    ? reactSettings.number_precision
    : 2;
}
