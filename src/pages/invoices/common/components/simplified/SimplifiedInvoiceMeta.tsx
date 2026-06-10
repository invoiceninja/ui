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
import { Invoice } from '$app/common/interfaces/invoice';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Button, InputField } from '$app/components/forms';
import { NumberInputField } from '$app/components/forms/NumberInputField';
import { PaymentTermsTooltip } from '$app/components/PaymentTermsTooltip';
import { ChangeHandler } from '$app/pages/invoices/create/Create';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useInvoiceEditorPreferences } from '../../hooks/useInvoiceEditorPreferences';

interface Props {
  mode: 'create' | 'edit';
  invoice?: Invoice;
  handleChange: ChangeHandler;
  errors: ValidationBag | undefined;
}

const labelClass = 'text-xs font-medium uppercase tracking-wide';

function Field({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  const colors = useColorScheme();

  return (
    <div className="flex flex-col space-y-1.5">
      <span className={labelClass} style={{ color: colors.$22 }}>
        {label}
      </span>

      {children}
    </div>
  );
}

export function SimplifiedInvoiceMeta({
  mode,
  invoice,
  handleChange,
  errors,
}: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const { isExpanded, setExpanded } = useInvoiceEditorPreferences();

  const hasSecondaryValues = Boolean(
    invoice?.po_number ||
      (invoice?.partial && invoice.partial > 0) ||
      (mode === 'create' && invoice?.number)
  );

  const showSecondary = isExpanded('meta_secondary', hasSecondaryValues);

  const numberField = (
    <Field label={t('invoice_number_short')}>
      <InputField
        id="number"
        placeholder={t('auto_generate')}
        onValueChange={(value) => handleChange('number', value)}
        value={invoice?.number || ''}
        errorMessage={errors?.errors.number}
      />
    </Field>
  );

  return (
    <div
      className="border rounded-md p-6 space-y-5 self-start w-full"
      style={{ backgroundColor: colors.$1, borderColor: colors.$24 }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mode === 'edit' && numberField}

        <Field label={t('invoice_date')}>
          <InputField
            type="date"
            onValueChange={(value) => handleChange('date', value)}
            value={invoice?.date || ''}
            errorMessage={errors?.errors.date}
          />
        </Field>

        <div
          className={
            mode === 'edit'
              ? 'flex flex-col space-y-1.5 sm:col-span-2'
              : 'flex flex-col space-y-1.5'
          }
        >
          <div className="flex items-center gap-x-2">
            <span className={labelClass} style={{ color: colors.$22 }}>
              {t('due_date')}
            </span>

            <PaymentTermsTooltip
              client={invoice?.client}
              clientId={invoice?.client_id}
            />
          </div>

          <InputField
            type="date"
            onValueChange={(value) => handleChange('due_date', value)}
            value={invoice?.due_date || ''}
            errorMessage={errors?.errors.due_date}
          />
        </div>
      </div>

      <div className="self-start">
        <Button
          type="minimal"
          behavior="button"
          onClick={() => setExpanded('meta_secondary', !showSecondary)}
          disableWithoutIcon
        >
          <span className="text-xs font-semibold">
            {showSecondary ? `− ${t('less')}` : `+ ${t('more')}`}
          </span>
        </Button>
      </div>

      {showSecondary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {mode === 'create' && numberField}

          <Field label={t('po_number_short')}>
            <InputField
              id="po_number"
              onValueChange={(value) => handleChange('po_number', value)}
              value={invoice?.po_number || ''}
              errorMessage={errors?.errors.po_number}
            />
          </Field>

          <Field label={t('partial')}>
            <NumberInputField
              value={invoice?.partial || ''}
              onValueChange={(value) =>
                handleChange('partial', parseFloat(value) || 0)
              }
              changeOverride
              errorMessage={errors?.errors.partial}
            />
          </Field>

          {invoice && invoice.partial > 0 && (
            <div className="flex flex-col space-y-1.5 sm:col-span-2">
              <span className={labelClass} style={{ color: colors.$22 }}>
                {t('partial_due_date')}
              </span>

              <InputField
                type="date"
                onValueChange={(value) =>
                  handleChange('partial_due_date', value)
                }
                value={invoice?.partial_due_date || ''}
                errorMessage={errors?.errors.partial_due_date}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
