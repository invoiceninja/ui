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
  { id: 'name', label: 'Company Name', variable: '$company.name' },
  { id: 'address1', label: 'Address Line 1', variable: '$company.address1' },
  { id: 'address2', label: 'Address Line 2', variable: '$company.address2' },
  {
    id: 'city_state_postal',
    label: 'City, State, Postal',
    variable: '$company.city_state_postal',
  },
  { id: 'country', label: 'Country', variable: '$company.country' },
  { id: 'phone', label: 'Phone', variable: '$company.phone' },
  { id: 'email', label: 'Email', variable: '$company.email' },
  { id: 'website', label: 'Website', variable: '$company.website' },
  { id: 'vat_number', label: 'VAT Number', variable: '$company.vat_number' },
  { id: 'id_number', label: 'ID Number', variable: '$company.id_number' },
];

export function CompanyInfoBlockProperties({
  block,
  onChange,
}: PropertyEditorProps) {
  const [t] = useTranslation();

  return (
    <InfoBlockProperties
      block={block}
      onChange={onChange}
      availableFields={AVAILABLE_FIELDS}
      title={String(t('company_info'))}
    />
  );
}
