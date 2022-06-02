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

export function freePlan() {
  const plans = ['pro', 'enterprise', 'white_label'];

  return !plans.includes(
    store.getState().companyUsers.api?.[
      store.getState().companyUsers.currentIndex
    ]?.account.plan
  );
}
