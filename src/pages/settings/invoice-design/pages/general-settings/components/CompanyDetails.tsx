/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '$app/components/cards';
import { useTranslation } from 'react-i18next';
import { SortableVariableList } from './SortableVariableList';
import { useCustomField } from '$app/components/CustomField';

export default function CompanyDetails() {
  const [t] = useTranslation();
  const customField = useCustomField();

  const defaultVariables = [
    { value: '$company.name', label: t('company_name') },
    { value: '$company.id_number', label: t('id_number') },
    { value: '$company.vat_number', label: t('vat_number') },
    { value: '$company.website', label: t('website') },
    { value: '$company.email', label: t('email') },
    { value: '$company.phone', label: t('phone') },
    { value: '$company.address1', label: t('address1') },
    { value: '$company.address2', label: t('address2') },
    { value: '$company.city_state_postal', label: t('city_state_postal') },
    { value: '$company.postal_city_state', label: t('postal_city_state') },
    {
      value: '$company.custom1',
      label: customField('company1').label() || t('custom1'),
    },
    {
      value: '$company.custom2',
      label: customField('company2').label() || t('custom2'),
    },
    {
      value: '$company.custom3',
      label: customField('company3').label() || t('custom3'),
    },
    {
      value: '$company.custom4',
      label: customField('company4').label() || t('custom4'),
    },
  ];

  return (
    <Card title={t('company_details')} padding="small">
      <SortableVariableList
        for="company_details"
        defaultVariables={defaultVariables}
      />
    </Card>
  );
}
