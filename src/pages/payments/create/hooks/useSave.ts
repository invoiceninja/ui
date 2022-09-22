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
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { Payment } from 'common/interfaces/payment';
import { ValidationBag } from 'common/interfaces/validation-bag';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';

export function useSave(
  setErrors: React.Dispatch<React.SetStateAction<ValidationBag | undefined>>
) {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return (payment: Payment, sendEmail: boolean) => {
    setErrors(undefined);

    const toastId = toast.loading(t('processing'));

    request(
      'POST',
      endpoint('/api/v1/payments?email_receipt=:email', {
        email: sendEmail,
      }),
      payment
    )
      .then((data) => {
        toast.success(t('created_payment'), { id: toastId });
        navigate(route('/payments/:id/edit', { id: data.data.data.id }));
      })
      .catch((error: AxiosError) => {
        console.error(error);
        toast.error(t('error_title'), { id: toastId });

        if (error.response?.status === 422) {
          setErrors(error.response.data);
        }
      })
      .finally(() => {
        queryClient.invalidateQueries(route('/api/v1/payments'));
      });
  };
}
