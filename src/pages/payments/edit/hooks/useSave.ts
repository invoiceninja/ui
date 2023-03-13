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
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { route } from '$app/common/helpers/route';

export function useSave(
  setErrors: React.Dispatch<React.SetStateAction<ValidationBag | undefined>>
) {
  const [t] = useTranslation();
  const queryClient = useQueryClient();

  return (payment: Payment) => {
    setErrors(undefined);

    const toastId = toast.loading(t('processing'));

    request(
      'PUT',
      endpoint('/api/v1/payments/:id', { id: payment.id }),
      payment
    )
      .then(() => {
        toast.success(t('updated_payment'), { id: toastId });
      })
      .catch((error: AxiosError<ValidationBag>) => {
        console.error(error);

        toast.error(t('error_title'), { id: toastId });

        if (error.response?.status === 422) {
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
