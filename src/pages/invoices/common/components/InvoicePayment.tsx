/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { InvoiceStatus } from '$app/common/enums/invoice-status';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { Invoice } from '$app/common/interfaces/invoice';
import { Element } from '$app/components/cards';
import { InputField, SelectField } from '$app/components/forms';
import { NumberInputField } from '$app/components/forms/NumberInputField';
import Toggle from '$app/components/forms/Toggle';

export interface InvoicePaymentParams {
  paid?: boolean;
  amount_paid?: number;
  reference?: string;
}

interface Props {
  invoice: Invoice;
  payment: InvoicePaymentParams | undefined;
  setPayment: Dispatch<SetStateAction<InvoicePaymentParams | undefined>>;
}

export function InvoicePayment(props: Props) {
  const [t] = useTranslation();

  const hasPermission = useHasPermission();

  const { invoice, payment, setPayment } = props;

  const isPayable =
    !invoice.id ||
    (!invoice.is_deleted &&
      !invoice.is_locked &&
      parseInt(invoice.status_id) < parseInt(InvoiceStatus.Paid));

  const handleAmountTypeChange = (value: string) => {
    setPayment((current) => ({
      ...current,
      paid: value === 'paid_in_full' ? true : undefined,
      amount_paid: value === 'paid_in_full' ? undefined : current?.amount_paid,
    }));
  };

  if (!hasPermission('create_payment') || !isPayable) {
    return null;
  }

  return (
    <>
      <Element
        leftSide={t('enter_payment')}
        className="py-5"
        noVerticalPadding
        noExternalPadding
        pushContentToRight
        withoutWrappingLeftSide
      >
        <Toggle
          cypressRef="invoiceEnterPaymentToggle"
          checked={Boolean(payment)}
          onValueChange={(value) =>
            setPayment(value ? { paid: true } : undefined)
          }
        />
      </Element>

      {payment && (
        <Element leftSide={t('amount')} noExternalPadding>
          <div
            className="flex flex-col gap-y-2 w-full"
            data-cy="invoicePaymentAmountFields"
          >
            <SelectField
              cypressRef="invoicePaymentAmountType"
              value={payment.paid ? 'paid_in_full' : 'partial_payment'}
              onValueChange={handleAmountTypeChange}
              customSelector
              dismissable={false}
              searchable={false}
            >
              <option value="paid_in_full">{t('paid_in_full')}</option>
              <option value="partial_payment">{t('partial_payment')}</option>
            </SelectField>

            {!payment.paid && (
              <NumberInputField
                cypressRef="invoicePaymentAmount"
                value={payment.amount_paid ?? ''}
                onValueChange={(value) =>
                  setPayment((current) => ({
                    ...current,
                    amount_paid: parseFloat(value) || undefined,
                  }))
                }
              />
            )}
          </div>
        </Element>
      )}

      {payment && (
        <Element leftSide={t('transaction_reference')} noExternalPadding>
          <InputField
            cypressRef="invoicePaymentReference"
            value={payment.reference ?? ''}
            onValueChange={(value) =>
              setPayment((current) => ({ ...current, reference: value }))
            }
          />
        </Element>
      )}
    </>
  );
}
