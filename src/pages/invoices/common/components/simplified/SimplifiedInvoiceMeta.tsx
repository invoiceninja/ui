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
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Invoice } from '$app/common/interfaces/invoice';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { CustomField } from '$app/components/CustomField';
import { Button, InputField } from '$app/components/forms';
import { NumberInputField } from '$app/components/forms/NumberInputField';
import { PaymentTermsTooltip } from '$app/components/PaymentTermsTooltip';
import { ChangeHandler } from '$app/pages/invoices/create/Create';
import { useTranslation } from 'react-i18next';
import { useInvoiceEditorPreferences } from '../../hooks/useInvoiceEditorPreferences';

interface Props {
  invoice?: Invoice;
  handleChange: ChangeHandler;
  errors: ValidationBag | undefined;
}

export function SimplifiedInvoiceMeta({
  invoice,
  handleChange,
  errors,
}: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const company = useCurrentCompany();

  const { isExpanded, setExpanded } = useInvoiceEditorPreferences();

  const hasSecondaryValues = Boolean(
    invoice?.po_number ||
      (invoice?.partial && invoice.partial > 0) ||
      invoice?.custom_value1 ||
      invoice?.custom_value2 ||
      invoice?.custom_value3 ||
      invoice?.custom_value4
  );

  const showSecondary = isExpanded('meta_secondary', hasSecondaryValues);

  const labelClass = 'text-xs font-medium uppercase tracking-wide';

  return (
    <div
      className="border rounded-md p-6 space-y-5 self-start w-full"
      style={{ backgroundColor: colors.$1, borderColor: colors.$24 }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-1.5">
          <span className={labelClass} style={{ color: colors.$22 }}>
            {t('invoice_number_short')}
          </span>

          <InputField
            id="number"
            placeholder={t('auto_generate')}
            onValueChange={(value) => handleChange('number', value)}
            value={invoice?.number || ''}
            errorMessage={errors?.errors.number}
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <span className={labelClass} style={{ color: colors.$22 }}>
            {t('invoice_date')}
          </span>

          <InputField
            type="date"
            onValueChange={(value) => handleChange('date', value)}
            value={invoice?.date || ''}
            errorMessage={errors?.errors.date}
          />
        </div>

        <div className="flex flex-col space-y-1.5 sm:col-span-2">
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
            {showSecondary ? `− ${t('details')}` : `+ ${t('details')}`}
          </span>
        </Button>
      </div>

      {showSecondary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="flex flex-col space-y-1.5">
            <span className={labelClass} style={{ color: colors.$22 }}>
              {t('po_number_short')}
            </span>

            <InputField
              id="po_number"
              onValueChange={(value) => handleChange('po_number', value)}
              value={invoice?.po_number || ''}
              errorMessage={errors?.errors.po_number}
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <span className={labelClass} style={{ color: colors.$22 }}>
              {t('partial')}
            </span>

            <NumberInputField
              value={invoice?.partial || ''}
              onValueChange={(value) =>
                handleChange('partial', parseFloat(value) || 0)
              }
              changeOverride
              errorMessage={errors?.errors.partial}
            />
          </div>

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

          {invoice && company?.custom_fields?.invoice1 && (
            <CustomField
              field="invoice1"
              defaultValue={invoice?.custom_value1 || ''}
              value={company.custom_fields.invoice1}
              onValueChange={(value) =>
                handleChange('custom_value1', value.toString())
              }
            />
          )}

          {invoice && company?.custom_fields?.invoice2 && (
            <CustomField
              field="invoice2"
              defaultValue={invoice?.custom_value2 || ''}
              value={company.custom_fields.invoice2}
              onValueChange={(value) =>
                handleChange('custom_value2', value.toString())
              }
            />
          )}

          {invoice && company?.custom_fields?.invoice3 && (
            <CustomField
              field="invoice3"
              defaultValue={invoice?.custom_value3 || ''}
              value={company.custom_fields.invoice3}
              onValueChange={(value) =>
                handleChange('custom_value3', value.toString())
              }
            />
          )}

          {invoice && company?.custom_fields?.invoice4 && (
            <CustomField
              field="invoice4"
              defaultValue={invoice?.custom_value4 || ''}
              value={company.custom_fields.invoice4}
              onValueChange={(value) =>
                handleChange('custom_value4', value.toString())
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
