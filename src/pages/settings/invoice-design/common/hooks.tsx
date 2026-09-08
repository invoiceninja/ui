/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useDispatch } from 'react-redux';
import { Settings } from '$app/common/interfaces/company.interface';
import { updateChanges } from '$app/common/stores/slices/company-users';

export function useHandleSettingsValueChange() {
  const dispatch = useDispatch();

  return <T extends keyof Settings, R extends Settings[T]>(
    property: T,
    value: R
  ) => {
    dispatch(
      updateChanges({
        object: 'company',
        property: `settings.${property}`,
        value,
      })
    );
  };
}
