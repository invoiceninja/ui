/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { GroupSettings } from '$app/common/interfaces/group-settings';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Dispatch, SetStateAction } from 'react';

interface Params {
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  setGroupSettings: Dispatch<SetStateAction<GroupSettings | undefined>>;
  isCreatePage?: boolean;
}

export const blankGroupSettings: GroupSettings = {
  id: '',
  name: '',
  settings: {},
  created_at: 0,
  updated_at: 0,
  archived_at: 0,
  is_deleted: false,
  documents: [],
};

export function useHandleChange(params: Params) {
  const { setGroupSettings, setErrors, isCreatePage } = params;

  return (
    property: keyof GroupSettings,
    value: GroupSettings[keyof GroupSettings]
  ) => {
    setErrors(undefined);

    if (isCreatePage) {
      setGroupSettings({
        ...blankGroupSettings,
        [property]: value,
      });
    } else {
      setGroupSettings(
        (currentGroupSettings) =>
          currentGroupSettings && { ...currentGroupSettings, [property]: value }
      );
    }
  };
}
