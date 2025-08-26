/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { $refetch } from '$app/common/hooks/useRefetch';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { docuCompanyAccountDetailsAtom } from '$app/pages/documents/Document';
import axios, { AxiosError, AxiosPromise, AxiosResponse } from 'axios';
import { useAtomValue } from 'jotai';
import { get, set } from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { AVAILABLE_PROPERTIES } from '../../CompanyDetails';

interface Params {
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  setIsFormBusy: Dispatch<SetStateAction<boolean>>;
  isFormBusy: boolean;
}

export function useSyncDocuninjaCompany({
  setErrors,
  setIsFormBusy,
  isFormBusy,
}: Params) {
  const currentCompany = useCurrentCompany();

  const docuCompanyAccountDetails = useAtomValue(docuCompanyAccountDetailsAtom);

  const convertUrlToFormData = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      console.log(response);

      const formData = new FormData();

      formData.append('logo', blob);

      return formData;
    } catch (error) {
      console.error(error);
    }
  };

  const handleSync = async () => {
    if (!isFormBusy) {
      setIsFormBusy(true);
      toast.processing();

      const docuninjaCompanyPayload = {};

      for (const property of AVAILABLE_PROPERTIES) {
        let value = get(currentCompany.settings, property.key);

        if (!value) {
          value = get(docuCompanyAccountDetails?.company, property.key);
        }

        if (value) {
          set(docuninjaCompanyPayload, property.key, value);
        } else {
          set(
            docuninjaCompanyPayload,
            property.key,
            property.type === 'number' ? 1 : ''
          );
        }
      }

      const requests: AxiosPromise[] = [];

      requests.push(
        request(
          'PUT',
          docuNinjaEndpoint('/api/companies/:id', {
            id: docuCompanyAccountDetails?.company?.id,
          }),
          docuninjaCompanyPayload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                'X-DOCU-NINJA-TOKEN'
              )}`,
            },
          }
        )
      );

      console.log(currentCompany.settings.company_logo);

      const currentLogoData = await convertUrlToFormData(
        currentCompany.settings.company_logo
      );

      requests.push(
        request(
          'POST',
          docuNinjaEndpoint('/api/companies/:id/logo', {
            id: docuCompanyAccountDetails?.company?.id,
          }),
          { logo: currentLogoData },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                'X-DOCU-NINJA-TOKEN'
              )}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        )
      );

      axios
        .all(requests)
        .then((responses: AxiosResponse[]) => {
          console.log(responses);
          toast.success('updated_company');

          $refetch(['docuninja_login']);
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            toast.dismiss();
            setErrors(error.response.data);
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  return { handleSync };
}
