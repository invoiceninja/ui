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
import { useCurrentInvoice } from 'common/hooks/useCurrentInvoice';
import { TaxRate } from 'common/interfaces/tax-rate';
import { DebouncedCombobox, Record } from 'components/forms/DebouncedCombobox';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useResolveTotalVariable } from '../hooks/useResolveTotalVariable';
import { useSetCurrentInvoiceProperty } from '../hooks/useSetCurrentInvoiceProperty';
import { useTotalVariables } from '../hooks/useTotalVariables';
import { TaxCreate } from './TaxCreate';

export function InvoiceTotals() {
  const variables = useTotalVariables();
  const resolveVariable = useResolveTotalVariable();
  const company = useCurrentCompany();
  const handleChange = useSetCurrentInvoiceProperty();
  const [isCreateTaxModalOpen, setIsCreateTaxModalOpen] =
    useState<boolean>(false);
  const [t] = useTranslation();

  const invoice = useCurrentInvoice();

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
            formatLabel={(resource) => `${resource.name} (${resource.rate}%)`}
            onChange={(value: Record<TaxRate>) => {
              handleChange('tax_name1', value.resource?.name);
              handleChange('tax_rate1', value.resource?.rate);
            }}
            value="rate"
            actionLabel={t('create_tax_rate')}
            onActionClick={() => setIsCreateTaxModalOpen(true)}
            defaultValue={invoice?.tax_rate1}
            clearButton={Boolean(invoice?.tax_rate1)}
            onClearButtonClick={() => {
              handleChange('tax_name1', '');
              handleChange('tax_rate1', 0);
            }}
          />
        </Element>
      )}

      {company && company.enabled_tax_rates > 1 && (
        <Element leftSide={t('tax')}>
          <DebouncedCombobox
            endpoint="/api/v1/tax_rates"
            label={t('tax')}
            formatLabel={(resource) => `${resource.name} (${resource.rate}%)`}
            onChange={(value: Record<TaxRate>) => {
              handleChange('tax_name2', value.resource?.name);
              handleChange('tax_rate2', value.resource?.rate);
            }}
            actionLabel={t('create_tax_rate')}
            onActionClick={() => setIsCreateTaxModalOpen(true)}
            value="rate"
            defaultValue={invoice?.tax_rate2}
            clearButton={Boolean(invoice?.tax_rate2)}
            onClearButtonClick={() => {
              handleChange('tax_name2', '');
              handleChange('tax_rate2', 0);
            }}
          />
        </Element>
      )}

      {company && company.enabled_tax_rates > 2 && (
        <Element leftSide={t('tax')}>
          <DebouncedCombobox
            endpoint="/api/v1/tax_rates"
            label={t('tax')}
            formatLabel={(resource) => `${resource.name} (${resource.rate}%)`}
            onChange={(value: Record<TaxRate>) => {
              handleChange('tax_name3', value.resource?.name);
              handleChange('tax_rate3', value.resource?.rate);
            }}
            actionLabel={t('create_tax_rate')}
            onActionClick={() => setIsCreateTaxModalOpen(true)}
            value="rate"
            defaultValue={invoice?.tax_rate3}
            clearButton={Boolean(invoice?.tax_rate3)}
            onClearButtonClick={() => {
              handleChange('tax_name3', '');
              handleChange('tax_rate3', 0);
            }}
          />
        </Element>
      )}
      
      <TaxCreate
        isVisible={isCreateTaxModalOpen}
        onClose={setIsCreateTaxModalOpen}
      />
    </Card>
  );
}
