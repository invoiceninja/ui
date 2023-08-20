/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { activeGroupSettingsAtom } from '$app/common/atoms/settings';
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import {
  resetChanges,
  updateChanges,
} from '$app/common/stores/slices/company-users';
import { useAtomValue } from 'jotai';
import { useDispatch } from 'react-redux';

export function useDiscardChanges() {
  const dispatch = useDispatch();
  const { isCompanySettingsActive, isGroupSettingsActive } =
    useCurrentSettingsLevel();

  const activeGroupSettings = useAtomValue(activeGroupSettingsAtom);

  return () => {
    if (isCompanySettingsActive) {
      dispatch(resetChanges('company'));
    }

    if (isGroupSettingsActive) {
      dispatch(
        updateChanges({
          object: 'company',
          property: 'settings',
          value: activeGroupSettings?.settings,
        })
      );
    }
  };
}
