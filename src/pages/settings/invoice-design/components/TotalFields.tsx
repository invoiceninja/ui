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

export function TotalFields() {
  const [t] = useTranslation();

  const options = [
    { value: '$subtotal', label: t('subtotal') },
    { value: '$net_subtotal', label: t('net_subtotal') },
    { value: '$discount', label: t('discount') },
    { value: '$line_taxes', label: t('line_taxes') },
    { value: '$total_taxes', label: t('total_taxes') },
    { value: '$custom_surcharge1', label: t('custom_surcharge1') },
    { value: '$custom_surcharge2', label: t('custom_surcharge2') },
    { value: '$custom_surcharge3', label: t('custom_surcharge3') },
    { value: '$custom_surcharge4', label: t('custom_surcharge4') },
    { value: '$paid_to_date', label: t('paid_to_date') },
    { value: '$total', label: t('total') },
    { value: '$outstanding', label: t('outstanding') },
  ];

  return (
    <Card title={t('total_fields')}>
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
