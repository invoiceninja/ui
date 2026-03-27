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
import { PropertyEditorProps } from '../../types';
import { InfoBlockProperties } from './InfoBlockProperties';

const AVAILABLE_FIELDS = [
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
  {
    id: 'custom_value1',
    label: 'Custom Field 1',
    variable: '$client.custom_value1',
  },
  {
    id: 'custom_value2',
    label: 'Custom Field 2',
    variable: '$client.custom_value2',
  },
];

export function ClientInfoBlockProperties({
  block,
  onChange,
}: PropertyEditorProps) {
  const [t] = useTranslation();

  return (
    <InfoBlockProperties
      block={block}
      onChange={onChange}
      availableFields={AVAILABLE_FIELDS}
      title={String(t('client_info'))}
    />
  );
}
