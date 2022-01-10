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

export function CreditDetails() {
  const [t] = useTranslation();

  const options = [
    { value: '$credit.number', label: t('credit_number') },
    { value: '$credit.po_number', label: t('po_number') },
    { value: '$credit.date', label: t('credit_date') },
    { value: '$credit.valid_until', label: t('valid_until') },
    { value: '$credit.total', label: t('credit_total') },
    { value: '$credit.custom1', label: t('custom1') },
    { value: '$credit.custom2', label: t('custom2') },
    { value: '$credit.custom3', label: t('custom3') },
    { value: '$credit.custom4', label: t('custom4') },
    { value: '$client.balance', label: t('client_balance') },
  ];

  return (
    <Card title={t('credit_details')}>
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
