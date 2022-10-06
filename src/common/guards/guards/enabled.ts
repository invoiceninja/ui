/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { store } from 'common/stores/store';
import { ModuleBitmask } from 'pages/settings/account-management/component';

export function enabled(module: ModuleBitmask) {
  const index = store.getState().companyUsers.currentIndex;

  return Boolean(
    store.getState().companyUsers.api?.[index]?.company?.enabled_modules & module
  );
}
