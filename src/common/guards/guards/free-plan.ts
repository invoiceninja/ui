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
import { GuardContext, useGuardContext } from '../Guard';
import { enterprisePlan } from './enterprise-plan';
import { proPlan } from './pro-plan';

export function freePlan() {
  const plans = ['pro', 'enterprise', 'white_label'];

  return ({ companyUser }: GuardContext) => {
    if (isSelfHosted()) {
      return true;
    }

    return !plans.includes(companyUser?.account.plan || '');
  };
}

export function usePlan() {
  const context = useGuardContext();

  return {
    freePlan: freePlan()(context),
    proPlan: proPlan()(context),
    enterprisePlan: enterprisePlan()(context),
  };
}
