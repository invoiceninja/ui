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
  const customField = useCustomField();

  const availableFields = useMemo(() => {
    const customFieldConfigs: Array<{
      key: 'company1' | 'company2' | 'company3' | 'company4';
      id: string;
      variable: string;
      fallback: string;
    }> = [
      {
        key: 'company1',
        id: 'custom_value1',
        variable: '$company.custom_value1',
        fallback: t('custom_field_1'),
      },
      {
        key: 'company2',
        id: 'custom_value2',
        variable: '$company.custom_value2',
        fallback: t('custom_field_2'),
      },
      {
        key: 'company3',
        id: 'custom_value3',
        variable: '$company.custom_value3',
        fallback: t('custom_field_3'),
      },
      {
        key: 'company4',
        id: 'custom_value4',
        variable: '$company.custom_value4',
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
      title={String(t('company_info'))}
      showTitleOption
    />
  );
}
