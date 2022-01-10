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

export function ProductColumns() {
  const [t] = useTranslation();

  const options = [
    { value: '$product.item', label: t('item') },
    { value: '$product.description', label: t('description') },
    { value: '$product.quantity', label: t('quantity') },
    { value: '$product.unit_cost', label: t('unit_cost') },
    { value: '$product.tax', label: t('tax') },
    { value: '$product.discount', label: t('discount') },
    { value: '$product.line_total', label: t('line_total') },
    { value: '$product.custom1', label: t('custom1') },
    { value: '$product.custom2', label: t('custom2') },
    { value: '$product.custom3', label: t('custom3') },
    { value: '$product.custom4', label: t('custom4') },
    { value: '$product.gross_line_total', label: t('gross_line_total') },
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
