/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Element } from '$app/components/cards';
import { CountrySelector } from '$app/components/CountrySelector';
import { Button, InputField } from '$app/components/forms';
import { useNavigationTopRightElement } from '$app/components/layouts/common/hooks';
import { docuCompanyAccountDetailsAtom } from '$app/pages/documents/Document';
import { useAtomValue } from 'jotai';
import { get, set } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Company } from '$app/common/interfaces/docuninja/api';
import { TimezoneSelector } from '$app/components/TimezoneSelector';
import { CurrencySelector } from '$app/components/CurrencySelector';
import { LanguageSelector } from '$app/components/LanguageSelector';
import { useSyncDocuninjaCompany } from './common/hooks/useSyncDocuninjaCompany';

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

  const { handleSync } = useSyncDocuninjaCompany({
    isFormBusy,
    setErrors,
    setIsFormBusy,
  });

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
        <Button
          behavior="button"
          onClick={handleSync}
          disabled={isFormBusy || !currentDetails}
          disableWithoutIcon
        >
          {t('sync')}
        </Button>
      ),
    },
    [isFormBusy, currentDetails]
  );

  return (
    <div className="pt-4 pb-4">
      <Element leftSide={t('company_name')}>
        <InputField
          value={currentDetails?.name}
          errorMessage={errors?.errors.name}
          readOnly
        />
      </Element>

      <Element leftSide={t('address1')}>
        <InputField
          value={currentDetails?.address1}
          errorMessage={errors?.errors.address1}
          readOnly
        />
      </Element>

      <Element leftSide={t('address2')}>
        <InputField
          value={currentDetails?.address2}
          errorMessage={errors?.errors.address2}
          readOnly
        />
      </Element>

      <Element leftSide={t('city')}>
        <InputField
          value={currentDetails?.city}
          errorMessage={errors?.errors.city}
          readOnly
        />
      </Element>

      <Element leftSide={t('state')}>
        <InputField
          value={currentDetails?.state}
          errorMessage={errors?.errors.state}
          readOnly
        />
      </Element>

      <Element leftSide={t('postal_code')}>
        <InputField
          value={currentDetails?.postal_code}
          errorMessage={errors?.errors.postal_code}
          readOnly
        />
      </Element>

      <Element leftSide={t('country')}>
        <CountrySelector
          value={String(currentDetails?.country_id) || ''}
          errorMessage={errors?.errors.country_id}
          dismissable={false}
          withBlank
          readOnly
        />
      </Element>

      <Element leftSide={t('currency')}>
        <CurrencySelector
          value={String(currentDetails?.currency_id) || ''}
          errorMessage={errors?.errors.currency_id}
          dismissable={false}
          withBlank
          readOnly
        />
      </Element>

      <Element leftSide={t('language')}>
        <LanguageSelector
          value={String(currentDetails?.language_id) || ''}
          errorMessage={errors?.errors.language_id}
          dismissable={false}
          withBlank
          readOnly
        />
      </Element>

      <Element leftSide={t('time_zone')}>
        <TimezoneSelector
          value={String(currentDetails?.timezone_id) || ''}
          errorMessage={errors?.errors.timezone_id}
          dismissable={false}
          withBlank
          readOnly
        />
      </Element>

      <Element leftSide={t('website')}>
        <InputField
          value={currentDetails?.website}
          errorMessage={errors?.errors.website}
          readOnly
        />
      </Element>
    </div>
  );
}
