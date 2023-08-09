/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { Payment } from '$app/common/interfaces/payment';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useQueryClient } from 'react-query';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useHandleCompanySave } from '$app/pages/settings/common/hooks/useHandleCompanySave';

export function useSave(
  setErrors: React.Dispatch<React.SetStateAction<ValidationBag | undefined>>
) {
  const queryClient = useQueryClient();

  const saveCompany = useHandleCompanySave();

  return async (payment: Payment) => {
    setErrors(undefined);

    toast.processing();

    await saveCompany(true);

    const adjustedPaymentPayload = { ...payment };

    delete adjustedPaymentPayload.invoices;
    delete adjustedPaymentPayload.credits;

    await saveCompany(true);

    request(
      'PUT',
      endpoint('/api/v1/payments/:id', { id: payment.id }),
      adjustedPaymentPayload
    )
      .then(() => {
        toast.success('updated_payment');
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          toast.dismiss();
          setErrors(error.response.data);
        }
      })
      .finally(() =>
        queryClient.invalidateQueries(
          route('/api/v1/payments/:id', { id: payment.id })
        )
      );
  };
}
