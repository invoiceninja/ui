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
import { route } from '$app/common/helpers/route';
import { Payment } from '$app/common/interfaces/payment';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useNavigate } from 'react-router-dom';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { generate64CharHash } from '$app/common/hooks/useGenerateHash';

export function useSave(
  setErrors: React.Dispatch<React.SetStateAction<ValidationBag | undefined>>
) {
  const navigate = useNavigate();

  return (payment: Payment, sendEmail: boolean) => {
    setErrors(undefined);

    toast.processing();

    const idempotencyKey = generate64CharHash();

    request(
      'POST',
      endpoint('/api/v1/payments?email_receipt=:email', {
        email: sendEmail,
      }),
      { ...payment, idempotency_key: idempotencyKey }
    )
      .then((data) => {
        toast.success('created_payment');
        navigate(route('/payments/:id/edit', { id: data.data.data.id }));
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          toast.dismiss();
          setErrors(error.response.data);
        }
      })
      .finally(() => {
        $refetch(['payments', 'credits', 'invoices', 'clients']);
      });
  };
}
