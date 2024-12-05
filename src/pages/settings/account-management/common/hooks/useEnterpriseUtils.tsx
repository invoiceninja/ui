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

export function useEnterpriseUtils() {
  const account = useCurrentAccount();
  const { data: plans } = usePlansQuery();

  function isEnterprisePlanVisible(plan: Plan) {
    if (account.plan === '' || account.plan === 'pro') {
      return true;
    }

    if (account.plan === 'enterprise') {
      console.log(account.num_users)

      if (plan === 'enterprise_plan' && account.num_users < 2) {
        return true;
      }

      if (plan === 'enterprise_plan_5' && account.num_users < 5) {
        return true;
      }

      if (plan === 'enterprise_plan_10' && account.num_users < 10) {
        return true;
      }

      if (plan === 'enterprise_plan_20' && account.num_users < 20) {
        return true;
      }

      if (plan === 'enterprise_plan_30' && account.num_users < 30) {
        return true;
      }

      if (plan === 'enterprise_plan_50' && account.num_users < 50) {
        return true;
      }
    }

    return false;
  }

  function getFirstAvailableEnterprise() {
    if (account.num_users < 2) {
      return 'enterprise_plan';
    }

    if (account.num_users < 5) {
      return 'enterprise_plan_5';
    }

    if (account.num_users < 10) {
      return 'enterprise_plan_10';
    }

    if (account.num_users < 20) {
      return 'enterprise_plan_20';
    }

    if (account.num_users < 30) {
      return 'enterprise_plan_30';
    }

    if (account.num_users < 50) {
      return 'enterprise_plan_50';
    }

    return 'enterprise_plan';
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
