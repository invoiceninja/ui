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
import { endpoint } from '$app/common/helpers';
import {
  resetChanges,
  updateRecord,
} from '$app/common/stores/slices/company-users';
import { useDispatch } from 'react-redux';
import { request } from '$app/common/helpers/request';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { toast } from '$app/common/helpers/toast/toast';
import { useAtom, useSetAtom } from 'jotai';
import { companySettingsErrorsAtom } from '../atoms';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { hasLanguageChanged as hasLanguageChangedAtom } from '$app/pages/settings/localization/common/atoms';
import { useShouldUpdateCompany } from '$app/common/hooks/useCurrentCompany';
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import { useHandleUpdate } from '../../group-settings/common/hooks/useHandleUpdate';
import { useUpdateClientSettings } from '$app/pages/clients/common/hooks/useUpdateClientSettings';
import { $refetch } from '$app/common/hooks/useRefetch';

interface SaveOptions {
  excludeToasters?: boolean;
  syncSendTime?: boolean;
}

export function useHandleCompanySave() {
  const dispatch = useDispatch();

  const companyChanges = useInjectCompanyChanges();

  const shouldUpdate = useShouldUpdateCompany();
  const handleUpdateGroupSettings = useHandleUpdate({});
  const updateClientSettings = useUpdateClientSettings();

  const {
    isGroupSettingsActive,
    isCompanySettingsActive,
    isClientSettingsActive,
  } = useCurrentSettingsLevel();

  const setErrors = useSetAtom(companySettingsErrorsAtom);

  const [hasLanguageChanged, setHasLanguageIdChanged] = useAtom(
    hasLanguageChangedAtom
  );

  return async (options?: SaveOptions) => {
    const { excludeToasters = false, syncSendTime } = options || {};

    if (!shouldUpdate() && isCompanySettingsActive) {
      return;
    }

    if (isGroupSettingsActive) {
      return handleUpdateGroupSettings();
    }

    if (isClientSettingsActive) {
      return updateClientSettings();
    }

    const adjustedExcludeToaster =
      typeof excludeToasters === 'boolean' && excludeToasters;

    !adjustedExcludeToaster && toast.processing();

    setErrors(undefined);

    let endpointUrl = '/api/v1/companies/:id';

    if (typeof syncSendTime === 'boolean') {
      endpointUrl += '?sync_send_time=' + syncSendTime;
    }

    return request(
      'PUT',
      endpoint(endpointUrl, { id: companyChanges?.id }),
      companyChanges
    )
      .then((response) => {
        dispatch(updateRecord({ object: 'company', data: response.data.data }));
        dispatch(resetChanges('company'));

        !adjustedExcludeToaster && toast.dismiss();

        if (hasLanguageChanged) {
          $refetch(['statics']);
          setHasLanguageIdChanged(false);
        }

        !adjustedExcludeToaster && toast.success('updated_settings');
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          setErrors(error.response.data);
          toast.dismiss();
        }
      });
  };
}
