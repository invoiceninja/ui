/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Action } from '$app/components/ResourceActions';
import { useTranslation } from 'react-i18next';
import { MdSync } from 'react-icons/md';
import { Company } from '$app/common/interfaces/docuninja/api';
import { useSyncDocuninjaCompany } from './useSyncDocuninjaCompany';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Dispatch, SetStateAction } from 'react';

interface Params {
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  setIsFormBusy: Dispatch<SetStateAction<boolean>>;
  isFormBusy: boolean;
}

export function useActions({ setErrors, setIsFormBusy, isFormBusy }: Params) {
  const [t] = useTranslation();

  const { handleSync } = useSyncDocuninjaCompany({
    setErrors,
    setIsFormBusy,
    isFormBusy,
  });

  const actions: Action<Company>[] = [
    () => (
      <DropdownElement
        onClick={() => handleSync()}
        icon={<Icon element={MdSync} />}
        disabled={isFormBusy}
      >
        {t('sync')}
      </DropdownElement>
    ),
  ];

  return actions;
}
