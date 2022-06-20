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
import { Credit } from 'common/interfaces/credit';
import { ValidationBag } from 'common/interfaces/validation-bag';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate } from 'react-router-dom';

export function useHandleCreate(
  setErrors: (errors: ValidationBag | undefined) => unknown
) {
  const [t] = useTranslation();
  const navigate = useNavigate();

  return (credit: Credit) => {
    const toastId = toast.loading(t('processing'));
    setErrors(undefined);

    request('POST', endpoint('/api/v1/credits'), credit)
      .then((response) => {
        toast.success(t('created_credit'), { id: toastId });

        navigate(
          generatePath('/credits/:id/edit', { id: response.data.data.id })
        );
      })
      .catch((error: AxiosError) => {
        console.error(error);

        if (error.response?.status === 422) {
          setErrors(error.response.data);
        }

        toast.error(t('error_title'), { id: toastId });
      });
  };
}
