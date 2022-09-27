/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { resolveTotalVariable } from '../helpers/resolve-total-variable';
import { useFormatMoney } from './useFormatMoney';
import { CustomField } from 'components/CustomField';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { Element } from '@invoiceninja/cards';
import { useResolveTranslation } from './useResolveTranslation';
import { InvoiceSum } from 'common/helpers/invoices/invoice-sum';
import {
  ProductTableResource,
  RelationType,
} from '../components/ProductsTable';

interface Props {
  resource?: ProductTableResource;
  relationType: RelationType;
  invoiceSum?: InvoiceSum;
  onChange: (property: keyof ProductTableResource, value: unknown) => unknown;
}

export function useResolveTotalVariable(props: Props) {
  const formatMoney = useFormatMoney({
    resource: props.resource,
    relationType: props.relationType,
  });

  const resource = props.resource;
  const company = useCurrentCompany();

  const handleChange = (property: keyof ProductTableResource, value: unknown) =>
    props.onChange(property, value);

  const resolveTranslation = useResolveTranslation();
  const invoiceSum = props.invoiceSum;

  // discount => invoice.discount,
  // paid_to_date => invoice.paid_to_date,
  // surcharge1-4 => invoice.surcharge1-4,
  // outstanding => invoice.balance

  // net_subtotal => ->getSubtotal(),
  // subtotal => ->getSubtotal(),
  // total_taxes => ->getTotalTaxes(),
  // line_taxes => ->getLineTaxes(),
  // total => ->getTotal(),

  const aliases: Record<string, string> = {
    total: 'amount',
    outstanding: 'balance',
  };

  return (variable: string) => {
    let value = 0;

    const { property } = resolveTotalVariable(variable);
    const identifier = aliases[property] || property;

    if (variable == '$net_subtotal' && invoiceSum) {
      return (
        <Element leftSide={resolveTranslation(variable, '$')}>
          {formatMoney(invoiceSum.subTotal)}
        </Element>
      );
    }

    if (variable == '$subtotal' && invoiceSum) {
      return (
        <Element leftSide={resolveTranslation(variable, '$')}>
          {formatMoney(invoiceSum.subTotal)}
        </Element>
      );
    }

    if (variable == '$total_taxes' && invoiceSum) {
      return (
        <Element leftSide={resolveTranslation(variable, '$')}>
          {formatMoney(invoiceSum.totalTaxes)}
        </Element>
      );
    }
    if (variable == '$line_taxes' && invoiceSum) {
      return (
        <Element leftSide={resolveTranslation(variable, '$')}>
          {formatMoney(invoiceSum.invoiceItems.totalTaxes)}
        </Element>
      );
    }

    if (variable == '$total' && invoiceSum) {
      return (
        <Element leftSide={resolveTranslation(variable, '$')}>
          {formatMoney(invoiceSum.total)}
        </Element>
      );
    }

    if (variable === '$custom_surcharge1') {
      return (
        <CustomField
          field="surcharge1"
          defaultValue={resource?.custom_surcharge1 || ''}
          value={company?.custom_fields.surcharge1 || ''}
          onValueChange={(value) => handleChange('custom_surcharge1', value)}
        />
      );
    }

    if (variable === '$custom_surcharge2') {
      return (
        <CustomField
          field="surcharge2"
          defaultValue={resource?.custom_surcharge2 || ''}
          value={company?.custom_fields.surcharge2 || ''}
          onValueChange={(value) => handleChange('custom_surcharge2', value)}
        />
      );
    }

    if (variable === '$custom_surcharge3') {
      return (
        <CustomField
          field="surcharge3"
          defaultValue={resource?.custom_surcharge3 || ''}
          value={company?.custom_fields.surcharge3 || ''}
          onValueChange={(value) => handleChange('custom_surcharge3', value)}
        />
      );
    }

    if (variable === '$custom_surcharge4') {
      return (
        <CustomField
          field="surcharge4"
          defaultValue={resource?.custom_surcharge4 || ''}
          value={company?.custom_fields.surcharge4 || ''}
          onValueChange={(value) => handleChange('custom_surcharge4', value)}
        />
      );
    }

    if (resource) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      value = resource[identifier] ?? 0;
    }

    return (
      <Element leftSide={resolveTranslation(identifier, '$')}>
        {formatMoney(value)}
      </Element>
    );
  };
}
