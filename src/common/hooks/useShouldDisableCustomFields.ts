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

export function useShouldDisableCustomFields() {
  const { proPlan, enterprisePlan } = usePlan();

  return !proPlan && !enterprisePlan && isHosted();
}
