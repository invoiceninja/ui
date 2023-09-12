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
import { Client } from '$app/common/interfaces/client';
import { updateChanges } from '$app/common/stores/slices/company-users';
import { setActiveSettings } from '$app/common/stores/slices/settings';
import { useSetAtom } from 'jotai';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

interface Params {
  withoutNavigation: boolean;
}

export function useConfigureClientSettings(params?: Params) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { withoutNavigation } = params || {};

  const setActiveSettingsAtom = useSetAtom(activeSettingsAtom);

  return (client: Client) => {
    setActiveSettingsAtom(client);

    dispatch(
      updateChanges({
        object: 'company',
        property: 'settings',
        value: client.settings,
      })
    );

    dispatch(
      setActiveSettings({
        status: {
          name: client.display_name,
          level: 'group',
        },
      })
    );

    !withoutNavigation && navigate('/settings/company_details');
  };
}
