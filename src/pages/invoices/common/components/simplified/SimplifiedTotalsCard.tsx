/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import useDoesTaxRateExistByComboValue from '$app/common/hooks/tax-rates/useDoesTaxRateExistByComboValue';
import { getTaxRateComboValue } from '$app/common/helpers/tax-rates/tax-rates-combo';
import { InvoiceSum } from '$app/common/helpers/invoices/invoice-sum';
import { InvoiceSumInclusive } from '$app/common/helpers/invoices/invoice-sum-inclusive';
import { TaxRate } from '$app/common/interfaces/tax-rate';
import { CustomSurchargeField } from '$app/components/CustomSurchargeField';
import { Entry } from '$app/components/forms/Combobox';
import { Icon } from '$app/components/icons/Icon';
import { Link } from '$app/components/forms';
import { TaxRateSelector } from '$app/components/tax-rates/TaxRateSelector';
import classNames from 'classnames';
import { Fragment, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { MdWarning } from 'react-icons/md';
import reactStringReplace from 'react-string-replace';
import {
  ProductTableResource,
  RelationType,
} from '../ProductsTable';
import { useFormatMoney } from '../../hooks/useFormatMoney';
import { useResolveTranslation } from '../../hooks/useResolveTranslation';
import { useTotalVariables } from '../../hooks/useTotalVariables';

interface Props {
  resource: ProductTableResource;
  invoiceSum?: InvoiceSum | InvoiceSumInclusive;
  relationType: RelationType;
  onChange: (property: keyof ProductTableResource, value: unknown) => unknown;
}

const labelClass = 'text-xs font-medium uppercase tracking-wide';

interface AmountRowProps {
  label: ReactNode;
  amount: ReactNode;
  emphasis?: 'normal' | 'strong' | 'muted';
}

function AmountRow({ label, amount, emphasis = 'normal' }: AmountRowProps) {
  const colors = useColorScheme();

  return (
    <div
      className={classNames('flex items-center justify-between py-2', {
        'opacity-75': emphasis === 'muted',
      })}
    >
      <span
        className={classNames('text-sm', {
          'font-medium': emphasis !== 'strong',
          'font-semibold': emphasis === 'strong',
        })}
        style={{ color: emphasis === 'muted' ? colors.$22 : colors.$3 }}
      >
        {label}
      </span>

      <span
        className={classNames('font-mono', {
          'text-sm font-medium': emphasis !== 'strong',
          'text-sm font-semibold': emphasis === 'strong',
        })}
        style={{ color: emphasis === 'muted' ? colors.$22 : colors.$3 }}
      >
        {amount}
      </span>
    </div>
  );
}

interface TaxRowProps {
  taxNameKey: 'tax_name1' | 'tax_name2' | 'tax_name3';
  taxRateKey: 'tax_rate1' | 'tax_rate2' | 'tax_rate3';
  resource: ProductTableResource;
  handleChange: (
    property: keyof ProductTableResource,
    value: unknown
  ) => unknown;
}

function TaxRow({ taxNameKey, taxRateKey, resource, handleChange }: TaxRowProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const doesTaxRateExistByComboValue = useDoesTaxRateExistByComboValue();

  return (
    <div className="flex flex-col gap-y-1.5 py-2">
      <span className={labelClass} style={{ color: colors.$22 }}>
        {t('tax')}
      </span>

      <TaxRateSelector
        defaultValue={getTaxRateComboValue(resource, taxNameKey)}
        onChange={(value: Entry<TaxRate>) => {
          handleChange(taxNameKey, value.resource?.name);
          handleChange(taxRateKey, value.resource?.rate);
        }}
        onClearButtonClick={() => {
          handleChange(taxNameKey, '');
          handleChange(taxRateKey, 0);
        }}
        onTaxCreated={(taxRate) => {
          handleChange(taxNameKey, taxRate.name);
          handleChange(taxRateKey, taxRate.rate);
        }}
        resourceTaxName={resource[taxNameKey] as string}
        resourceTaxRate={resource[taxRateKey] as number}
      />

      {!doesTaxRateExistByComboValue(
        resource[taxNameKey] as string,
        resource[taxRateKey] as number
      ) && (
        <div className="flex items-center gap-x-2 flex-wrap text-sm">
          <Icon element={MdWarning} size={18} color="orange" />

          <span style={{ color: colors.$3 }}>
            {resource[taxNameKey] as string} {resource[taxRateKey] as number}%
          </span>

          <span
            className="underline cursor-pointer"
            style={{ color: colors.$3 }}
            onClick={() => {
              handleChange(taxNameKey, '');
              handleChange(taxRateKey, 0);
            }}
          >
            {t('remove')}
          </span>
        </div>
      )}
    </div>
  );
}

export function SimplifiedTotalsCard({
  resource,
  invoiceSum,
  relationType,
  onChange,
}: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const accentColor = useAccentColor();
  const company = useCurrentCompany();
  const variables = useTotalVariables();
  const resolveTranslation = useResolveTranslation();

  const formatMoney = useFormatMoney({ resource, relationType });

  const handleChange = (
    property: keyof ProductTableResource,
    value: unknown
  ) => onChange(property, value);

  const isAnyTaxHidden = () => {
    if (
      company.enabled_tax_rates === 0 &&
      (resource?.tax_name1 || resource?.tax_name2 || resource?.tax_name3)
    ) {
      return true;
    }
    if (company.enabled_tax_rates === 2 && resource?.tax_name3) return true;
    if (
      company.enabled_tax_rates === 1 &&
      (resource?.tax_name2 || resource?.tax_name3)
    ) {
      return true;
    }
    return false;
  };

  const taxSummaryVars = new Set([
    '$total_taxes',
    '$line_taxes',
    '$taxes',
  ]);
  const taxInputVars = new Set(['$tax1', '$tax2', '$tax3']);
  const surchargeVars = new Set([
    '$custom_surcharge1',
    '$custom_surcharge2',
    '$custom_surcharge3',
    '$custom_surcharge4',
  ]);
  const grandTotalVars = new Set(['$total', '$balance_due']);
  const subtotalBlockVars = new Set([
    '$net_subtotal',
    '$subtotal',
    '$discount',
  ]);

  const subtotalBlock = variables.filter((v) => subtotalBlockVars.has(v));
  const summarySubBlock = variables.filter((v) => taxSummaryVars.has(v));
  const paidBlock = variables.filter((v) => v === '$paid_to_date');

  const adjustmentVars = variables.filter(
    (v) =>
      taxInputVars.has(v) ||
      surchargeVars.has(v)
  );

  const balanceAmount = invoiceSum?.getBalanceDue() ?? 0;
  const balanceLabel = resolveTranslation('$balance_due', '$') || t('amount_due');

  const renderSummaryVariable = (variable: string) => {
    if (variable === '$net_subtotal' && invoiceSum) {
      return (
        <AmountRow
          key={variable}
          emphasis="muted"
          label={resolveTranslation(variable, '$')}
          amount={formatMoney(invoiceSum.getNetSubtotal())}
        />
      );
    }
    if (variable === '$subtotal' && invoiceSum) {
      return (
        <AmountRow
          key={variable}
          label={resolveTranslation(variable, '$')}
          amount={formatMoney(invoiceSum.getSubTotal())}
        />
      );
    }
    if (variable === '$discount' && invoiceSum) {
      if (invoiceSum.getTotalDiscount() === 0) return null;
      const discountLabel =
        !invoiceSum.invoice.is_amount_discount && invoiceSum.invoice.discount > 0
          ? `${resolveTranslation(variable, '$')} ${invoiceSum.invoice.discount}%`
          : resolveTranslation(variable, '$');
      return (
        <AmountRow
          key={variable}
          label={discountLabel}
          amount={`-${formatMoney(invoiceSum.getTotalDiscount())}`}
        />
      );
    }
    if (variable === '$paid_to_date' && invoiceSum) {
      if (invoiceSum.invoice.paid_to_date === 0) return null;
      return (
        <AmountRow
          key={variable}
          emphasis="muted"
          label={resolveTranslation(variable, '$')}
          amount={formatMoney(invoiceSum.invoice.paid_to_date)}
        />
      );
    }
    return null;
  };

  const renderTaxSummary = (variable: string) => {
    if (!invoiceSum) return null;

    const taxes =
      variable === '$total_taxes'
        ? invoiceSum.getTotalTaxMap()
        : variable === '$line_taxes'
        ? invoiceSum.getTaxMap()
        : null;

    if (taxes) {
      return taxes.count() > 0 ? (
        <Fragment key={variable}>
          {taxes.map((item, index) => (
            <AmountRow
              key={`${variable}-${index}`}
              label={item.name}
              amount={formatMoney(item.total)}
            />
          ))}
        </Fragment>
      ) : null;
    }

    if (variable === '$taxes') {
      const totalTaxes = invoiceSum.getTotalTaxMap();
      const lineTaxes = invoiceSum.getTaxMap();
      return (
        <Fragment key={variable}>
          {totalTaxes.count() > 0 &&
            totalTaxes.map((item, index) => (
              <AmountRow
                key={`tt-${index}`}
                label={item.name}
                amount={formatMoney(item.total)}
              />
            ))}
          {lineTaxes.count() > 0 &&
            lineTaxes.map((item, index) => (
              <AmountRow
                key={`lt-${index}`}
                label={item.name}
                amount={formatMoney(item.total)}
              />
            ))}
        </Fragment>
      );
    }

    return null;
  };

  const renderAdjustmentInput = (variable: string) => {
    if (variable === '$tax1' && company.enabled_tax_rates > 0) {
      return (
        <TaxRow
          key="tax1"
          taxNameKey="tax_name1"
          taxRateKey="tax_rate1"
          resource={resource}
          handleChange={handleChange}
        />
      );
    }
    if (variable === '$tax2' && company.enabled_tax_rates > 1) {
      return (
        <TaxRow
          key="tax2"
          taxNameKey="tax_name2"
          taxRateKey="tax_rate2"
          resource={resource}
          handleChange={handleChange}
        />
      );
    }
    if (variable === '$tax3' && company.enabled_tax_rates > 2) {
      return (
        <TaxRow
          key="tax3"
          taxNameKey="tax_name3"
          taxRateKey="tax_rate3"
          resource={resource}
          handleChange={handleChange}
        />
      );
    }

    if (
      variable === '$custom_surcharge1' &&
      company?.custom_fields?.surcharge1
    ) {
      return (
        <CustomSurchargeField
          key="sur1"
          field="surcharge1"
          type="number"
          defaultValue={resource?.custom_surcharge1}
          value={resource?.custom_surcharge1}
          onValueChange={(value) =>
            handleChange('custom_surcharge1', parseFloat(value as string))
          }
          elementNoExternalPadding
          elementClassName="py-2"
          elementWithoutWrappingLeftSide
        />
      );
    }
    if (
      variable === '$custom_surcharge2' &&
      company?.custom_fields?.surcharge2
    ) {
      return (
        <CustomSurchargeField
          key="sur2"
          field="surcharge2"
          type="number"
          defaultValue={resource?.custom_surcharge2}
          value={resource?.custom_surcharge2}
          onValueChange={(value) =>
            handleChange('custom_surcharge2', parseFloat(value as string))
          }
          elementNoExternalPadding
          elementClassName="py-2"
          elementWithoutWrappingLeftSide
        />
      );
    }
    if (
      variable === '$custom_surcharge3' &&
      company?.custom_fields?.surcharge3
    ) {
      return (
        <CustomSurchargeField
          key="sur3"
          field="surcharge3"
          type="number"
          defaultValue={resource?.custom_surcharge3}
          value={resource?.custom_surcharge3}
          onValueChange={(value) =>
            handleChange('custom_surcharge3', parseFloat(value as string))
          }
          elementNoExternalPadding
          elementClassName="py-2"
          elementWithoutWrappingLeftSide
        />
      );
    }
    if (
      variable === '$custom_surcharge4' &&
      company?.custom_fields?.surcharge4
    ) {
      return (
        <CustomSurchargeField
          key="sur4"
          field="surcharge4"
          type="number"
          defaultValue={resource?.custom_surcharge4}
          value={resource?.custom_surcharge4}
          onValueChange={(value) =>
            handleChange('custom_surcharge4', parseFloat(value as string))
          }
          elementNoExternalPadding
          elementClassName="py-2"
          elementWithoutWrappingLeftSide
        />
      );
    }

    return null;
  };

  const renderedAdjustments = adjustmentVars
    .map(renderAdjustmentInput)
    .filter(Boolean);

  const renderedSubtotal = subtotalBlock
    .map(renderSummaryVariable)
    .filter(Boolean);

  const renderedTaxSummary = summarySubBlock
    .map(renderTaxSummary)
    .filter(Boolean);

  const renderedPaid = paidBlock.map(renderSummaryVariable).filter(Boolean);

  const grandTotalAmount = invoiceSum?.getTotal() ?? 0;
  const grandTotalLabel =
    variables.find((v) => v === '$total') !== undefined
      ? resolveTranslation('$total', '$')
      : resolveTranslation('$balance_due', '$');

  const showGrand = grandTotalVars.has('$total') || grandTotalVars.has('$balance_due');

  return (
    <div
      className="border rounded-md overflow-hidden xl:sticky xl:top-24"
      style={{ backgroundColor: colors.$1, borderColor: colors.$24 }}
    >
      <div
        className="px-6 py-5 border-b"
        style={{
          borderColor: colors.$24,
          borderTop: `4px solid ${accentColor}`,
        }}
      >
        <span
          className={labelClass}
          style={{ color: colors.$22 }}
        >
          {balanceLabel || t('amount_due')}
        </span>

        <div
          className="mt-1 text-2xl font-semibold font-mono"
          style={{ color: colors.$3 }}
        >
          {formatMoney(balanceAmount)}
        </div>
      </div>

      {isAnyTaxHidden() && (
        <div
          className="flex items-start gap-x-2 px-6 py-3 border-b text-sm"
          style={{ borderColor: colors.$24 }}
        >
          <Icon element={MdWarning} size={18} color="orange" />

          <div className="font-medium">
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

      {renderedSubtotal.length > 0 && (
        <div className="px-6 py-2">{renderedSubtotal}</div>
      )}

      {renderedAdjustments.length > 0 && (
        <div
          className="px-6 py-3 border-t flex flex-col gap-y-2"
          style={{ borderColor: colors.$24 }}
        >
          {renderedAdjustments}
        </div>
      )}

      {(renderedTaxSummary.length > 0 || renderedPaid.length > 0) && (
        <div
          className="px-6 py-2 border-t"
          style={{ borderColor: colors.$24 }}
        >
          {renderedTaxSummary}
          {renderedPaid}
        </div>
      )}

      {showGrand && (
        <div
          className="px-6 py-4 border-t flex items-center justify-between"
          style={{ borderColor: colors.$24, backgroundColor: colors.$2 }}
        >
          <span
            className="text-sm font-semibold uppercase tracking-wide"
            style={{ color: colors.$3 }}
          >
            {grandTotalLabel || t('total')}
          </span>

          <span
            className="text-lg font-semibold font-mono"
            style={{ color: colors.$3 }}
          >
            {formatMoney(grandTotalAmount)}
          </span>
        </div>
      )}
    </div>
  );
}
