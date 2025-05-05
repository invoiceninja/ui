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
import { FaCheck, FaCheckDouble, FaCheckSquare } from 'react-icons/fa';
import { useQuery } from 'react-query';
import { ChangePlan } from './ChangePlan';
import { PopupProps } from './NewCreditCard';
import { useRefreshCompanyUsers } from '$app/common/hooks/useRefreshCompanyUsers';
import { useEnterpriseUtils } from '../../common/hooks/useEnterpriseUtils';
import { useTranslation } from 'react-i18next';

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
  const { getFirstAvailableEnterprise, isEnterprisePlanVisible } =
    useEnterpriseUtils();

  const [pricing, setPricing] = useState<'month' | 'year'>(() => {
    if (account.plan_term === 'year') {
      return 'year';
    }

    return 'month';
  });

  const [changePlanVisible, setChangePlanVisible] = useState(false);
  const [targetPlan, setTargetPlan] = useState<Plan | null>(null);
  const [enterprisePlan, setEnterprisePlan] = useState<Plan | null>(
    getFirstAvailableEnterprise(pricing)
  );

  useEffect(() => {
    if (changePlanVisible) {
      onClose();
    }
  }, [changePlanVisible]);

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

  function isPlanVisible(
    plan: 'pro' | 'pro_annual' | 'enterprise' | 'enterprise_annual'
  ) {
    if (plan === 'pro' && account.plan === '') {
      return true;
    }

    if (
      plan === 'pro_annual' &&
      (account.plan === '' || account.plan === 'pro') &&
      account.plan_term === 'month' &&
      pricing === 'year'
    ) {
      return true;
    }

    if (plan === 'enterprise') {
      return (
        isEnterprisePlanVisible('enterprise_plan', pricing) ||
        isEnterprisePlanVisible('enterprise_plan_5', pricing) ||
        isEnterprisePlanVisible('enterprise_plan_10', pricing) ||
        isEnterprisePlanVisible('enterprise_plan_20', pricing) ||
        isEnterprisePlanVisible('enterprise_plan_30', pricing) ||
        isEnterprisePlanVisible('enterprise_plan_50', pricing)
      );
    }

    return false;
  }

  useEffect(() => {
    if (!account) {
      return;
    }

    setEnterprisePlan(getFirstAvailableEnterprise(pricing));

    setPricing(() => {
      if (account.plan_term === 'year') {
        return 'year';
      }

      return 'month';
    });
  }, [account?.num_users, account.plan_term]);

  useEffect(() => {
    setEnterprisePlan(getFirstAvailableEnterprise(pricing));
  }, [pricing]);

  const { t } = useTranslation();

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
            cycle={pricing === 'month' ? 'monthly' : 'annually'}
            onSuccess={() => {
              refresh();

              setChangePlanVisible(false);
              setTargetPlan(null);
            }}
          />
        ) : null}
      </Modal>

      <Modal visible={visible} onClose={onClose} size="large">
        <div className="-mt-16 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-semibold">
              {t('upgrade_popup_headline')}
            </h1>
            <h2 className="text-2xl mt-2">{t('upgrade_popup_description')}</h2>
          </div>

          {account.plan_term === '' || account.plan_term === 'month' ? (
            <div className="flex justify-center mt-6">
              <div className="flex items-center space-x-2">
                <span>{t('plan_term_monthly')}</span>

                <Toggle
                  checked={pricing === 'year'}
                  onValueChange={() =>
                    setPricing((c) => (c === 'month' ? 'year' : 'month'))
                  }
                />
                <span>{t('plan_term_yearly')}</span>
              </div>
            </div>
          ) : null}

          <div className="flex justify-center flex-col xl:flex-row gap-4 mt-6">
            {isPlanVisible('pro') ? (
              <div
                className="w-full 2xl:w-[32rem] border py-8 px-7 rounded border-t-8"
                style={{ borderColor: '#5EC16A' }}
              >
                <div className="h-72 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-2xl">
                      {t('pro_plan_label')}
                    </h3>
                    <p className="my-4">{t('upgrade_popup_pro_headline')}</p>

                    <div>
                      <div className="flex items-end space-x-2">
                        <h2 className="text-3xl font-semibold">
                          $
                          {pricing === 'month'
                            ? get(plans?.plans, 'pro_plan')
                            : get(plans?.plans, 'pro_plan_annual')}
                        </h2>

                        <span>
                          {pricing === 'month'
                            ? `/${t('month')}`
                            : `/${t('year')}`}
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
                        pricing === 'month' ? 'pro_plan' : 'pro_plan_annual'
                      );
                      setChangePlanVisible(true);
                    }}
                  >
                    {t('upgrade_plan')}
                  </button>
                </div>

                <div
                  className="w-full p-[0.1px] my-5"
                  style={{ backgroundColor: colors.$5 }}
                ></div>

                <p className="font-semibold uppercase">
                  {t('all_free_features_plus')}
                </p>

                <div className="my-3 space-y-3">
                  {features.pro.map((feature, i) => (
                    <div key={`pro-${i}`} className="flex items-center gap-3">
                      <FaCheck
                        color={accentColor}
                        size={14}
                        className="flex-shrink-0"
                      />
                      <p>{t(feature)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {isPlanVisible('pro_annual') ? (
              <div
                className="w-full 2xl:w-[32rem] border py-8 px-7 rounded border-t-8"
                style={{ borderColor: '#5EC16A' }}
              >
                <div className="h-72 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-2xl">
                      {t('pro_plan_label')}
                    </h3>
                    <p className="my-4">{t('upgrade_popup_pro_headline')}</p>

                    <div>
                      <div className="flex items-end space-x-2">
                        <h2 className="text-3xl font-semibold">
                          $
                          {pricing === 'month'
                            ? get(plans?.plans, 'pro_plan')
                            : get(plans?.plans, 'pro_plan_annual')}
                        </h2>

                        <span>
                          {pricing === 'month'
                            ? `/${t('month')}`
                            : `/${t('year')}`}
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
                        pricing === 'month' ? 'pro_plan' : 'pro_plan_annual'
                      );
                      setChangePlanVisible(true);
                    }}
                  >
                    {t('upgrade_plan')}
                  </button>
                </div>

                <div
                  className="w-full p-[0.1px] my-5"
                  style={{ backgroundColor: colors.$5 }}
                ></div>

                <p className="font-semibold uppercase">
                  {t('all_free_features_plus')}
                </p>

                <div className="my-3 space-y-3">
                  {features.pro.map((feature, i) => (
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
                    <h3 className="font-semibold text-2xl">
                      {t('enterprise_plan_label')}
                    </h3>
                    <p className="my-4">
                      {t('upgrade_popup_enterprise_headline')}
                    </p>

                    <div>
                      <div className="flex items-end space-x-2">
                        {enterprisePlan ? (
                          <h2 className="text-3xl font-semibold">
                            $
                            {pricing === 'month'
                              ? get(plans?.plans, enterprisePlan)
                              : get(
                                  plans?.plans,
                                  `${enterprisePlan.replace(
                                    'plan',
                                    'plan_annual'
                                  )}`
                                )}
                          </h2>
                        ) : null}

                        <span>
                          {pricing === 'month'
                            ? `/${t('month')}`
                            : `/${t('year')}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3">
                    <SelectField
                      label={t('plan_selected')}
                      value={enterprisePlan}
                      onValueChange={(v) => setEnterprisePlan(v as Plan)}
                    >
                      {isEnterprisePlanVisible('enterprise_plan', pricing) ? (
                        <option value="enterprise_plan">
                          1-2 {t('users').toLowerCase()}
                        </option>
                      ) : null}

                      {isEnterprisePlanVisible('enterprise_plan_5', pricing) ? (
                        <option value="enterprise_plan_5">
                          3-5 {t('users').toLowerCase()}
                        </option>
                      ) : null}

                      {isEnterprisePlanVisible(
                        'enterprise_plan_10',
                        pricing
                      ) ? (
                        <option value="enterprise_plan_10">
                          6-10 {t('users').toLowerCase()}
                        </option>
                      ) : null}

                      {isEnterprisePlanVisible(
                        'enterprise_plan_20',
                        pricing
                      ) ? (
                        <option value="enterprise_plan_20">
                          11-20 {t('users').toLowerCase()}
                        </option>
                      ) : null}

                      {isEnterprisePlanVisible(
                        'enterprise_plan_30',
                        pricing
                      ) ? (
                        <option value="enterprise_plan_30">
                          21-30 {t('users').toLowerCase()}
                        </option>
                      ) : null}

                      {isEnterprisePlanVisible(
                        'enterprise_plan_50',
                        pricing
                      ) ? (
                        <option value="enterprise_plan_50">
                          31-50 {t('users').toLowerCase()}
                        </option>
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
                    >
                      {t('upgrade_plan')}
                    </button>
                  </div>
                </div>

                <div
                  className="w-full p-[0.1px] my-5"
                  style={{ backgroundColor: colors.$5 }}
                ></div>

                <p className="font-semibold uppercase">
                  {t('all_pro_features_plus')}
                </p>

                <div className="my-3 space-y-3">
                  {features.enterprise.map((feature, i) => (
                    <div
                      key={`enterprise-${i}`}
                      className="flex items-center gap-3"
                    >
                      <FaCheckDouble
                        color={accentColor}
                        size={14}
                        className="flex-shrink-0"
                      />
                      <p>{t(feature)}</p>
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
                  <h3 className="font-semibold text-2xl">
                    {t('premium_business_plus_label')}
                  </h3>
                  <p className="my-4">
                    {t('upgrade_popup_premium_business_plus_headline')}
                  </p>

                  <div>
                    <h2 className="text-3xl font-semibold">
                      {t('upgrade_popup_premium_business_plus_pricing')}
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
                    {t('contact_us')}!
                  </a>
                </div>
              </div>

              <div
                className="w-full p-[0.1px] my-5"
                style={{ backgroundColor: colors.$5 }}
              ></div>

              <p className="font-semibold uppercase">
                {t('all_features_plus')}
              </p>

              <div className="my-3 space-y-3">
                {features.premium_business_plus.map((feature, i) => (
                  <div
                    key={`premium_business-${i}`}
                    className="flex items-center gap-3"
                  >
                    <FaCheckSquare
                      color={accentColor}
                      size={14}
                      className="flex-shrink-0"
                    />
                    <p>{t(feature)}</p>
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

export const features = {
  pro: [
    'pro_plan_feature_1',
    'pro_plan_feature_2',
    'pro_plan_feature_3',
    'pro_plan_feature_4',
    'pro_plan_feature_5',
    'pro_plan_feature_6',
    'pro_plan_feature_7',
    'pro_plan_feature_8',
    'pro_plan_feature_9',
    'pro_plan_feature_10',
    'pro_plan_feature_11',
    'pro_plan_feature_12',
    'pro_plan_feature_13',
    'pro_plan_feature_14',
    'pro_plan_feature_15',
    'pro_plan_feature_16',
    'pro_plan_feature_17',
    'pro_plan_feature_18',
  ],
  enterprise: [
    'enterprise_plan_feature_1',
    'enterprise_plan_feature_2',
    'enterprise_plan_feature_3',
    'enterprise_plan_feature_4',
  ],
  premium_business_plus: [
    'premium_business_plus_feature_1',
    'premium_business_plus_feature_2',
    'premium_business_plus_feature_3',
    'premium_business_plus_feature_4',
    'premium_business_plus_feature_5',
    'premium_business_plus_feature_6',
  ],
};
