/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState } from 'react';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useRefreshCompanyUsers } from '$app/common/hooks/useRefreshCompanyUsers';
import { AxiosError } from 'axios';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { $refetch } from '$app/common/hooks/useRefetch';

export function useQuickbooksDisconnect() {
  const refresh = useRefreshCompanyUsers();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationBag>();

  const handleDisconnect = () => {
    if (isFormBusy) return;

    toast.processing();
    setIsFormBusy(true);
    setErrors(undefined);

    request('POST', endpoint('/api/v1/quickbooks/disconnect'), {})
      .then(() => {
        toast.success('disconnected');
        $refetch(['company_users']);
        refresh();
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          setErrors(error.response.data);
          toast.dismiss();
        } else {
          toast.error();
        }
      })
      .finally(() => setIsFormBusy(false));
  };

  return { handleDisconnect, isFormBusy, errors };
}
