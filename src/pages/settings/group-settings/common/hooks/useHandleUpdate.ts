/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { invalidationQueryAtom } from '$app/common/atoms/data-table';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { GroupSettings } from '$app/common/interfaces/group-settings';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { AxiosError } from 'axios';
import { useAtomValue } from 'jotai';
import { Dispatch, FormEvent, SetStateAction } from 'react';
import { useQueryClient } from 'react-query';
import { useParams } from 'react-router-dom';

interface Params {
  groupSettings: GroupSettings | undefined;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  setIsFormBusy: Dispatch<SetStateAction<boolean>>;
  isFormBusy: boolean;
}

export function useHandleUpdate(params: Params) {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  const { groupSettings, setErrors, setIsFormBusy, isFormBusy } = params;

  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormBusy) {
      toast.processing();
      setErrors(undefined);
      setIsFormBusy(true);

      request(
        'PUT',
        endpoint('/api/v1/group_settings/:id', { id }),
        groupSettings
      )
        .then(() => {
          toast.success('updated_group');

          queryClient.invalidateQueries(
            route('/api/v1/group_settings/:id', { id })
          );

          invalidateQueryValue &&
            queryClient.invalidateQueries([invalidateQueryValue]);
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            toast.dismiss();
            setErrors(error.response.data);
          } else {
            console.error(error);
            toast.error();
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };
}
