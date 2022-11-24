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
import { toast } from 'common/helpers/toast/toast';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { Invoice } from 'common/interfaces/invoice';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useNavigate } from 'react-router-dom';

export function useHandleCreate(
  setErrors: (errors: ValidationBag | undefined) => unknown
) {
  const navigate = useNavigate();

  return (invoice: Invoice) => {
    toast.processing();
    setErrors(undefined);

    request('POST', endpoint('/api/v1/invoices'), invoice)
      .then((response: GenericSingleResourceResponse<Invoice>) => {
        toast.success('created_invoice');

        navigate(route('/invoices/:id/edit', { id: response.data.data.id }));
      })
      .catch((error: AxiosError<ValidationBag>) => {
        console.error(error);

        error.response?.status === 422
          ? toast.dismiss() && setErrors(error.response.data)
          : toast.error();
      });
  };
}
