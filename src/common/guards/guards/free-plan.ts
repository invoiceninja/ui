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
import { useCurrentCompanyUser } from 'common/hooks/useCurrentCompanyUser';
import { useQueryClient } from 'react-query';
import { useParams } from 'react-router-dom';
import { GuardContext } from '../Guard';
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
  const params = useParams();
  const queryClient = useQueryClient();
  const companyUser = useCurrentCompanyUser();

  const payload: GuardContext = {
    params,
    queryClient,
    companyUser,
  };

  return {
    freePlan: freePlan()(payload),
    proPlan: proPlan()(payload),
    enterprisePlan: enterprisePlan()(payload),
  };
}
