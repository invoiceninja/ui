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
import { CustomField } from 'components/CustomField';
import { DebouncedCombobox } from 'components/forms/DebouncedCombobox';
import { useSetCurrentInvoiceProperty } from 'pages/invoices/common/hooks/useSetCurrentInvoiceProperty';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useFormatMoney } from '../hooks/useFormatMoney';

export function InvoiceTotals() {
  const [t] = useTranslation();
  const invoice = useCurrentInvoice();
  const company = useCurrentCompany();
  const formatMoney = useFormatMoney();
  const navigate = useNavigate();

  const handleChange = useSetCurrentInvoiceProperty();

  return (
    <Card className="col-span-12 xl:col-span-4 h-max">
      <Element leftSide={t('subtotal')} pushContentToRight>
        {formatMoney(invoice?.amount || 0)}
      </Element>

      <Element leftSide={t('balance_due')} pushContentToRight>
        {formatMoney(invoice?.balance || 0)}
      </Element>

      {invoice && company?.custom_fields?.surcharge1 && (
        <CustomField
          field="surcharge1"
          defaultValue={invoice?.custom_surcharge1 || ''}
          value={company.custom_fields.surcharge1}
          onChange={(value) => handleChange('custom_surcharge1', value)}
        />
      )}

      {invoice && company?.custom_fields?.surcharge2 && (
        <CustomField
          field="surcharge2"
          defaultValue={invoice?.custom_surcharge2 || ''}
          value={company.custom_fields.surcharge2}
          onChange={(value) => handleChange('custom_surcharge2', value)}
        />
      )}

      {invoice && company?.custom_fields?.surcharge3 && (
        <CustomField
          field="surcharge3"
          defaultValue={invoice?.custom_surcharge3 || ''}
          value={company.custom_fields.surcharge3}
          onChange={(value) => handleChange('custom_surcharge3', value)}
        />
      )}

      {invoice && company?.custom_fields?.surcharge4 && (
        <CustomField
          field="surcharge4"
          defaultValue={invoice?.custom_surcharge4 || ''}
          value={company.custom_fields.surcharge4}
          onChange={(value) => handleChange('custom_surcharge4', value)}
        />
      )}

      {company?.enabled_tax_rates > 0 && (
        <Element leftSide={t('tax')}>
          <DebouncedCombobox
            endpoint="/api/v1/tax_rates"
            label="name"
            value="rate"
            formatLabel={(resource) => `${resource.rate}% ${resource.name}`}
            onChange={(value) => {
              handleChange('tax_rate1', value.value);
              handleChange('tax_name1', value.label);
            }}
            onActionClick={() => navigate('/settings/tax_rates/create')}
            actionLabel={t('new_tax_rate')}
            defaultValue={invoice?.tax_rate1}
          />
        </Element>
      )}

      {company?.enabled_tax_rates > 1 && (
        <Element leftSide={t('tax')}>
          <DebouncedCombobox
            endpoint="/api/v1/tax_rates"
            label="name"
            formatLabel={(resource) => `${resource.rate}% ${resource.name}`}
            onChange={(value) => {
              handleChange('tax_rate2', value.value);
              handleChange('tax_name2', value.label);
            }}
            onActionClick={() => navigate('/settings/tax_rates/create')}
            actionLabel={t('new_tax_rate')}
            defaultValue={invoice?.tax_rate2}
          />
        </Element>
      )}

      {company?.enabled_tax_rates > 2 && (
        <Element leftSide={t('tax')}>
          <DebouncedCombobox
            endpoint="/api/v1/tax_rates"
            label="name"
            formatLabel={(resource) => `${resource.rate}% ${resource.name}`}
            onChange={(value) => {
              handleChange('tax_rate3', value.value);
              handleChange('tax_name3', value.label);
            }}
            onActionClick={() => navigate('/settings/tax_rates/create')}
            actionLabel={t('new_tax_rate')}
            defaultValue={invoice?.tax_rate3}
          />
        </Element>
      )}
    </Card>
  );
}
