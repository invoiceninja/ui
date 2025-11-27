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
import { useColorScheme } from '$app/common/colors';
import { Files } from '$app/components/icons/Files';
import { useEffect } from 'react';
import { cloneDeep, set } from 'lodash';
import { injectInChanges } from '$app/common/stores/slices/company-users';
import { useDispatch } from 'react-redux';

export default function ProductQuoteColumns() {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const company = useCompanyChanges();

  const dispatch = useDispatch();
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

  useEffect(() => {
    if (
      company?.settings.pdf_variables?.['product_columns'] &&
      !company?.settings.pdf_variables?.['product_quote_columns']
    ) {
      const companyClone = cloneDeep(company);

      set(
        companyClone,
        `settings.pdf_variables.product_quote_columns`,
        companyClone?.settings.pdf_variables?.['product_columns']
      );

      dispatch(injectInChanges({ object: 'company', data: companyClone }));
    }
  }, [company]);

  return (
    <>
      {!company?.settings.sync_invoice_quote_columns && (
        <Card
          title={
            <div className="flex items-center space-x-2">
              <div>
                <Files color="#2176FF" size="1.3rem" />
              </div>

              <span>{t('quote_product_columns')}</span>
            </div>
          }
          padding="small"
          className="shadow-sm"
          style={{ borderColor: colors.$24 }}
          headerStyle={{ borderColor: colors.$20 }}
        >
          <SortableVariableList
            for="product_quote_columns"
            defaultVariables={defaultVariables}
          />
        </Card>
      )}
    </>
  );
}
