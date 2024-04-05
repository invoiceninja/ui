/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { useCustomField } from '$app/components/CustomField';
import { Card } from '$app/components/cards';
import { useTranslation } from 'react-i18next';
import { SortableVariableList } from './SortableVariableList';

export default function ProductQuoteColumns() {
  const [t] = useTranslation();
  const customField = useCustomField();

  const defaultVariables = [
    {
      value: '$product.product1',
      label: customField('product1').label() || t('custom1'),
    },
    {
      value: '$product.product2',
      label: customField('product2').label() || t('custom2'),
    },
    {
      value: '$product.product3',
      label: customField('product3').label() || t('custom3'),
    },
    {
      value: '$product.product4',
      label: customField('product3').label() || t('custom4'),
    },
    { value: '$product.description', label: t('description') },
    { value: '$product.gross_line_total', label: t('gross_line_total') },
    { value: '$product.item', label: t('item') },
    { value: '$product.line_total', label: t('line_total') },
    { value: '$product.quantity', label: t('quantity') },
    { value: '$product.unit_cost', label: t('unit_cost') },
    { value: '$product.discount', label: t('discount') },
    { value: '$product.tax', label: t('tax') },
  ];

  const company = useCompanyChanges();

  return (
    <>
      {!company?.settings.sync_invoice_quote_columns && (
        <Card title={t('quote_product_columns')} padding="small">
          <SortableVariableList
            for="product_quote_columns"
            defaultVariables={defaultVariables}
          />
        </Card>
      )}
    </>
  );
}
