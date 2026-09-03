/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import { useShouldDisableCustomFields } from '$app/common/hooks/useShouldDisableCustomFields';
import { customField } from '$app/components/CustomField';
import { Element } from '$app/components/cards';
import { Divider } from '$app/components/cards/Divider';
import { SortableVariableList } from '$app/pages/settings/invoice-design/pages/general-settings/components/SortableVariableList';

interface Props {
  entity: 'invoice' | 'product';
}

export function DesignVariables(props: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const company = useCompanyChanges();

  const disabled = useShouldDisableCustomFields();
  const { isCompanySettingsActive } = useCurrentSettingsLevel();

  const isInvoiceEntity = props.entity === 'invoice';

  const target = isInvoiceEntity ? 'invoice_details' : 'product_columns';

  const resolveLabel = (field: string, fallback: string) => {
    const value = company?.custom_fields?.[field];

    return value ? customField(value).label() || fallback : fallback;
  };

  const resolveTitle = () => {
    if (isInvoiceEntity) {
      return t('invoice_details');
    }

    return company?.settings?.sync_invoice_quote_columns
      ? t('product_columns')
      : t('invoice_product_columns');
  };

  const resolveDefaultVariables = () => {
    if (isInvoiceEntity) {
      return [
        { value: '$invoice.number', label: t('invoice_number') },
        { value: '$invoice.po_number', label: t('po_number') },
        { value: '$invoice.date', label: t('invoice_date') },
        { value: '$invoice.due_date', label: t('invoice_due_date') },
        { value: '$invoice.amount', label: t('invoice_amount') },
        { value: '$invoice.balance', label: t('invoice_balance') },
        { value: '$invoice.balance_due', label: t('balance_due') },
        {
          value: '$invoice.custom1',
          label: resolveLabel('invoice1', t('custom1')),
        },
        {
          value: '$invoice.custom2',
          label: resolveLabel('invoice2', t('custom2')),
        },
        {
          value: '$invoice.custom3',
          label: resolveLabel('invoice3', t('custom3')),
        },
        {
          value: '$invoice.custom4',
          label: resolveLabel('invoice4', t('custom4')),
        },
        { value: '$invoice.project', label: t('project') },
        { value: '$client.balance', label: t('client_balance') },
        { value: '$invoice.total', label: t('invoice_total') },
      ];
    }

    return [
      { value: '$product.item', label: t('item') },
      { value: '$product.description', label: t('description') },
      { value: '$product.quantity', label: t('quantity') },
      { value: '$product.unit_cost', label: t('unit_cost') },
      { value: '$product.net_cost', label: t('unit_cost') },
      { value: '$product.tax', label: t('tax') },
      { value: '$product.discount', label: t('discount') },
      { value: '$product.line_total', label: t('line_total') },
      {
        value: '$product.product1',
        label: resolveLabel('product1', t('custom1')),
      },
      {
        value: '$product.product2',
        label: resolveLabel('product2', t('custom2')),
      },
      {
        value: '$product.product3',
        label: resolveLabel('product3', t('custom3')),
      },
      {
        value: '$product.product4',
        label: resolveLabel('product4', t('custom4')),
      },
      { value: '$product.gross_line_total', label: t('gross_line_total') },
      { value: '$product.tax_amount', label: t('tax_amount') },
    ];
  };

  const excludedVariables =
    !isInvoiceEntity && !company?.enabled_item_tax_rates
      ? ['$product.tax_amount', '$product.tax']
      : [];

  const customVariables = isInvoiceEntity
    ? [
        '$invoice.custom1',
        '$invoice.custom2',
        '$invoice.custom3',
        '$invoice.custom4',
      ]
    : [
        '$product.product1',
        '$product.product2',
        '$product.product3',
        '$product.product4',
      ];

  const currentVariables: string[] =
    company?.settings?.pdf_variables?.[target] ?? [];

  const hasCustomFields = [1, 2, 3, 4].some((index) =>
    Boolean(company?.custom_fields?.[`${props.entity}${index}`])
  );

  const hasCustomVariables = customVariables.some((variable) =>
    currentVariables.includes(variable)
  );

  if (
    !isCompanySettingsActive ||
    !company ||
    (!hasCustomFields && !hasCustomVariables)
  ) {
    return null;
  }

  return (
    <>
      <div className="px-4 sm:px-6 py-4">
        <Divider
          className="border-dashed"
          borderColor={colors.$20}
          withoutPadding
        />
      </div>

      <Element
        leftSide={<span style={{ color: colors.$3 }}>{resolveTitle()}</span>}
        leftSideHelp={
          isInvoiceEntity ? t('invoice_fields_help') : t('product_fields_help')
        }
      />

      <SortableVariableList
        for={target}
        defaultVariables={resolveDefaultVariables()}
        excludedVariables={excludedVariables}
        disabled={disabled}
      />
    </>
  );
}
