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
import { store } from 'common/stores/store';
import { ModuleBitmask } from 'pages/settings/account-management/component';
import { Guard } from '../Guard';

export function enabled(module: ModuleBitmask): Guard {
  const index = store.getState().companyUsers.currentIndex;

  return () => {
    const value = Boolean(
      store.getState().companyUsers.api?.[index]?.company?.enabled_modules &
        module
    );

    return new Promise((resolve) => resolve(value));
  };
}

export function useEnabled() {
  const company = useCurrentCompany();

  return (module: ModuleBitmask) => Boolean(company?.enabled_modules & module);
}
