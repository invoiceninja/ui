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
import { toast } from '$app/common/helpers/toast/toast';
import { wait } from '$app/common/helpers/wait';
import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';
import { CompanyGateway } from '$app/common/interfaces/company-gateway';
import { Alert } from '$app/components/Alert';
import { NonClickableElement } from '$app/components/cards/NonClickableElement';
import { Button, Radio } from '$app/components/forms';
import {
  loadStripe,
  Stripe,
  StripeCardElement,
  StripeElements,
} from '@stripe/stripe-js';
import { AxiosResponse } from 'axios';
import collect from 'collect.js';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { Intent } from './NewCreditCard';
import { Plan } from './Popup';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';

interface ChangePlanProps {
  plan: Plan;
  cycle: 'monthly' | 'annually';
}

interface PlanDescription {
  description: string;
  price: number;
}

export function ChangePlan({ plan, cycle }: ChangePlanProps) {
  const { t } = useTranslation();

  const account = useCurrentAccount();
  const colors = useColorScheme();

  const { data: methods } = useQuery({
    queryKey: ['/api/client/account_management/methods', account?.id],
    queryFn: () =>
      request('POST', endpoint('/api/client/account_management/methods'), {
        account_key: account.key,
      }).then(
        (response: AxiosResponse<GenericManyResponse<CompanyGateway>>) =>
          response.data.data
      ),
  });

  const { data: planDescription } = useQuery({
    queryKey: ['/api/client/account_management/upgrade/description', plan],
    queryFn: () =>
      request(
        'POST',
        endpoint('/api/client/account_management/upgrade/description'),
        {
          cycle,
          plan,
          account_key: account.key,
        }
      ).then((response: AxiosResponse<PlanDescription>) => response.data),
  });

  const list = collect(methods ?? [])
    .map((method) => ({
      id: `card-${method.id}`,
      title: `**** ${method.meta.last4}`,
      value: method.id.toString(),
    }))
    .push({
      id: 'card-new',
      title: 'New card',
      value: '',
    });

  const [token, setToken] = useState<string>(() => {
    if (list.first().value !== '') {
      return list.first().value;
    }

    return '';
  });

  const [errors, setErrors] = useState<string | null>(null);

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
    if (token !== '') {
      return;
    }

    wait('#card-element').then(() => {
      loadStripe(import.meta.env.VITE_HOSTED_STRIPE_PK).then((stripe) => {
        if (!stripe) {
          return;
        }

        request(
          'POST',
          endpoint('/api/client/account_management/upgrade/intent'),
          {
            account_key: account.key,
            plan,
          }
        )
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
  }, [token]);

  const form = useFormik({
    initialValues: {},
    onSubmit: (_, { setSubmitting }) => {
      setErrors(null);

      if (token === '') {
        if (!context || !intent) {
          toast.error();

          return;
        }

        context.stripe
          .confirmCardSetup(intent.secret, {
            payment_method: {
              card: context.card,
            },
          })
          .then((result) => {
            if (result.error && result.error.message) {
              setErrors(result.error.message);
              setSubmitting(false);

              return;
            }

            if (
              result.setupIntent &&
              result.setupIntent.status === 'succeeded'
            ) {
              request(
                'POST',
                endpoint('/api/client/account_management/upgrade'),
                {
                  gateway_response: result.setupIntent,
                  account_key: account.key,
                  plan,
                  cycle,
                  token: null,
                }
              )
                .then(() => toast.success())
                .catch(() => toast.error())
                .finally(() => setSubmitting(false));
            }
          })
          .catch(() => {
            setSubmitting(false);
          })
          .finally(() => setSubmitting(false));

        return;
      }

      if (token) {
        request('POST', endpoint('/api/client/account_management/upgrade'), {
          gateway_response: null,
          account_key: account.key,
          plan,
          token,
          cycle,
        })
          .then(() => toast.success())
          .catch(() => toast.error())
          .finally(() => setSubmitting(false));

        return;
      }
    },
  });

  return (
    <div>
      <p className="mb-3">
        Changing plan to: <b>{t(plan)}</b>
      </p>

      {errors && <Alert type="danger">{errors}</Alert>}

      {planDescription ? (
        <NonClickableElement
          className="border rounded"
          style={{ borderColor: colors.$5, backgroundColor: colors.$1 }}
        >
          <div className="flex items-center justify-between">
            <p>{planDescription.description}</p>
            <p className="font-semibold">{planDescription.price}</p>
          </div>
        </NonClickableElement>
      ) : null}

      <p className="mb-3 my-5">Pay with</p>

      <form onSubmit={form.handleSubmit}>
        <Radio
          name="empty_columns"
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          options={list.toArray()}
          onValueChange={setToken}
          defaultSelected={token}
        />

        {token === '' ? (
          <div
            id="card-element"
            className="border p-4 rounded mt-3.5"
            style={{ backgroundColor: colors.$1, borderColor: colors.$5 }}
          ></div>
        ) : null}
      </form>

      <div className="flex justify-end mt-5">
        <Button onClick={() => form.submitForm()} disabled={form.isSubmitting}>
          {t('continue')}
        </Button>
      </div>
    </div>
  );
}
