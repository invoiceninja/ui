/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { SelectField } from '@invoiceninja/forms';
import { useTranslation } from 'react-i18next';

export function ClientDetails() {
  const [t] = useTranslation();

  const options = [
    { value: '$client.name', label: t('client_name') },
    { value: '$client.number', label: t('client_number') },
    { value: '$client.id_number', label: t('id_number') },
    { value: '$client.vat_number', label: t('vat_number') },
    { value: '$client.website', label: t('website') },
    { value: '$client.phone', label: t('phone') },
    { value: '$client.address1', label: t('address1') },
    { value: '$client.address2', label: t('address2') },
    { value: '$client.city_state_postal', label: t('city_state_postal') },
    { value: '$client.postal_city_state', label: t('postal_city_state') },
    { value: '$client.country', label: t('country') },
    { value: '$client.custom1', label: t('custom1') },
    { value: '$client.custom2', label: t('custom2') },
    { value: '$client.custom3', label: t('custom3') },
    { value: '$client.custom4', label: t('custom4') },

    { value: '$contact.full_name', label: t('contact_full_name') },
    { value: '$contact.email', label: t('contact_email') },
    { value: '$contact.phone', label: t('contact_phone') },
    { value: '$contact.custom1', label: t('contact_custom_value1') },
    { value: '$contact.custom2', label: t('contact_custom_value2') },
    { value: '$contact.custom3', label: t('contact_custom_value3') },
    { value: '$contact.custom4', label: t('contact_custom_value4') },
  ];

  return (
    <Card title={t('client_details')}>
      <Element leftSide={t('fields')}>
        <SelectField>
          <option></option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
      </Element>
    </Card>
  );
}
