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
import { CustomField } from '$app/components/CustomField';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Element } from '$app/components/cards';
import { useResolveTranslation } from './useResolveTranslation';
import { InvoiceSum } from '$app/common/helpers/invoices/invoice-sum';
import {
  ProductTableResource,
  RelationType,
} from '../components/ProductsTable';
import { InvoiceSumInclusive } from '$app/common/helpers/invoices/invoice-sum-inclusive';
import { useColorScheme } from '$app/common/colors';
interface Props {
  resource?: ProductTableResource;
  relationType: RelationType;
  invoiceSum?: InvoiceSum | InvoiceSumInclusive;
  onChange: (property: keyof ProductTableResource, value: unknown) => unknown;
}

export function useResolveTotalVariable(props: Props) {
  const resource = props.resource;
  const invoiceSum = props.invoiceSum;

  const resolveTranslation = useResolveTranslation();
  const formatMoney = useFormatMoney({
    resource: props.resource,
    relationType: props.relationType,
  });

  const colors = useColorScheme();
  const company = useCurrentCompany();

  const handleChange = (
    property: keyof ProductTableResource,
    value: unknown
  ) => {
    props.onChange(property, value);
  };

  const aliases: Record<string, string> = {
    total: 'amount',
    outstanding: 'balance',
  };

  const renderMoneyRow = (leftSide: string, amount: number) => (
    <Element
      leftSide={leftSide}
      className="py-5"
      noVerticalPadding
      noExternalPadding
      pushContentToRight
      withoutWrappingLeftSide
    >
      <span className="text-sm font-medium font-mono">
        {formatMoney(amount)}
      </span>
    </Element>
  );

  const renderTaxRows = (taxes: ReturnType<InvoiceSum['getTaxMap']>) => {
    return taxes.count() > 0 ? (
      <>
        {taxes.map((item, index) => (
          <Element
            key={index}
            leftSide={item.name}
            className="py-5"
            noVerticalPadding
            noExternalPadding
            pushContentToRight
            withoutWrappingLeftSide
          >
            <span className="text-sm font-medium font-mono">
              {formatMoney(item.total)}
            </span>
          </Element>
        ))}
      </>
    ) : null;
  };

  return (variable: string) => {
    let value = 0;

    const { property } = resolveTotalVariable(variable);
    const identifier = aliases[property] || property;

    if (variable == '$net_subtotal' && invoiceSum) {
      return renderMoneyRow(
        resolveTranslation(variable, '$'),
        invoiceSum.getNetSubtotal()
      );
    }

    if (variable == '$discount' && invoiceSum) {
      const discountLabel =
        !invoiceSum.invoice.is_amount_discount &&
        invoiceSum.invoice.discount > 0
          ? `${resolveTranslation(variable, '$')} ${
              invoiceSum.invoice.discount
            }%`
          : resolveTranslation(variable, '$');

      return invoiceSum.getTotalDiscount() != 0
        ? renderMoneyRow(discountLabel, invoiceSum.getTotalDiscount())
        : '';
    }

    if (variable == '$subtotal' && invoiceSum) {
      return renderMoneyRow(
        resolveTranslation(variable, '$'),
        invoiceSum.getSubTotal()
      );
    }

    if (variable == '$total_taxes' && invoiceSum) {
      return renderTaxRows(invoiceSum.getTotalTaxMap());
    }

    if (variable == '$line_taxes' && invoiceSum) {
      return renderTaxRows(invoiceSum.getTaxMap());
    }

    if (variable == '$taxes' && invoiceSum) {
      return (
        <>
          {renderTaxRows(invoiceSum.getTotalTaxMap())}
          {renderTaxRows(invoiceSum.getTaxMap())}
        </>
      );
    }

    if (variable == '$total' && invoiceSum) {
      return renderMoneyRow(
        resolveTranslation(variable, '$'),
        invoiceSum.getTotal()
      );
    }

    if (variable == '$cash_discount' && invoiceSum) {
      return renderMoneyRow(
        resolveTranslation(variable, '$'),
        invoiceSum.getCashDiscount()
      );
    }

    if (variable == '$paid_to_date' && invoiceSum) {
      return renderMoneyRow(
        resolveTranslation(variable, '$'),
        invoiceSum.invoice.paid_to_date
      );
    }

    if (variable == '$balance_due' && invoiceSum) {
      return renderMoneyRow(
        resolveTranslation(variable, '$'),
        invoiceSum.getBalanceDue()
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
      <Element
        leftSide={resolveTranslation(identifier, '$')}
        className="py-5"
        noVerticalPadding
        noExternalPadding
        pushContentToRight
        withoutWrappingLeftSide
      >
        <span className="text-sm font-medium font-mono">
          {formatMoney(value)}
        </span>
      </Element>
    );
  };
}
