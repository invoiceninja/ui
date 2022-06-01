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

export function proPlan() {
  return Boolean(
    store.getState().companyUsers.api?.[
      store.getState().companyUsers.currentIndex
    ]?.account.plan === 'pro'
  );
}
