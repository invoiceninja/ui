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
import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';
import { CompanyGateway } from '$app/common/interfaces/company-gateway';
import { Alert } from '$app/components/Alert';
import { NonClickableElement } from '$app/components/cards/NonClickableElement';
import { Button, Radio } from '$app/components/forms';
import { AxiosError, AxiosResponse } from 'axios';
import collect from 'collect.js';
import { useFormik } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { Plan } from './Popup';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { ValidationBag } from '$app/common/interfaces/validation-bag';

interface ChangePlanProps {
  plan: Plan;
  cycle: 'monthly' | 'annually';
  onSuccess: () => void;
}

interface PlanDescription {
  description: string;
  price: number;
  pro_rata: string;
}

export function ChangePlan({ plan, cycle, onSuccess }: ChangePlanProps) {
  const { t } = useTranslation();

  const account = useCurrentAccount();
  const colors = useColorScheme();

  const [$plan] = useState(() => {
    let p = plan;

    if (cycle === 'annually' && !p.includes('annual')) {
      p = plan.replace('plan', 'plan_annual') as Plan;
    }

    return p;
  });

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
          plan: $plan,
          account_key: account.key,
        }
      ).then((response: AxiosResponse<PlanDescription>) => response.data),
  });

  const list = collect(methods ?? []).map((method) => ({
    id: `card-${method.id}`,
    title: `**** ${method.meta.last4}`,
    value: method.id.toString(),
  }));

  const [token, setToken] = useState<string>(() => {
    if (list.isEmpty()) {
      return '';
    }

    if (list.first().value !== '') {
      return list.first().value;
    }

    return '';
  });

  const [errors, setErrors] = useState<string | null>(null);

  const form = useFormik({
    initialValues: {},
    onSubmit: (_, { setSubmitting }) => {
      setErrors(null);

      if (token) {
        request('POST', endpoint('/api/client/account_management/upgrade'), {
          gateway_response: null,
          account_key: account.key,
          plan: $plan,
          token,
        })
          .then(() => {
            toast.success();

            onSuccess();
          })
          .catch((error: AxiosError<ValidationBag>) => {
            console.log(error.response?.data);

            error.response?.status === 400 || error.response?.status === 422
              ? toast.error(error.response.data.message)
              : toast.error();

            return toast.error();
          })
          .finally(() => setSubmitting(false));

        return;
      }
    },
  });

  return (
    <div>
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

      {list.isEmpty() ? (
        <p className="my-5">{t('missing_payment_method')}</p>
      ) : (
        <div>
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
          </form>

          <div className="flex justify-end mt-5">
            <Button
              onClick={() => form.submitForm()}
              disabled={form.isSubmitting}
            >
              {t('pay_now')} ({planDescription?.pro_rata})
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
