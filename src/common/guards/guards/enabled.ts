/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { ModuleBitmask } from 'pages/settings/account-management/component';

export function useEnabled() {
  const company = useCurrentCompany();

  return (module: ModuleBitmask) =>
    Boolean(company && company.enabled_modules & module);
}
