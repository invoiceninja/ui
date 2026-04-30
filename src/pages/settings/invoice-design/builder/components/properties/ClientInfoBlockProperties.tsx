/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { PropertyEditorProps } from '../../types';
import { InfoBlockProperties } from './InfoBlockProperties';
import { useCustomField } from '$app/components/CustomField';

export function ClientInfoBlockProperties({
  block,
  onChange,
}: PropertyEditorProps) {
  const [t] = useTranslation();
  const customField = useCustomField();

  const availableFields = useMemo(() => {
    const baseFields = [
      { id: 'name', label: t('client_name'), variable: '$client.name' },
      { id: 'number', label: t('client_number'), variable: '$client.number' },
      {
        id: 'address1',
        label: t('address1'),
        variable: '$client.address1',
      },
      {
        id: 'address2',
        label: t('address2'),
        variable: '$client.address2',
      },
      {
        id: 'city_state_postal',
        label: t('city_state_postal'),
        variable: '$client.city_state_postal',
      },
      {
        id: 'postal_city_state',
        label: t('postal_city_state'),
        variable: '$client.postal_city_state',
      },
      { id: 'location_name', label: t('location_name'), variable: '$client.location_name' },
      {
        id: 'location_address1',
        label: t('location_name') + ' - ' + t('address1'),
        variable: '$location.address1',
      },
      {
        id: 'location_address2',
        label: t('location_name') + ' - ' + t('address2'),
        variable: '$location.address2',
      },
      {
        id: 'location_city',
        label: t('location_name') + ' - ' + t('city'),
        variable: '$location.city',
      },
      {
        id: 'location_state',
        label: t('location_name') + ' - ' + t('state'),
        variable: '$location.state',
      },
      {
        id: 'location_postal_code',
        label: t('location_name') + ' - ' + t('postal_code'),
        variable: '$location.postal_code',
      },
      {
        id: 'location_country',
        label: t('location_name') + ' - ' + t('country'),
        variable: '$location.country',
      },
      { id: 'country', label: t('country'), variable: '$client.country' },
      { id: 'phone', label: t('phone'), variable: '$client.phone' },
      { id: 'email', label: t('email'), variable: '$client.email' },
      {
        id: 'vat_number',
        label: t('vat_number'),
        variable: '$client.vat_number',
      },
      { id: 'id_number', label: t('id_number'), variable: '$client.id_number' },

      { id: 'contact.email', label: t('contact_email'), variable: '$contact.email' },
      { id: 'contact_full_name', label: t('contact_full_name'), variable: '$contact.full_name' },
      { id: 'contact_phone', label: t('contact_phone'), variable: '$contact.phone' },

    ];

    const customFieldConfigs: Array<{
      key: 'client1' | 'client2' | 'client3' | 'client4' | 'contact1' | 'contact2' | 'contact3' | 'contact4' | 'location1' | 'location2' | 'location3' | 'location4';
      id: string;
      variable: string;
      fallback: string;
    }> = [
      {
        key: 'client1',
        id: 'client1',
        variable: '$client.custom1',
        fallback: t('custom_field') + ' 1',
      },
      {
        key: 'client2',
        id: 'client2',
        variable: '$client.custom2',
        fallback: t('custom_field') + ' 2',
      },
      {
        key: 'client3',
        id: 'client3',
        variable: '$client.custom3',
        fallback: t('custom_field') + ' 3',
      },
      {
        key: 'client4',
        id: 'client4',
        variable: '$client.custom4',
        fallback: t('custom_field') + ' 4',
      },
      {
        key: 'contact1',
        id: 'contact1',
        variable: '$contact.custom1',
        fallback: t('custom_field') + ' 1',
      },
      {
        key: 'contact2',
        id: 'contact2',
        variable: '$contact.custom2',
        fallback: t('custom_field') + ' 2',
      },
      {
        key: 'contact3',
        id: 'contact3',
        variable: '$contact.custom3',
        fallback: t('custom_field') + ' 3',
      },
      {
        key: 'contact4',
        id: 'contact4',
        variable: '$contact.custom4',
        fallback: t('custom_field') + ' 4',
      },
      {
        key: 'location1',
        id: 'location1',
        variable: '$location.custom1',
        fallback: t('custom_field') + ' 1',
      },
      {
        key: 'location2',
        id: 'location2',
        variable: '$location.custom2',
        fallback: t('custom_field') + ' 2',
      },
      {
        key: 'location3',
        id: 'location3',
        variable: '$location.custom3',
        fallback: t('custom_field') + ' 3',
      },
      {
        key: 'location4',
        id: 'location4',
        variable: '$location.custom4',
        fallback: t('custom_field') + ' 4',
      },
    ];

    const customFields = customFieldConfigs
      .filter(({ key }) => customField(key).label())
      .map(({ key, id, variable, fallback }) => {
        const label = customField(key).label();
        return {
          id,
          label: label || fallback,
          variable,
        };
      });

    return [...baseFields, ...customFields];
  }, [customField, t]);

  return (
    <InfoBlockProperties
      block={block}
      onChange={onChange}
      availableFields={availableFields}
      title={String(t('client_details'))}
      showTitleOption
    />
  );
}
