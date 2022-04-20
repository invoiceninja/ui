/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios, { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { Invoice } from 'common/interfaces/invoice';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { defaultHeaders } from 'common/queries/common/headers';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate } from 'react-router-dom';

export function useHandleCreate(
  setErrors: (errors: ValidationBag | undefined) => unknown
) {
  const [t] = useTranslation();
  const navigate = useNavigate();

  return (invoice: Invoice) => {
    const toastId = toast.loading(t('processing'));
    setErrors(undefined);

    axios
      .post(endpoint('/api/v1/invoices'), invoice, { headers: defaultHeaders() })
      .then((response) => {
        toast.success(t('created_invoice'), { id: toastId });

        navigate(
          generatePath('/invoices/:id/edit', { id: response.data.data.id })
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
