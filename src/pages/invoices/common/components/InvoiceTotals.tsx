/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { TaxRate } from '$app/common/interfaces/tax-rate';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useResolveTotalVariable } from '../hooks/useResolveTotalVariable';
import { useTotalVariables } from '../hooks/useTotalVariables';
import { CustomSurchargeField } from '$app/components/CustomSurchargeField';
import { TaxRateSelector } from '$app/components/tax-rates/TaxRateSelector';
import { InvoiceSum } from '$app/common/helpers/invoices/invoice-sum';
import { ProductTableResource, RelationType } from './ProductsTable';
import { InvoiceSumInclusive } from '$app/common/helpers/invoices/invoice-sum-inclusive';
import { Entry } from '$app/components/forms/Combobox';
import { Link } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { MdWarning } from 'react-icons/md';
import reactStringReplace from 'react-string-replace';
import { getTaxRateComboValue } from '$app/common/helpers/tax-rates/tax-rates-combo';

interface Props {
  resource: ProductTableResource;
  invoiceSum?: InvoiceSum | InvoiceSumInclusive;
  relationType: RelationType;
  onChange: (property: keyof ProductTableResource, value: unknown) => unknown;
}

export function InvoiceTotals(props: Props) {
  const variables = useTotalVariables();
  const company = useCurrentCompany();
  const resource = props.resource;

  const resolveVariable = useResolveTotalVariable({
    resource,
    onChange: props.onChange,
    invoiceSum: props.invoiceSum,
    relationType: props.relationType,
  });

  const handleChange = (property: keyof ProductTableResource, value: unknown) =>
    props.onChange(property, value);

  const [t] = useTranslation();

  const isAnyTaxHidden = () => {
    if (
      company.enabled_tax_rates === 0 &&
      (resource?.tax_name1 || resource?.tax_name2 || resource?.tax_name3)
    ) {
      return true;
    }

    if (
      company.enabled_item_tax_rates === 0 &&
      resource?.line_items.some(
        ({ tax_name1, tax_name2, tax_name3 }) =>
          tax_name1 || tax_name2 || tax_name3
      )
    ) {
      return true;
    }

    return false;
  };

  return (
    <Card className="col-span-12 xl:col-span-4 h-max">
      {isAnyTaxHidden() && (
        <div className="flex items-center space-x-3 px-6">
          <div>
            <Icon element={MdWarning} size={20} color="orange" />
          </div>

          <div className="text-sm font-medium">
            {reactStringReplace(
              t('hidden_taxes_warning') as string,
              ':link',
              () => (
                <Link to="/settings/tax_settings">{t('settings')}</Link>
              )
            )}
          </div>
        </div>
      )}

      {variables.map(
        (variable, index) =>
          (variable === '$subtotal' || variable === '$taxes') && (
            <Fragment key={index}>{resolveVariable(variable)}</Fragment>
          )
      )}

      {company && company.enabled_tax_rates > 0 && (
        <Element leftSide={t('tax')}>
          <TaxRateSelector
            defaultValue={getTaxRateComboValue(resource, 'tax_name1')}
            onChange={(value: Entry<TaxRate>) => {
              handleChange('tax_name1', value.resource?.name);
              handleChange('tax_rate1', value.resource?.rate);
            }}
            onClearButtonClick={() => {
              handleChange('tax_name1', '');
              handleChange('tax_rate1', 0);
            }}
            onTaxCreated={(taxRate) => {
              handleChange('tax_name1', taxRate.name);
              handleChange('tax_rate1', taxRate.rate);
            }}
            resourceTaxName={resource.tax_name1}
            resourceTaxRate={resource.tax_rate1}
          />
        </Element>
      )}

      {company && company.enabled_tax_rates > 1 && (
        <Element leftSide={t('tax')}>
          <TaxRateSelector
            defaultValue={getTaxRateComboValue(resource, 'tax_name2')}
            onChange={(value: Entry<TaxRate>) => {
              handleChange('tax_name2', value.resource?.name);
              handleChange('tax_rate2', value.resource?.rate);
            }}
            onClearButtonClick={() => {
              handleChange('tax_name2', '');
              handleChange('tax_rate2', 0);
            }}
            onTaxCreated={(taxRate) => {
              handleChange('tax_name2', taxRate.name);
              handleChange('tax_rate2', taxRate.rate);
            }}
            resourceTaxName={resource.tax_name2}
            resourceTaxRate={resource.tax_rate2}
          />
        </Element>
      )}

      {company && company.enabled_tax_rates > 2 && (
        <Element leftSide={t('tax')}>
          <TaxRateSelector
            defaultValue={getTaxRateComboValue(resource, 'tax_name3')}
            onChange={(value: Entry<TaxRate>) => {
              handleChange('tax_name3', value.resource?.name);
              handleChange('tax_rate3', value.resource?.rate);
            }}
            onClearButtonClick={() => {
              handleChange('tax_name3', '');
              handleChange('tax_rate3', 0);
            }}
            onTaxCreated={(taxRate) => {
              handleChange('tax_name3', taxRate.name);
              handleChange('tax_rate3', taxRate.rate);
            }}
            resourceTaxName={resource.tax_name3}
            resourceTaxRate={resource.tax_rate3}
          />
        </Element>
      )}

      {variables.map(
        (variable, index) =>
          variable !== '$subtotal' &&
          variable !== '$taxes' && (
            <Fragment key={index}>{resolveVariable(variable)}</Fragment>
          )
      )}

      {company && company?.custom_fields?.surcharge1 && (
        <CustomSurchargeField
          field="surcharge1"
          type="number"
          defaultValue={resource?.custom_surcharge1}
          value={resource?.custom_surcharge1}
          onValueChange={(value) =>
            handleChange('custom_surcharge1', parseFloat(value as string))
          }
        />
      )}

      {company && company?.custom_fields?.surcharge2 && (
        <CustomSurchargeField
          field="surcharge2"
          type="number"
          defaultValue={resource?.custom_surcharge2}
          value={resource?.custom_surcharge2}
          onValueChange={(value) =>
            handleChange('custom_surcharge2', parseFloat(value as string))
          }
        />
      )}

      {company && company?.custom_fields?.surcharge3 && (
        <CustomSurchargeField
          field="surcharge3"
          type="number"
          defaultValue={resource?.custom_surcharge3}
          value={resource?.custom_surcharge3}
          onValueChange={(value) =>
            handleChange('custom_surcharge3', parseFloat(value as string))
          }
        />
      )}

      {company && company?.custom_fields?.surcharge4 && (
        <CustomSurchargeField
          field="surcharge4"
          type="number"
          defaultValue={resource?.custom_surcharge4}
          value={resource?.custom_surcharge4}
          onValueChange={(value) =>
            handleChange('custom_surcharge4', parseFloat(value as string))
          }
        />
      )}
    </Card>
  );
}
