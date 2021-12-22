/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Card, Element } from '../../../../components/cards';
import { Button, SelectField } from '../../../../components/forms';

export function CustomLabels() {
  const [t] = useTranslation();

  let defaultLabels = [
    { property: 'amount', translation: t('amount') },
    { property: 'address2', translation: t('address2') },
    { property: 'balance', translation: t('balance') },
    { property: 'country', translation: t('country') },
    { property: 'credit', translation: t('credit') },
    { property: 'credit_card', translation: t('credit_card') },
    { property: 'date', translation: t('date') },
    { property: 'description', translation: t('description') },
    { property: 'details', translation: t('details') },
    { property: 'discount', translation: t('discount') },
    { property: 'due_date', translation: t('due_date') },
    { property: 'email', translation: t('email') },
    { property: 'from', translation: t('from') },
    { property: 'hours', translation: t('hours') },
    { property: 'id_number', translation: t('id_number') },
    { property: 'invoice', translation: t('invoice') },
    { property: 'item', translation: t('item') },
    { property: 'line_total', translation: t('line_total') },
    { property: 'po_number', translation: t('po_number') },
    { property: 'paid_to_date', translation: t('paid_to_date') },
    { property: 'partial_due', translation: t('partial_due') },
    { property: 'payment_date', translation: t('payment_date') },
    { property: 'phone', translation: t('phone') },
    { property: 'quantity', translation: t('quantity') },
    { property: 'quote', translation: t('quote') },
    { property: 'rate', translation: t('rate') },
    { property: 'service', translation: t('service') },
    { property: 'statement', translation: t('statement') },
    { property: 'address1', translation: t('address1') },
    { property: 'subtotal', translation: t('subtotal') },
    { property: 'surcharge', translation: t('surcharge') },
    { property: 'tax', translation: t('tax') },
    { property: 'taxes', translation: t('taxes') },
    { property: 'terms', translation: t('terms') },
    { property: 'to', translation: t('to') },
    { property: 'total', translation: t('total') },
    { property: 'unit_cost', translation: t('unit_cost') },
    { property: 'vat_number', translation: t('vat_number') },
    { property: 'valid_until', translation: t('valid_until') },
    { property: 'website', translation: t('website') },
  ];

  return (
    <Card title={t('custom_labels')}>
      <Element
        leftSide={
          <SelectField>
            {defaultLabels.map((label) => (
              <option key={label.property} value={label.property}>
                {label.translation}
              </option>
            ))}
          </SelectField>
        }
      >
        <Button behavior="button" type="minimal">
          {t('add_custom')}
        </Button>
      </Element>
    </Card>
  );
}
