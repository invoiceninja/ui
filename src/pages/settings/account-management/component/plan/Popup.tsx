/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';
import { SelectField } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { Modal } from '$app/components/Modal';
import { AxiosResponse } from 'axios';
import { get } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCheck, FaCheckDouble, FaCheckSquare } from 'react-icons/fa';
import { useQuery } from 'react-query';
import { ChangePlan } from './ChangePlan';
import { PopupProps } from './NewCreditCard';
import { useRefreshCompanyUsers } from '$app/common/hooks/useRefreshCompanyUsers';
import { useCalculateEnterprisePrice } from '../Plan2';

export type Plan =
  | '' // Free
  | 'pro'
  | 'pro_plan'
  | 'pro_plan_annual'
  | 'enterprise'
  | 'enterprise_plan'
  | 'enterprise_plan_5'
  | 'enterprise_plan_10'
  | 'enterprise_plan_20'
  | 'enterprise_plan_30'
  | 'enterprise_plan_50'
  | 'enterprise_plan_annual'
  | 'enterprise_plan_annual_5'
  | 'enterprise_plan_annual_10'
  | 'enterprise_plan_annual_20'
  | 'enterprise_plan_annual_30'
  | 'enterprise_plan_annual_50'
  | 'premium_business_plan';

export function Popup({ visible, onClose }: PopupProps) {
  const account = useCurrentAccount();

  const accentColor = useAccentColor();
  const colors = useColorScheme();
  const refresh = useRefreshCompanyUsers();

  const [pricing, setPricing] = useState<'monthly' | 'annually'>(() => {
    if (account.plan_term === 'month') {
      return 'monthly';
    }

    return 'annually';
  });

  const enterprisePrice = useCalculateEnterprisePrice({ strategy: 'next' });

  const [changePlanVisible, setChangePlanVisible] = useState(false);
  const [targetPlan, setTargetPlan] = useState<Plan | null>(null);
  const [enterprisePlan, setEnterprisePlan] = useState<Plan>(() => {
    if (enterprisePrice !== null) {
      return enterprisePrice.key as Plan;
    }

    return 'enterprise_plan';
  });

  useEffect(() => {
    if (changePlanVisible) {
      onClose();
    }
  }, [changePlanVisible]);

  const currentEnterprisePrice = useCalculateEnterprisePrice({
    strategy: 'current',
  });

  function isPlanVisible(plan: Plan) {
    const currentPlan = account.plan as Plan;

    const plans: Plan[] = ['', 'pro', 'enterprise'];

    const current = plans.indexOf(currentPlan);
    const target = plans.indexOf(plan);

    if (
      plan === 'enterprise' &&
      currentPlan === 'enterprise' &&
      enterprisePrice !== null
    ) {
      return true;
    }

    return current < target;
  }

  function isEnterprisePlanVisible(plan: Plan) {
    if (account.plan !== 'enterprise') {
      return true;
    }

    if (currentEnterprisePrice === null) {
      return false;
    }

    const plans: Plan[] = [
      'enterprise_plan',
      'enterprise_plan_5',
      'enterprise_plan_10',
      'enterprise_plan_20',
      'enterprise_plan_30',
      'enterprise_plan_50',
    ];

    const current = plans.indexOf(currentEnterprisePrice.key as Plan);
    const target = plans.indexOf(plan);

    return current < target;
  }

  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: () =>
      request('GET', endpoint('/api/client/account_management/plans')).then(
        (
          response: AxiosResponse<{
            plans: string[];
            features: Record<Plan, string[]>;
          }>
        ) => response.data
      ),
    staleTime: Infinity,
    enabled: visible,
  });

  const { t } = useTranslation();

  function isToggleVisible() {
    if (isPlanVisible('pro')) {
      return true;
    }

    if (isPlanVisible('enterprise') && enterprisePrice !== null) {
      return true;
    }

    return false;
  }

  return (
    <>
      <Modal
        title="Change plan"
        visible={changePlanVisible}
        onClose={() => setChangePlanVisible(false)}
        size="regular"
      >
        {targetPlan ? (
          <ChangePlan
            plan={targetPlan}
            cycle={pricing}
            onSuccess={() => {
              setChangePlanVisible(false);
              setTargetPlan(null);
              setEnterprisePlan(() => {
                if (enterprisePrice !== null) {
                  return enterprisePrice.key as Plan;
                }

                return 'enterprise_plan';
              });
              refresh();
            }}
          />
        ) : null}
      </Modal>

      <Modal visible={visible} onClose={onClose} size="large">
        <div className="-mt-16 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-semibold">More than invoicing</h1>
            <h2 className="text-2xl mt-2">
              Simple Pricing. Advanced Features.
            </h2>
          </div>

          {account.plan_term === '' ||
          (account.plan_term === 'month' && isToggleVisible()) ? (
            <div className="flex justify-center mt-6">
              <div className="flex items-center space-x-2">
                <span>Monthly</span>

                <Toggle
                  checked={pricing === 'annually'}
                  onValueChange={() =>
                    setPricing((c) =>
                      c === 'monthly' ? 'annually' : 'monthly'
                    )
                  }
                />
                <span>Annual</span>
              </div>
            </div>
          ) : null}

          <div className="flex justify-center flex-col 2xl:flex-row gap-4 mt-6">
            {isPlanVisible('pro') ? (
              <div
                className="w-full 2xl:w-[32rem] border py-8 px-7 rounded border-t-8"
                style={{ borderColor: '#5EC16A' }}
              >
                <div className="h-72 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-2xl">Ninja Pro</h3>
                    <p className="my-4">Pay annually for 10 months + 2 free!</p>

                    <div>
                      <div className="flex items-end space-x-2">
                        <h2 className="text-3xl font-semibold">
                          $
                          {pricing === 'monthly'
                            ? get(plans?.plans, 'pro_plan')
                            : get(plans?.plans, 'pro_plan_annual')}
                        </h2>

                        <span>
                          {pricing === 'monthly'
                            ? t('per_month')
                            : t('per_year')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="border py-3 px-4 rounded"
                    style={{ backgroundColor: accentColor, color: colors.$1 }}
                    onClick={() => {
                      setTargetPlan(
                        pricing === 'monthly' ? 'pro_plan' : 'pro_plan_annual'
                      );
                      setChangePlanVisible(true);
                    }}
                    disabled={account.plan === 'pro'}
                  >
                    Upgrade plan
                  </button>
                </div>

                <div
                  className="w-full p-[0.1px] my-5"
                  style={{ backgroundColor: colors.$5 }}
                ></div>

                <p className="font-semibold uppercase">All free features +</p>

                <div className="my-3 space-y-3">
                  {plans?.features.pro_plan.map((feature, i) => (
                    <div key={`pro-${i}`} className="flex items-center gap-3">
                      <FaCheck
                        color={accentColor}
                        size={14}
                        className="flex-shrink-0"
                      />
                      <p>{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {isPlanVisible('enterprise') ? (
              <div
                className="w-full 2xl:w-[32rem] border py-8 px-7 rounded border-t-8"
                style={{ borderColor: accentColor }}
              >
                <div className="h-72 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-2xl">Enterprise</h3>
                    <p className="my-4">Pay annually for 10 months + 2 free!</p>

                    <div>
                      <div className="flex items-end space-x-2">
                        <h2 className="text-3xl font-semibold">
                          $
                          {pricing === 'monthly'
                            ? get(plans?.plans, enterprisePlan)
                            : get(
                                plans?.plans,
                                `${enterprisePlan.replace(
                                  'plan',
                                  'plan_annual'
                                )}`
                              )}
                        </h2>
                        <span>
                          {pricing === 'monthly'
                            ? t('per_month')
                            : t('per_year')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3">
                    <SelectField
                      label="Plan selected"
                      value={enterprisePlan}
                      onValueChange={(v) => setEnterprisePlan(v as Plan)}
                    >
                      {isEnterprisePlanVisible('enterprise_plan') ? (
                        <option value="enterprise_plan">1-2 users</option>
                      ) : null}

                      {isEnterprisePlanVisible('enterprise_plan_5') ? (
                        <option value="enterprise_plan_5">3-5 users</option>
                      ) : null}

                      {isEnterprisePlanVisible('enterprise_plan_10') ? (
                        <option value="enterprise_plan_10">6-10 users</option>
                      ) : null}

                      {isEnterprisePlanVisible('enterprise_plan_20') ? (
                        <option value="enterprise_plan_20">11-20 users</option>
                      ) : null}

                      {isEnterprisePlanVisible('enterprise_plan_30') ? (
                        <option value="enterprise_plan_30">21-30 users</option>
                      ) : null}

                      {isEnterprisePlanVisible('enterprise_plan_50') ? (
                        <option value="enterprise_plan_50">31-50 users</option>
                      ) : null}
                    </SelectField>

                    <button
                      type="button"
                      className="border py-3 px-4 rounded"
                      style={{ backgroundColor: accentColor, color: colors.$1 }}
                      onClick={() => {
                        setTargetPlan(enterprisePlan);
                        setChangePlanVisible(true);
                      }}
                      disabled={account.plan === enterprisePlan}
                    >
                      Upgrade plan
                    </button>
                  </div>
                </div>

                <div
                  className="w-full p-[0.1px] my-5"
                  style={{ backgroundColor: colors.$5 }}
                ></div>

                <p className="font-semibold uppercase">All pro features +</p>

                <div className="my-3 space-y-3">
                  {plans?.features.enterprise_plan.map((feature, i) => (
                    <div
                      key={`enterprise-${i}`}
                      className="flex items-center gap-3"
                    >
                      <FaCheckDouble
                        color={accentColor}
                        size={14}
                        className="flex-shrink-0"
                      />
                      <p>{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div
              className="w-full 2xl:w-[32rem] border py-8 px-7 rounded border-t-8"
              style={{ borderColor: '#FFCB00' }}
            >
              <div className="h-72 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-2xl">Premium Business+</h3>
                  <p className="my-4">
                    Pro + Enterprise + Premium Business Concierge
                  </p>

                  <div>
                    <h2 className="text-3xl font-semibold">
                      Pricing? <br /> Let&apos;s talk!
                    </h2>
                  </div>
                </div>

                <div className="flex flex-col space-y-3">
                  <a
                    href="mailto:concierge@invoiceninja.com"
                    type="button"
                    className="border py-3 px-4 rounded text-center"
                    style={{ backgroundColor: accentColor, color: colors.$1 }}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Contact us!
                  </a>
                </div>
              </div>

              <div
                className="w-full p-[0.1px] my-5"
                style={{ backgroundColor: colors.$5 }}
              ></div>

              <p className="font-semibold uppercase">All features +</p>

              <div className="my-3 space-y-3">
                {plans?.features.premium_business_plan.map((feature, i) => (
                  <div
                    key={`premium_business-${i}`}
                    className="flex items-center gap-3"
                  >
                    <FaCheckSquare
                      color={accentColor}
                      size={14}
                      className="flex-shrink-0"
                    />
                    <p>{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
