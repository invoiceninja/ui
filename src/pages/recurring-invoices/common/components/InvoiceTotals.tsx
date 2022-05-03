/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { TaxRate } from 'common/interfaces/tax-rate';
import { DebouncedCombobox, Record } from 'components/forms/DebouncedCombobox';
import { useTotalVariables } from 'pages/invoices/common/hooks/useTotalVariables';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrentRecurringInvoice } from '../hooks/useCurrentRecurringInvoice';
import { useResolveTotalVariable } from '../hooks/useResolveTotalVariable';
import { useSetCurrentRecurringInvoiceProperty } from '../hooks/useSetCurrentRecurringInvoiceProperty';

export function InvoiceTotals() {
  const variables = useTotalVariables();
  const resolveVariable = useResolveTotalVariable();
  const company = useCurrentCompany();
  const handleChange = useSetCurrentRecurringInvoiceProperty();
  const recurringInvoice = useCurrentRecurringInvoice();

  const [t] = useTranslation();

  return (
    <Card className="col-span-12 xl:col-span-4 h-max">
      {variables.map((variable, index) => (
        <Fragment key={index}>{resolveVariable(variable)}</Fragment>
      ))}

      {company && company.enabled_tax_rates > 0 && (
        <Element leftSide={t('tax')}>
          <DebouncedCombobox
            endpoint="/api/v1/tax_rates"
            label={t('tax')}
            formatLabel={(resource) => `${resource.name} ${resource.rate}%`}
            onChange={(value: Record<TaxRate>) => {
              handleChange('tax_name1', value.resource?.name);
              handleChange('tax_rate1', value.resource?.rate);
            }}
            value="rate"
            defaultValue={recurringInvoice?.tax_rate1}
          />
        </Element>
      )}

      {company && company.enabled_tax_rates > 1 && (
        <Element leftSide={t('tax')}>
          <DebouncedCombobox
            endpoint="/api/v1/tax_rates"
            label={t('tax')}
            formatLabel={(resource) => `${resource.name} ${resource.rate}%`}
            onChange={(value: Record<TaxRate>) => {
              handleChange('tax_name2', value.resource?.name);
              handleChange('tax_rate2', value.resource?.rate);
            }}
            value="rate"
            defaultValue={recurringInvoice?.tax_rate2}
          />
        </Element>
      )}

      {company && company.enabled_tax_rates > 2 && (
        <Element leftSide={t('tax')}>
          <DebouncedCombobox
            endpoint="/api/v1/tax_rates"
            label={t('tax')}
            formatLabel={(resource) => `${resource.name} ${resource.rate}%`}
            onChange={(value: Record<TaxRate>) => {
              handleChange('tax_name3', value.resource?.name);
              handleChange('tax_rate3', value.resource?.rate);
            }}
            value="rate"
            defaultValue={recurringInvoice?.tax_rate3}
          />
        </Element>
      )}
    </Card>
  );
}
