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
import { SortableVariableList } from './SortableVariableList';

export function CompanyDetails() {
  const [t] = useTranslation();

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
    { value: '$company.country', label: t('country') },
    { value: '$company.custom1', label: t('custom1') },
    { value: '$company.custom2', label: t('custom2') },
    { value: '$company.custom3', label: t('custom3') },
    { value: '$company.custom4', label: t('custom4') },
  ];

  return (
    <SortableVariableList
      for="company_details"
      defaultVariables={defaultVariables}
    />
  );
}
