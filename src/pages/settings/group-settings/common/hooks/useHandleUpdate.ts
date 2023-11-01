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
import { activeSettingsAtom } from '$app/common/atoms/settings';
import { defaultSettings } from '$app/common/constants/blank-company-settings';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import { $refetch } from '$app/common/hooks/useRefetch';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { GroupSettings } from '$app/common/interfaces/group-settings';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { updateChanges } from '$app/common/stores/slices/company-users';
import { setActiveSettings } from '$app/common/stores/slices/settings';
import { AxiosError } from 'axios';
import { useAtomValue } from 'jotai';
import { cloneDeep } from 'lodash';
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
  const activeGroupSettings = useAtomValue(activeSettingsAtom);
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);
  const { isGroupSettingsActive } = useCurrentSettingsLevel();

  const { groupSettings, setErrors, setIsFormBusy, isFormBusy } = params;

  const adjustPayload = () => {
    const adjustedSettings = cloneDeep(companyChanges?.settings);

    if (adjustedSettings) {
      if (
        !adjustedSettings.email_template_custom1 ||
        !adjustedSettings.email_subject_custom1
      ) {
        delete adjustedSettings.email_template_custom1;
        delete adjustedSettings.email_subject_custom1;
      }

      if (
        !adjustedSettings.email_template_custom2 ||
        !adjustedSettings.email_subject_custom2
      ) {
        delete adjustedSettings.email_template_custom2;
        delete adjustedSettings.email_subject_custom2;
      }

      if (
        !adjustedSettings.email_template_custom3 ||
        !adjustedSettings.email_subject_custom3
      ) {
        delete adjustedSettings.email_template_custom3;
        delete adjustedSettings.email_subject_custom3;
      }

      Object.entries(adjustedSettings).forEach(([property, value]) => {
        if (value === null) {
          adjustedSettings[property] =
            defaultSettings[property as keyof typeof defaultSettings];
        }
      });
    }

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
        groupSettings || adjustPayload()
      )
        .then((response: GenericSingleResourceResponse<GroupSettings>) => {
          toast.success('updated_group');

          $refetch(['group_settings']);

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
