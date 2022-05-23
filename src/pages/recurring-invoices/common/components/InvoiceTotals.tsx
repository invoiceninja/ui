/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { TaxRate } from 'common/interfaces/tax-rate';
import { Record } from 'components/forms/DebouncedCombobox';
import { TaxRateSelector } from 'components/tax-rates/TaxRateSelector';
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
          <TaxRateSelector
            defaultValue={recurringInvoice?.tax_rate1}
            onChange={(value: Record<TaxRate>) => {
              handleChange('tax_name1', value.resource?.name);
              handleChange('tax_rate1', value.resource?.rate);
            }}
            clearButton={Boolean(recurringInvoice?.tax_rate1)}
            onClearButtonClick={() => {
              handleChange('tax_name1', '');
              handleChange('tax_rate1', 0);
            }}
          />
        </Element>
      )}

      {company && company.enabled_tax_rates > 1 && (
        <Element leftSide={t('tax')}>
          <TaxRateSelector
            defaultValue={recurringInvoice?.tax_rate2}
            onChange={(value: Record<TaxRate>) => {
              handleChange('tax_name2', value.resource?.name);
              handleChange('tax_rate2', value.resource?.rate);
            }}
            clearButton={Boolean(recurringInvoice?.tax_rate2)}
            onClearButtonClick={() => {
              handleChange('tax_name2', '');
              handleChange('tax_rate2', 0);
            }}
          />
        </Element>
      )}

      {company && company.enabled_tax_rates > 2 && (
        <Element leftSide={t('tax')}>
          <TaxRateSelector
            defaultValue={recurringInvoice?.tax_rate3}
            onChange={(value: Record<TaxRate>) => {
              handleChange('tax_name3', value.resource?.name);
              handleChange('tax_rate3', value.resource?.rate);
            }}
            clearButton={Boolean(recurringInvoice?.tax_rate3)}
            onClearButtonClick={() => {
              handleChange('tax_name3', '');
              handleChange('tax_rate3', 0);
            }}
          />
        </Element>
      )}
    </Card>
  );
}
