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

const BASE_FIELDS = [
  { id: 'name', label: 'Client Name', variable: '$client.name' },
  { id: 'number', label: 'Client Number', variable: '$client.number' },
  { id: 'address1', label: 'Address Line 1', variable: '$client.address1' },
  { id: 'address2', label: 'Address Line 2', variable: '$client.address2' },
  {
    id: 'city_state_postal',
    label: 'City, State, Postal',
    variable: '$client.city_state_postal',
  },
  { id: 'country', label: 'Country', variable: '$client.country' },
  { id: 'phone', label: 'Phone', variable: '$client.phone' },
  { id: 'email', label: 'Email', variable: '$client.email' },
  { id: 'vat_number', label: 'VAT Number', variable: '$client.vat_number' },
  { id: 'id_number', label: 'ID Number', variable: '$client.id_number' },
];

export function ClientInfoBlockProperties({
  block,
  onChange,
}: PropertyEditorProps) {
  const [t] = useTranslation();
  const customField = useCustomField();

  const availableFields = useMemo(() => {
    const customFieldConfigs: Array<{
      key: 'client1' | 'client2' | 'client3' | 'client4';
      id: string;
      variable: string;
      fallback: string;
    }> = [
      {
        key: 'client1',
        id: 'custom_value1',
        variable: '$client.custom_value1',
        fallback: t('custom_field_1'),
      },
      {
        key: 'client2',
        id: 'custom_value2',
        variable: '$client.custom_value2',
        fallback: t('custom_field_2'),
      },
      {
        key: 'client3',
        id: 'custom_value3',
        variable: '$client.custom_value3',
        fallback: t('custom_field_3'),
      },
      {
        key: 'client4',
        id: 'custom_value4',
        variable: '$client.custom_value4',
        fallback: t('custom_field_4'),
      },
    ];

    const customFields = customFieldConfigs
      .filter(({ key }) => customField(key).label()) // Only include if custom field has a label configured
      .map(({ key, id, variable, fallback }) => {
        const label = customField(key).label();
        return {
          id,
          label: label || fallback,
          variable,
        };
      });

    return [...BASE_FIELDS, ...customFields];
  }, [customField, t]);

  return (
    <InfoBlockProperties
      block={block}
      onChange={onChange}
      availableFields={availableFields}
      title={String(t('client_info'))}
      showTitleOption
    />
  );
}
