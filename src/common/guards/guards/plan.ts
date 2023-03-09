/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { isSelfHosted } from '$app/common/helpers';
import { Guard } from '../Guard';

export type Plan = 'pro' | 'enterprise' | 'white_label';

export function plan(p: Plan): Guard {
  return ({ companyUser }) =>
    new Promise((resolve) => {
      if (isSelfHosted()) {
        return resolve(true);
      }

      if (companyUser?.account.plan === p) {
        return resolve(true);
      }

      return resolve(false);
    });
}
