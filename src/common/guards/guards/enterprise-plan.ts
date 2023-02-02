/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { isSelfHosted } from 'common/helpers';
import { GuardContext } from '../Guard';

export function enterprisePlan() {
  return ({ companyUser }: GuardContext) => {
    if (isSelfHosted()) {
      return true;
    }

    return Boolean(companyUser?.account.plan === 'enterprise');
  };
}
