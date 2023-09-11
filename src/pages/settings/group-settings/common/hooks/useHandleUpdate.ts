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
import { activeGroupSettingsAtom } from '$app/common/atoms/settings';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { GroupSettings } from '$app/common/interfaces/group-settings';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { updateChanges } from '$app/common/stores/slices/company-users';
import { setActiveSettings } from '$app/common/stores/slices/settings';
import { AxiosError } from 'axios';
import { useAtomValue } from 'jotai';
import { Dispatch, SetStateAction } from 'react';
import { useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

interface Params {
  groupSettings?: GroupSettings;
  setErrors?: Dispatch<SetStateAction<ValidationBag | undefined>>;
  setIsFormBusy?: Dispatch<SetStateAction<boolean>>;
  isFormBusy?: boolean;
}

export function useHandleUpdate(params: Params) {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const companyChanges = useCompanyChanges();
  const activeGroupSettings = useAtomValue(activeGroupSettingsAtom);
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);
  const { isGroupSettingsActive } = useCurrentSettingsLevel();

  const { groupSettings, setErrors, setIsFormBusy, isFormBusy } = params;

  const adjustGroupSettingsPayload = () => {
    const adjustedSettings = { ...companyChanges?.settings };

    Object.entries(adjustedSettings).forEach(([property, value]) => {
      if (Array.isArray(value) && !value.length) {
        delete adjustedSettings[property];
      } else if (
        value &&
        typeof value === 'object' &&
        !Object.entries(value).length
      ) {
        delete adjustedSettings[property];
      } else if (typeof value === 'string' && !value) {
        delete adjustedSettings[property];
      }
    });

    return {
      ...activeGroupSettings,
      settings: adjustedSettings,
    };
  };

  return () => {
    if (!isFormBusy) {
      toast.processing();
      setErrors?.(undefined);
      setIsFormBusy?.(true);

      request(
        'PUT',
        endpoint('/api/v1/group_settings/:id', {
          id: id || activeGroupSettings?.id,
        }),
        groupSettings || adjustGroupSettingsPayload()
      )
        .then((response: GenericSingleResourceResponse<GroupSettings>) => {
          toast.success('updated_group');

          queryClient.invalidateQueries(
            route('/api/v1/group_settings/:id', {
              id: id || activeGroupSettings?.id,
            })
          );

          if (isGroupSettingsActive) {
            dispatch(
              updateChanges({
                object: 'company',
                property: 'settings',
                value: response.data.data.settings,
              })
            );

            dispatch(
              setActiveSettings({
                status: {
                  name: response.data.data.name,
                  level: 'group',
                },
              })
            );
          }

          invalidateQueryValue &&
            queryClient.invalidateQueries([invalidateQueryValue]);
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            toast.dismiss();
            setErrors?.(error.response.data);
          }
        })
        .finally(() => setIsFormBusy?.(false));
    }
  };
}
