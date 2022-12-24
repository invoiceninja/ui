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
import { useCompanyChanges } from 'common/hooks/useCompanyChanges';
import { updateRecord } from 'common/stores/slices/company-users';
import { useDispatch } from 'react-redux';
import { request } from 'common/helpers/request';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useQueryClient } from 'react-query';
import { toast } from 'common/helpers/toast/toast';
import { useAtom } from 'jotai';
import { companySettingsErrorsAtom } from '../atoms';

export function useHandleCompanySave() {
  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const companyChanges = useCompanyChanges();

  const [, setErrors] = useAtom(companySettingsErrorsAtom);

  return () => {
    toast.processing();

    setErrors(undefined);

    request(
      'PUT',
      endpoint('/api/v1/companies/:id', { id: companyChanges?.id }),
      companyChanges
    )
      .then((response) => {
        dispatch(updateRecord({ object: 'company', data: response.data.data }));

        queryClient.invalidateQueries('/api/v1/statics');

        toast.success('updated_settings');
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          setErrors(error.response.data);
          toast.dismiss();
        } else {
          console.error(error);
          toast.error();
        }
      });
  };
}
