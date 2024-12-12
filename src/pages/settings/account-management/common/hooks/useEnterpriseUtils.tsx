/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';
import { usePlansQuery } from '$app/common/queries/plans';
import { get } from 'lodash';
import { Plan } from '../../component/plan/Popup';
import { Account } from '$app/common/interfaces/account';

interface Rules {
  [key: string]: {
    term: 'month' | 'year';
    condition: (account: Account) => boolean;
  }[];
}

const rules: Rules = {
  enterprise_plan: [
    {
      term: 'month',
      condition: (account) => account.num_users < 2,
    },
    {
      term: 'year',
      condition: (account) => account.num_users < 2,
    },
    {
      term: 'year',
      condition: (account) =>
        account.plan === 'enterprise' &&
        account.num_users === 2 &&
        account.plan_term === 'month',
    },
  ],
  enterprise_plan_5: [
    {
      term: 'month',
      condition: (account) => account.num_users < 5,
    },
    {
      term: 'year',
      condition: (account) => account.num_users < 5,
    },
    {
      term: 'year',
      condition: (account) =>
        account.plan === 'enterprise' &&
        account.num_users === 5 &&
        account.plan_term === 'month',
    },
  ],
  enterprise_plan_10: [
    {
      term: 'month',
      condition: (account) => account.num_users < 10,
    },
    {
      term: 'year',
      condition: (account) => account.num_users < 10,
    },
    {
      term: 'year',
      condition: (account) =>
        account.plan === 'enterprise' &&
        account.num_users === 10 &&
        account.plan_term === 'month',
    },
  ],
  enterprise_plan_20: [
    {
      term: 'month',
      condition: (account) => account.num_users < 20,
    },
    {
      term: 'year',
      condition: (account) => account.num_users < 20,
    },
    {
      term: 'year',
      condition: (account) =>
        account.plan === 'enterprise' &&
        account.num_users === 20 &&
        account.plan_term === 'month',
    },
  ],
  enterprise_plan_50: [
    {
      term: 'month',
      condition: (account) => account.num_users < 50,
    },
    {
      term: 'year',
      condition: (account) => account.num_users < 50,
    },
    {
      term: 'year',
      condition: (account) =>
        account.plan === 'enterprise' &&
        account.num_users === 50 &&
        account.plan_term === 'month',
    },
  ],
};

export function useEnterpriseUtils() {
  const account = useCurrentAccount();
  const { data: plans } = usePlansQuery();

  function isEnterprisePlanVisible(plan: Plan, term: 'month' | 'year') {
    if (account.plan === '' || account.plan === 'pro') {
      return true;
    }

    const planRules = rules[plan];

    if (planRules && account) {
      for (const rule of planRules) {
        if (rule.term === term && rule.condition(account)) {
          return true;
        }
      }
    }

    return false;
  }

  function getFirstAvailableEnterprise(term: 'month' | 'year') {
    const available: Plan[] = [
      'enterprise_plan',
      'enterprise_plan_5',
      'enterprise_plan_10',
      'enterprise_plan_20',
      'enterprise_plan_30',
      'enterprise_plan_50',
    ];

    for (const plan of available) {
      const planRules = rules[plan];

      if (planRules && account) {
        for (const rule of planRules) {
          if (rule.term === term && rule.condition(account)) {
            return plan;
          }
        }
      }
    }

    return null;
  }

  function calculatePrice() {
    const term = account.plan_term;

    if (!plans?.plans) {
      return 0;
    }

    if (account.num_users <= 2) {
      return term === 'month'
        ? get(plans, 'plans.enterprise_plan')
        : get(plans, 'plans.enterprise_plan_annual');
    }

    if (account.num_users <= 5) {
      return term === 'month'
        ? get(plans, 'plans.enterprise_plan_5')
        : get(plans, 'plans.enterprise_plan_annual_5');
    }

    if (account.num_users <= 10) {
      return term === 'month'
        ? get(plans, 'plans.enterprise_plan_10')
        : get(plans, 'plans.enterprise_plan_annual_10');
    }

    if (account.num_users <= 20) {
      return term === 'month'
        ? get(plans, 'plans.enterprise_plan_20')
        : get(plans, 'plans.enterprise_plan_annual_20');
    }

    if (account.num_users <= 30) {
      return term === 'month'
        ? get(plans, 'plans.enterprise_plan_30')
        : get(plans, 'plans.enterprise_plan_annual_30');
    }

    if (account.num_users <= 50) {
      return term === 'month'
        ? get(plans, 'plans.enterprise_plan_50')
        : get(plans, 'plans.enterprise_plan_annual_50');
    }

    return term === 'month'
      ? get(plans, 'plans.enterprise_plan')
      : get(plans, 'plans.enterprise_plan_annual');
  }

  return {
    isEnterprisePlanVisible,
    getFirstAvailableEnterprise,
    calculatePrice,
  };
}
