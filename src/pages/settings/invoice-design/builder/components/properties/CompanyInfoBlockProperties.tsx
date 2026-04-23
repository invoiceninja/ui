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

export function CompanyInfoBlockProperties({
  block,
  onChange,
}: PropertyEditorProps) {
  const [t] = useTranslation();
  const customField = useCustomField();

  const availableFields = useMemo(() => {
    const baseFields = [
      { id: 'name', label: t('company_name'), variable: '$company.name' },
      {
        id: 'address1',
        label: t('address1'),
        variable: '$company.address1',
      },
      {
        id: 'address2',
        label: t('address2'),
        variable: '$company.address2',
      },
      {
        id: 'city_state_postal',
        label: t('city_state_postal'),
        variable: '$company.city_state_postal',
      },
      { id: 'country', label: t('country'), variable: '$company.country' },
      { id: 'phone', label: t('phone'), variable: '$company.phone' },
      { id: 'email', label: t('email'), variable: '$company.email' },
      { id: 'website', label: t('website'), variable: '$company.website' },
      {
        id: 'vat_number',
        label: t('vat_number'),
        variable: '$company.vat_number',
      },
      {
        id: 'id_number',
        label: t('id_number'),
        variable: '$company.id_number',
      },
    ];

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
        fallback: t('custom_field') + ' 1',
      },
      {
        key: 'company2',
        id: 'custom_value2',
        variable: '$company.custom_value2',
        fallback: t('custom_field') + ' 2',
      },
      {
        key: 'company3',
        id: 'custom_value3',
        variable: '$company.custom_value3',
        fallback: t('custom_field') + ' 3',
      },
      {
        key: 'company4',
        id: 'custom_value4',
        variable: '$company.custom_value4',
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
      title={String(t('company_details'))}
      showTitleOption
    />
  );
}
