/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { activeSettingsAtom } from '$app/common/atoms/settings';
import { defaultSettings } from '$app/common/constants/blank-company-settings';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Client } from '$app/common/interfaces/client';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { updateChanges } from '$app/common/stores/slices/company-users';
import { setActiveSettings } from '$app/common/stores/slices/settings';
import { companySettingsErrorsAtom } from '$app/pages/settings/common/atoms';
import { AxiosError } from 'axios';
import { useAtomValue, useSetAtom } from 'jotai';
import { cloneDeep } from 'lodash';
import { useDispatch } from 'react-redux';

export function useUpdateClientSettings() {
  const dispatch = useDispatch();
  const companyChanges = useCompanyChanges();
  const activeSettings = useAtomValue(activeSettingsAtom);

  const setErrors = useSetAtom(companySettingsErrorsAtom);

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
      ...activeSettings,
      settings: adjustedSettings,
    };
  };

  return () => {
    toast.processing();
    setErrors(undefined);

    request(
      'PUT',
      endpoint('/api/v1/clients/:id', {
        id: activeSettings?.id,
      }),
      adjustPayload()
    )
      .then((response: GenericSingleResourceResponse<Client>) => {
        toast.success('updated_settings');

        $refetch(['clients']);

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
              name: response.data.data.display_name,
              level: 'client',
            },
          })
        );
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          toast.dismiss();
          setErrors(error.response.data);
        }
      });
  };
}
