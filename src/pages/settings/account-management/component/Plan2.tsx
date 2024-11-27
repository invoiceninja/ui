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
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { Card } from '$app/components/cards';
import { Button, InputField, Radio, SelectField } from '$app/components/forms';
import { Check, Plus, Trash2 } from 'react-feather';
import mc from 'public/gateway-card-images/mastercard.png';
import visa from 'public/gateway-card-images/visa.png';
import { Modal } from '$app/components/Modal';
import { useEffect, useState } from 'react';
import Toggle from '$app/components/forms/Toggle';
import {
  loadStripe,
  Stripe,
  StripeCardElement,
  StripeElements,
} from '@stripe/stripe-js';
import { wait } from '$app/common/helpers/wait';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from 'react-query';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { request } from '$app/common/helpers/request';
import { date, endpoint } from '$app/common/helpers';
import { AxiosResponse } from 'axios';
import { Alert } from '$app/components/Alert';
import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';
import collect from 'collect.js';
import { useRefreshCompanyUsers } from '$app/common/hooks/useRefreshCompanyUsers';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { get } from 'lodash';
import {
  FaCheck,
  FaCheckCircle,
  FaCheckDouble,
  FaCheckSquare,
} from 'react-icons/fa';
import { Badge } from '$app/components/Badge';
import { useFormik } from 'formik';
import { toast } from '$app/common/helpers/toast/toast';

export interface CompanyGateway {
  id: number;
  company_id: number;
  client_id: number;
  token: string;
  routing_number: null;
  company_gateway_id: number;
  gateway_customer_reference: string;
  gateway_type_id: number;
  is_default: number;
  deleted_at: null;
  created_at: number;
  updated_at: number;
  is_deleted: number;
  hashed_id: string;
  gateway_type: {
    id: string;
    alias: string;
    name: string;
  };
  meta: {
    exp_month: string;
    exp_year: string;
    brand: string;
    last4: string;
    type: number;
  };
}

export function Plan2() {
  const accentColor = useAccentColor();
  const colors = useColorScheme();
  const account = useCurrentAccount();

  const [popupVisible, setPopupVisible] = useState(false);
  const [deletePopupVisible, setDeletePopupVisible] = useState(false);
  const [createPopupVisible, setCreatePopupVisible] = useState(false);

  const { data: methods } = useQuery({
    queryKey: ['/api/account_management/methods', account?.id],
    queryFn: () =>
      request('POST', endpoint('/api/account_management/methods'), {
        account_key: account.key,
      }).then((response: AxiosResponse<CompanyGateway[]>) => response.data),
  });

  const [selectedGateway, setSelectedGateway] = useState<CompanyGateway | null>(
    null
  );

  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: () =>
      request('GET', endpoint('/api/account_management/plans')).then(
        (response: AxiosResponse<string[]>) => response.data
      ),
    staleTime: Infinity,
  });

  return (
    <div className="space-y-4">
      <Card>
        <div className="px-7 py-3 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold">Your Plan</h4>

            <button
              style={{ color: accentColor }}
              className="text-sm hover:underline"
              type="button"
              onClick={() => setPopupVisible(true)}
            >
              Compare plans
            </button>
          </div>

          {account.plan === '' ? <Free /> : null}

          {account.plan === 'enterprise' ? (
            <Plan
              title="Enterprise"
              color={accentColor}
              price="todo"
              trial={account.trial_days_left}
              custom={false}
            />
          ) : null}

          {account.plan === 'pro' ? (
            <Plan
              title="Ninja Pro"
              color="#5EC16A"
              price={get(plans, 'pro_plan_annual')!}
              trial={account.trial_days_left}
              custom={false}
            />
          ) : null}

          {account.plan === 'premium_business_plus' ? (
            <Plan
              title="Premium Business+"
              color="#FFCB00"
              price="todo"
              trial={account.trial_days_left}
              custom={false}
            />
          ) : null}

          <div
            className="rounded p-4 flex flex-col 2xl:flex-row justify-between items-center space-y-5 2xl:space-y-0"
            style={{ backgroundColor: colors.$2 }}
          >
            <div className="flex flex-col space-y-2">
              <p className="font-semibold text-center 2xl:text-left">
                Increase your efficiency with these features
              </p>

              <div className="flex flex-col 2xl:flex-row items-center space-x-2 text-sm">
                <p className="flex items-center space-x-1">
                  <Check size={18} style={{ color: accentColor }} />
                  <span className="block">Developer Direct Concierge</span>
                </p>

                <p className="flex items-center space-x-1">
                  <Check size={18} style={{ color: accentColor }} />
                  <span className="block">Priority Direct Support</span>
                </p>

                <p className="flex items-center space-x-1">
                  <Check size={18} style={{ color: accentColor }} />
                  <span className="block">Feature Request Priority</span>
                </p>
              </div>
            </div>

            <Button behavior="button" onClick={() => setPopupVisible(true)}>
              Upgrade Plan
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="px-7 py-3 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold">Payment method</h4>

            <button
              type="button"
              style={{ color: accentColor }}
              className="text-sm hover:underline flex items-center space-x-1"
              onClick={() => setCreatePopupVisible(true)}
            >
              <Plus size={18} /> <span>Add new card</span>
            </button>

            <NewCreditCard
              visible={createPopupVisible}
              onClose={() => setCreatePopupVisible(false)}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {methods?.length === 0 ? (
              <button
                type="button"
                className="flex items-center flex-col w-full lg:w-72 p-8 rounded border"
                style={{ borderColor: colors.$11.toString() }}
                onClick={() => setCreatePopupVisible(true)}
              >
                <div className="flex flex-col items-center justify-center space-y-3">
                  <Plus size={48} />
                  <p>Add new card</p>
                </div>
              </button>
            ) : null}

            {methods?.map((method) => (
              <CreditCard
                key={method.id}
                onDelete={() => {
                  setSelectedGateway(method);
                  setDeletePopupVisible(true);
                }}
                gateway={method}
              />
            ))}
          </div>
        </div>
      </Card>

      <Popup visible={popupVisible} onClose={() => setPopupVisible(false)} />

      <DeleteCreditCard
        gateway={selectedGateway}
        visible={deletePopupVisible}
        onClose={() => {
          setSelectedGateway(null);
          setDeletePopupVisible(false);
        }}
      />
    </div>
  );
}

interface PlanProps {
  title: string;
  color: string;
  trial: boolean;
  price: string;
  custom: boolean;
}

function Plan({ title, color, trial, price, custom }: PlanProps) {
  const scheme = useColorScheme();
  const account = useCurrentAccount();

  const width = () => {
    const percentage = (account.trial_days_left / 14) * 100;

    return Math.min(Math.max(percentage, 0), 100) + '%';
  };

  const { dateFormat } = useCurrentCompanyDateFormats();

  return (
    <div
      className="border border-l-8 rounded p-4 flex flex-col space-y-4"
      style={{ borderColor: color }}
    >
      <div className="flex justify-between items-center">
        <p className="font-semibold">{title}</p>

        {custom ? (
          <b>{price}</b>
        ) : (
          <p>
            {trial ? 'Free trial, then' : null} <b> ${price} /</b> year
          </p>
        )}
      </div>

      {trial ? (
        <div className="flex justify-between items-center">
          <p>{account.trial_days_left} days left</p>
          <p>14 days trial</p>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <p>
            Expires on <b>{date(account.plan_expires, dateFormat)}</b>
          </p>
        </div>
      )}

      {trial ? (
        <div
          className="w-full rounded-full h-2.5"
          style={{ backgroundColor: scheme.$2 }}
        >
          <div
            className="h-2.5 rounded-full"
            style={{ width: width(), background: color }}
          ></div>
        </div>
      ) : null}
    </div>
  );
}

function Free() {
  return (
    <div className="border rounded p-4 flex justify-between items-center">
      <p className="font-semibold">Free</p>

      <p>
        <b>$0 /</b> year
      </p>
    </div>
  );
}

interface CreditCardProps {
  gateway: CompanyGateway;
  onDelete: () => void;
}

function CreditCard({ gateway, onDelete }: CreditCardProps) {
  const accentColor = useAccentColor();
  const colors = useColorScheme();
  const account = useCurrentAccount();
  const queryClient = useQueryClient();

  const image = () => {
    if (gateway.meta.brand === 'visa') {
      return visa;
    }

    if (gateway.meta.brand === 'mastercard') {
      return mc;
    }
  };

  const { t } = useTranslation();

  const [defaultPopupVisible, setDefaultPopupVisible] = useState(false);

  const form = useFormik({
    initialValues: {},
    onSubmit: (_, { setSubmitting }) => {
      toast.processing();

      request(
        'POST',
        endpoint(`/api/account_management/methods/${gateway.id}/default`),
        {
          account_key: account.key,
        }
      )
        .then(() => {
          toast.success();

          queryClient.invalidateQueries({
            queryKey: ['/api/account_management/methods', account?.id],
          });

          setDefaultPopupVisible(false);
        })
        .finally(() => setSubmitting(false));
    },
  });

  return (
    <>
      <Modal
        title={t('default_payment_method_label')}
        visible={defaultPopupVisible}
        onClose={() => setDefaultPopupVisible(false)}
      >
        <p>{t('default_payment_method')}</p>

        <div className="flex justify-end gap-2">
          <Button
            type="secondary"
            behavior="button"
            onClick={() => setDefaultPopupVisible(false)}
          >
            {t('cancel')}
          </Button>

          <form onSubmit={form.handleSubmit}>
            <Button type="primary">{t('continue')}</Button>
          </form>
        </div>
      </Modal>

      <div
        className="flex flex-col w-full lg:w-72 p-4 rounded border"
        style={{ borderColor: gateway.is_default ? accentColor : colors.$11 }}
      >
        <div className="flex justify-between items-center">
          <img src={image()} alt={gateway.meta.brand} className="h-10" />

          <div className="flex items-center gap-2">
            {gateway.is_default ? (
              <Badge variant="primary">Default</Badge>
            ) : (
              <button
                type="button"
                className="bg-white p-1 rounded-full cursor-pointer"
                onClick={() => setDefaultPopupVisible(true)}
              >
                <Check size={18} />
              </button>
            )}

            <button
              type="button"
              className="bg-white p-1 rounded-full cursor-pointer"
              onClick={onDelete}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="space-x-1 flex items-center my-4 font-bold">
          <span>****</span>
          <span>****</span>
          <span>****</span>
          <span>{gateway.meta.last4}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <p>Valid through</p>
          <p>
            {gateway.meta.exp_month}/{gateway.meta.exp_year}
          </p>
        </div>
      </div>
    </>
  );
}

interface PopupProps {
  visible: boolean;
  onClose: () => void;
}

interface Intent {
  id: string;
  client_secret: string;
}

interface NewCardProps {
  visible: boolean;
  onClose: () => void;
}

function NewCreditCard({ visible, onClose }: NewCardProps) {
  const colors = useColorScheme();
  const company = useCurrentCompany();
  const queryClient = useQueryClient();
  const account = useCurrentAccount();

  const { t } = useTranslation();

  const [name, setName] = useState<string>('');
  const [errors, setErrors] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [intent, setIntent] = useState<{
    intent: string;
    secret: string;
  } | null>(null);

  const [context, setContext] = useState<{
    stripe: Stripe;
    elements: StripeElements;
    card: StripeCardElement;
  } | null>(null);

  useEffect(() => {
    if (visible) {
      wait('#card-element').then(() => {
        loadStripe(import.meta.env.VITE_HOSTED_STRIPE_PK).then((stripe) => {
          if (!stripe) {
            return;
          }

          request('POST', endpoint('/api/account_management/methods/intent'), {
            account_key: account.key,
          })
            .then((response: AxiosResponse<Intent>) => {
              setIntent({
                intent: response.data.id,
                secret: response.data.client_secret,
              });

              const elements = stripe.elements();
              const card = elements.create('card');

              card.mount('#card-element');

              setContext({ stripe, elements, card });
            })
            .catch(() => null);
        });
      });
    }

    if (!visible) {
      queryClient.removeQueries({
        queryKey: ['account_management', 'intent', company?.id],
      });

      queryClient.invalidateQueries({
        queryKey: ['/api/account_management/methods'],
      });
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!context || !intent) {
      return;
    }

    setErrors(null);
    setIsSubmitting(true);

    context.stripe
      .confirmCardSetup(intent.secret, {
        payment_method: {
          card: context.card,
          billing_details: {
            name,
          },
        },
      })
      .then((result) => {
        if (result.error && result.error.message) {
          setErrors(result.error.message);
          setIsSubmitting(false);

          return;
        }

        if (result.setupIntent && result.setupIntent.status === 'succeeded') {
          request('POST', endpoint('/api/account_management/methods/confirm'), {
            account_key: account.key,
            gateway_response: result.setupIntent,
          }).then(() => {
            toast.success(t('payment_method_added')!);

            setIsSubmitting(false);
            onClose();
          });
        }
      })
      .catch(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Add new card">
      {errors && <Alert type="danger">{errors}</Alert>}

      <InputField label={t('name')} onValueChange={setName} />

      <div
        id="card-element"
        className="border p-4 rounded"
        style={{ backgroundColor: colors.$1, borderColor: colors.$5 }}
      ></div>

      <div className="flex justify-end gap-2">
        <Button type="secondary" behavior="button" onClick={onClose}>
          Cancel
        </Button>

        <Button
          type="primary"
          behavior="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          Save card
        </Button>
      </div>
    </Modal>
  );
}

interface DeleteCreditCardProps {
  gateway: CompanyGateway | null;
  visible: boolean;
  onClose: () => void;
}

function DeleteCreditCard({
  gateway,
  visible,
  onClose,
}: DeleteCreditCardProps) {
  const { t } = useTranslation();
  const account = useCurrentAccount();
  const queryClient = useQueryClient();

  const destroy = () => {
    if (!gateway) {
      return;
    }

    request(
      'DELETE',
      endpoint(`/api/account_management/methods/${gateway.id}`),
      {
        account_key: account.key,
      }
    ).then(() => {
      toast.success(t('payment_method_removed')!);

      queryClient.invalidateQueries({
        queryKey: ['/api/account_management/methods', account?.id],
      });

      onClose();
    });
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <div className="px-5 text-center space-y-4 mb-4">
        <h4 className="font-semibold text-xl">
          Are you sure you want to delete the credit card?
        </h4>

        <p>You can add a card again at any time.</p>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="secondary" behavior="button" onClick={() => onClose()}>
          Cancel
        </Button>

        <Button type="primary" behavior="button" onClick={destroy}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}

export type Plan =
  | 'free'
  | 'pro_plan'
  | 'pro_plan_annual'
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

function Popup({ visible, onClose }: PopupProps) {
  const [pricing, setPricing] = useState<'monthly' | 'annually'>('monthly');

  const accentColor = useAccentColor();
  const colors = useColorScheme();
  const account = useCurrentAccount();

  const [changePlanVisible, setChangePlanVisible] = useState(false);
  const [targetPlan, setTargetPlan] = useState<Plan | null>(null);
  const [enterprisePlan, setEnterprisePlan] = useState<Plan>('enterprise_plan');

  useEffect(() => {
    if (changePlanVisible) {
      onClose();
    }
  }, [changePlanVisible]);

  function label(plan: Plan) {
    const currentPlan = account.plan as Plan;

    const plans: Plan[] = [
      'free',
      'pro_plan',
      'pro_plan_annual',
      'enterprise_plan',
      'enterprise_plan_5',
      'enterprise_plan_10',
      'enterprise_plan_20',
      'enterprise_plan_30',
      'enterprise_plan_50',
      'enterprise_plan_annual',
      'enterprise_plan_annual_5',
      'enterprise_plan_annual_10',
      'enterprise_plan_annual_20',
      'enterprise_plan_annual_30',
      'enterprise_plan_annual_50',
      'premium_business_plan',
    ];

    const current = plans.indexOf(currentPlan);
    const target = plans.indexOf(plan);

    if (current === target && current !== -1 && target !== -1) {
      return 'current_plan';
    }

    if (current > target) {
      return 'downgrade_plan';
    }

    return 'upgrade_plan';
  }

  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: () =>
      request('GET', endpoint('/api/account_management/plans')).then(
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

  return (
    <>
      <Modal
        title="Change plan"
        visible={changePlanVisible}
        onClose={() => setChangePlanVisible(false)}
      >
        {targetPlan ? <ChangePlan plan={targetPlan} /> : null}
      </Modal>

      <Modal visible={visible} onClose={onClose} size="large">
        <div className="-mt-16 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-semibold">More than invoicing</h1>
            <h2 className="text-2xl mt-2">
              Simple Pricing. Advanced Features.
            </h2>
          </div>

          <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-2">
              <span>Monthly</span>

              <Toggle
                checked={pricing === 'annually'}
                onValueChange={() =>
                  setPricing((c) => (c === 'monthly' ? 'annually' : 'monthly'))
                }
              />
              <span>Annual</span>
            </div>
          </div>

          <div className="flex flex-col 2xl:flex-row gap-4 mt-6">
            <div className="w-full 2xl:w-1/4 border py-8 px-7 rounded border-t-8">
              <div className="h-72 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-2xl">Free!</h3>
                  <p className="my-4">Yes, it’s really free 🙂</p>

                  <div>
                    <div className="flex items-end space-x-2">
                      <h2 className="text-3xl font-semibold">$0</h2>
                      <span>
                        {pricing === 'monthly' ? t('per_month') : t('per_year')}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="border py-3 px-4 rounded"
                  style={{ color: accentColor }}
                  onClick={() => {
                    setTargetPlan('free');
                    setChangePlanVisible(true);
                  }}
                  disabled={account.plan === ''}
                >
                  {label('free')}
                </button>
              </div>

              <div
                className="w-full p-[0.1px] my-5"
                style={{ backgroundColor: colors.$5 }}
              ></div>

              <p className="font-semibold uppercase">Free plan includes</p>

              <div className="my-3 space-y-3">
                {plans?.features.free.map((feature, i) => (
                  <div key={`free-${i}`} className="flex items-center gap-3">
                    <FaCheckCircle
                      color={accentColor}
                      size={14}
                      className="flex-shrink-0"
                    />
                    <p>{feature}</p>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="w-full 2xl:w-1/4 border py-8 px-7 rounded border-t-8"
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
                        {pricing === 'monthly' ? t('per_month') : t('per_year')}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="border py-3 px-4 rounded"
                  style={{ backgroundColor: colors.$5 }}
                  onClick={() => {
                    setTargetPlan(
                      pricing === 'monthly' ? 'pro_plan' : 'pro_plan_annual'
                    );
                    setChangePlanVisible(true);
                  }}
                  disabled={account.plan === 'pro_plan'}
                >
                  {label('pro_plan')}
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

            <div
              className="w-full 2xl:w-1/4 border py-8 px-7 rounded border-t-8"
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
                              `${enterprisePlan.replace('plan', 'plan_annual')}`
                            )}
                      </h2>
                      <span>
                        {pricing === 'monthly' ? t('per_month') : t('per_year')}
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
                    <option value="enterprise_plan">1-2 users</option>
                    <option value="enterprise_plan_5">3-5 users</option>
                    <option value="enterprise_plan_10">6-10 users</option>
                    <option value="enterprise_plan_20">11-20 users</option>
                    <option value="enterprise_plan_30">21-30 users</option>
                    <option value="enterprise_plan_50">31-50 users</option>
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
                    {label(enterprisePlan)}
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

            <div
              className="w-full 2xl:w-1/4 border py-8 px-7 rounded border-t-8"
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

interface ChangePlanProps {
  plan: Plan;
}

function ChangePlan({ plan }: ChangePlanProps) {
  const { t } = useTranslation();

  const account = useCurrentAccount();
  const queryClient = useQueryClient();
  const refresh = useRefreshCompanyUsers();

  const { data: methods } = useQuery({
    queryKey: ['/api/account_management/methods', account?.id],
    queryFn: () =>
      request('POST', endpoint('/api/account_management/methods'), {
        account_key: account.key,
      }).then((response: AxiosResponse<CompanyGateway[]>) => response.data),
  });

  const list = collect(methods ?? [])
    .map((method) => ({
      id: `card-${method.id}`,
      title: `**** ${method.meta.last4}`,
      value: method.id.toString(),
    }))
    .toArray();

  const [token, setToken] = useState<string>('true');

  const changePlan = () => {
    request('POST', endpoint('/api/account_management/upgrade'), {
      account_key: account.key,
      plan,
      token,
    }).then(() => {
      toast.success(t('plan_changed')!);

      queryClient.invalidateQueries({
        queryKey: ['/api/account_management/methods', account?.id],
      });

      refresh();
    });
  };

  return (
    <div>
      <p>Changing plan to: {plan}</p>

      <div className="my-3">
        <Radio
          name="empty_columns"
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          options={list}
          onValueChange={setToken}
          defaultSelected={token}
        />
      </div>

      <div className="flex justify-end">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            changePlan();
          }}
        >
          <Button>{t('continue')}</Button>
        </form>
      </div>
    </div>
  );
}
