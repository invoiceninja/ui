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

    const updatedClientSettings = {
      currency_id: '1',
      custom_value1: '',
      custom_value2: '',
      custom_value3: '',
      custom_value4: '',
      invoice_terms: '',
      quote_terms: '',
      quote_footer: '',
      credit_terms: '',
      credit_footer: '',
      invoice_footer: '',
      name: '',
      website: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      postal_code: '',
      phone: '',
      email: '',
      vat_number: '',
      id_number: '',
      purchase_order_terms: '',
      purchase_order_footer: '',
      qr_iban: '',
      besr_id: '',
      ...client.settings,
    };

    delete updatedClientSettings[
      'entity' as keyof typeof updatedClientSettings
    ];

    delete updatedClientSettings[
      'industry_id' as keyof typeof updatedClientSettings
    ];

    delete updatedClientSettings[
      'size_id' as keyof typeof updatedClientSettings
    ];

    dispatch(
      updateChanges({
        object: 'company',
        property: 'settings',
        value: updatedClientSettings,
      })
    );

    dispatch(
      setActiveSettings({
        status: {
          name: client.display_name,
          level: 'client',
        },
      })
    );

    !withoutNavigation && navigate('/settings/company_details');
  };
}
