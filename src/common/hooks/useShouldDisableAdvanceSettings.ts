/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { usePlan } from 'common/guards/guards/free-plan';
import { isHosted } from 'common/helpers';

export function useShouldDisableAdvanceSettings() {
  const { enterprisePlan, proPlan } = usePlan();

  return !proPlan && !enterprisePlan && isHosted();
}
