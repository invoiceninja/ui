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
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { docuCompanyAccountDetailsAtom } from '$app/pages/documents/Document';
import { Button } from '$app/components/forms';
import { Element } from '$app/components/cards';
import { useLogo } from '$app/common/hooks/useLogo';
import { useNavigationTopRightElement } from '$app/components/layouts/common/hooks';
import { useSyncDocuninjaCompany } from '../company-details/common/hooks/useSyncDocuninjaCompany';
import { ErrorMessage } from '$app/components/ErrorMessage';
import { ValidationBag } from '$app/common/interfaces/validation-bag';

export default function Logo() {
  const [t] = useTranslation();

  const logo = useLogo();

  const docuCompanyAccountDetails = useAtomValue(docuCompanyAccountDetailsAtom);

  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const { handleSync } = useSyncDocuninjaCompany({
    isFormBusy,
    setErrors,
    setIsFormBusy,
  });

  useNavigationTopRightElement(
    {
      element: (
        <Button
          behavior="button"
          onClick={handleSync}
          disabled={isFormBusy}
          disableWithoutIcon
        >
          {t('sync')}
        </Button>
      ),
    },
    [isFormBusy]
  );

  return (
    <div className="flex flex-col space-y-5 px-4 sm:px-6 py-4">
      <Element leftSide={t('logo')}>
        <div className="grid grid-cols-12 gap-x-4">
          <div className="bg-gray-200 col-span-6 rounded-lg p-6">
            <img
              src={docuCompanyAccountDetails?.company?.logo || logo}
              alt={t('company_logo') as string}
            />
          </div>

          <div className="col-span-6 bg-gray-900 rounded-lg p-6">
            <img
              src={docuCompanyAccountDetails?.company?.logo || logo}
              alt={t('company_logo') as string}
            />
          </div>
        </div>

        <ErrorMessage>{errors?.errors.logo}</ErrorMessage>
      </Element>
    </div>
  );
}
