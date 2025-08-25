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
import { $refetch } from '$app/common/hooks/useRefetch';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Element } from '$app/components/cards';
import { CountrySelector } from '$app/components/CountrySelector';
import { InputField } from '$app/components/forms';
import { useNavigationTopRightElement } from '$app/components/layouts/common/hooks';
import { ResourceActions } from '$app/components/ResourceActions';
import { docuCompanyAccountDetailsAtom } from '$app/pages/documents/Document';
import { useAtomValue } from 'jotai';
import { cloneDeep, get, set } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useActions } from './common/hooks/useActions';
import { Company } from '$app/common/interfaces/docuninja/api';
import { AxiosError } from 'axios';
import { TimezoneSelector } from '$app/components/TimezoneSelector';
import { CurrencySelector } from '$app/components/CurrencySelector';
import { LanguageSelector } from '$app/components/LanguageSelector';

export const AVAILABLE_PROPERTIES = [
  {
    key: 'name',
    type: 'string',
  },
  {
    key: 'address1',
    type: 'string',
  },
  {
    key: 'address2',
    type: 'string',
  },
  {
    key: 'website',
    type: 'string',
  },
  {
    key: 'city',
    type: 'string',
  },

  {
    key: 'state',
    type: 'string',
  },
  {
    key: 'postal_code',
    type: 'string',
  },
  {
    key: 'country_id',
    type: 'number',
  },
  {
    key: 'currency_id',
    type: 'number',
  },
  {
    key: 'timezone_id',
    type: 'number',
  },
  {
    key: 'language_id',
    type: 'number',
  },
];

export default function CompanyDetails() {
  const [t] = useTranslation();

  const docuCompanyAccountDetails = useAtomValue(docuCompanyAccountDetailsAtom);

  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [currentDetails, setCurrentDetails] = useState<Company>();

  const actions = useActions({ setErrors, setIsFormBusy, isFormBusy });

  const handleChange = (key: string, value: string) => {
    const updatedDetails = cloneDeep(currentDetails) as Company;

    set(updatedDetails, key, value);

    setCurrentDetails(updatedDetails);
  };

  const handleSave = () => {
    if (!isFormBusy) {
      setIsFormBusy(true);
      toast.processing();

      request(
        'PUT',
        docuNinjaEndpoint('/api/companies/:id', {
          id: docuCompanyAccountDetails?.company?.id,
        }),
        currentDetails,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      )
        .then(() => {
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

  useEffect(() => {
    if (docuCompanyAccountDetails) {
      const details = {};

      for (const property of AVAILABLE_PROPERTIES) {
        const value = get(docuCompanyAccountDetails.company, property.key);

        if (value) {
          set(details, property.key, value);
        } else {
          set(details, property.key, property.type === 'number' ? 1 : '');
        }
      }

      setCurrentDetails(details as Company);
    }
  }, [docuCompanyAccountDetails]);

  useNavigationTopRightElement(
    {
      element: (
        <ResourceActions
          resource={currentDetails}
          actions={actions}
          disableSaveButton={isFormBusy || !currentDetails}
          saveButtonLabel={t('save')}
          onSaveClick={handleSave}
        />
      ),
    },
    [isFormBusy, currentDetails]
  );

  return (
    <div className="pt-4 pb-4">
      <Element leftSide={t('company_name')}>
        <InputField
          value={currentDetails?.name}
          onValueChange={(value) => handleChange('name', value)}
          errorMessage={errors?.errors.name}
        />
      </Element>

      <Element leftSide={t('address1')}>
        <InputField
          value={currentDetails?.address1}
          onValueChange={(value) => handleChange('address1', value)}
          errorMessage={errors?.errors.address1}
        />
      </Element>

      <Element leftSide={t('address2')}>
        <InputField
          value={currentDetails?.address2}
          onValueChange={(value) => handleChange('address2', value)}
          errorMessage={errors?.errors.address2}
        />
      </Element>

      <Element leftSide={t('city')}>
        <InputField
          value={currentDetails?.city}
          onValueChange={(value) => handleChange('city', value)}
          errorMessage={errors?.errors.city}
        />
      </Element>

      <Element leftSide={t('state')}>
        <InputField
          value={currentDetails?.state}
          onValueChange={(value) => handleChange('state', value)}
          errorMessage={errors?.errors.state}
        />
      </Element>

      <Element leftSide={t('postal_code')}>
        <InputField
          value={currentDetails?.postal_code}
          onValueChange={(value) => handleChange('postal_code', value)}
          errorMessage={errors?.errors.postal_code}
        />
      </Element>

      <Element leftSide={t('country')}>
        <CountrySelector
          value={String(currentDetails?.country_id) || ''}
          onChange={(value) => handleChange('country_id', value)}
          errorMessage={errors?.errors.country_id}
          dismissable={false}
          withBlank
        />
      </Element>

      <Element leftSide={t('currency')}>
        <CurrencySelector
          value={String(currentDetails?.currency_id) || ''}
          onChange={(value) => handleChange('currency_id', value)}
          errorMessage={errors?.errors.currency_id}
          dismissable={false}
          withBlank
        />
      </Element>

      <Element leftSide={t('language')}>
        <LanguageSelector
          value={String(currentDetails?.language_id) || ''}
          onChange={(value) => handleChange('language_id', value)}
          errorMessage={errors?.errors.language_id}
          dismissable={false}
          withBlank
        />
      </Element>

      <Element leftSide={t('time_zone')}>
        <TimezoneSelector
          value={String(currentDetails?.timezone_id) || ''}
          onValueChange={(value) => handleChange('timezone_id', value)}
          errorMessage={errors?.errors.timezone_id}
          dismissable={false}
          withBlank
        />
      </Element>

      <Element leftSide={t('website')}>
        <InputField
          value={currentDetails?.website}
          onValueChange={(value) => handleChange('website', value)}
          errorMessage={errors?.errors.website}
        />
      </Element>
    </div>
  );
}
