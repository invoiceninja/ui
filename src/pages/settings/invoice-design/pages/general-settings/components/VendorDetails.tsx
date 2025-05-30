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
import { useColorScheme } from '$app/common/colors';
import { Office } from '$app/components/icons/Office';

export default function VendorDetails() {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const customField = useCustomField();

  const defaultVariables = [
    { value: '$vendor.name', label: t('vendor_name') },
    { value: '$vendor.number', label: t('number') },
    { value: '$vendor.id_number', label: t('id_number') },
    { value: '$vendor.vat_number', label: t('vat_number') },
    { value: '$vendor.website', label: t('website') },
    { value: '$vendor.phone', label: t('phone') },
    { value: '$vendor.address1', label: t('address1') },
    { value: '$vendor.address2', label: t('address2') },
    { value: '$vendor.city_state_postal', label: t('city_state_postal') },
    { value: '$vendor.country', label: t('country') },
    {
      value: '$vendor.custom1',
      label: customField('vendor1').label() || t('custom1'),
    },
    {
      value: '$vendor.custom2',
      label: customField('vendor2').label() || t('custom2'),
    },
    {
      value: '$vendor.custom3',
      label: customField('vendor3').label() || t('custom3'),
    },
    {
      value: '$vendor.custom4',
      label: customField('vendor4').label() || t('custom4'),
    },

    { value: '$contact.full_name', label: t('contact_full_name') },
    { value: '$contact.email', label: t('contact_email') },
    { value: '$contact.phone', label: t('contact_phone') },
    { value: '$contact.custom1', label: t('contact_custom_value1') },
    { value: '$contact.custom2', label: t('contact_custom_value2') },
    { value: '$contact.custom3', label: t('contact_custom_value3') },
    { value: '$contact.custom4', label: t('contact_custom_value4') },
  ];

  return (
    <Card
      title={
        <div className="flex items-center space-x-2">
          <div>
            <Office color="#2176FF" size="1.3rem" />
          </div>

          <span>{t('vendor_details')}</span>
        </div>
      }
      padding="small"
      className="shadow-sm"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
    >
      <SortableVariableList
        for="vendor_details"
        defaultVariables={defaultVariables}
      />
    </Card>
  );
}
