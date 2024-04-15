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
import { InputField, SelectField } from '$app/components/forms';
import paymentType from '$app/common/constants/payment-type';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useTitle } from '$app/common/hooks/useTitle';
import { Payment } from '$app/common/interfaces/payment';
import { Divider } from '$app/components/cards/Divider';
import { ConvertCurrency } from '$app/components/ConvertCurrency';
import { CustomField } from '$app/components/CustomField';
import Toggle from '$app/components/forms/Toggle';
import { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { PaymentOverview } from './PaymentOverview';
import { ClientCard } from '$app/pages/clients/show/components/ClientCard';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useColorScheme } from '$app/common/colors';

interface Context {
  errors: ValidationBag | undefined;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  payment: Payment;
  setPayment: Dispatch<SetStateAction<Payment | undefined>>;
}

export default function Edit() {
  const { documentTitle } = useTitle('edit_payment');
  const [t] = useTranslation();

  const context = useOutletContext<Context>();

  const { setPayment, payment, errors } = context;

  const [convertCurrency, setConvertCurrency] = useState(
    Boolean(payment?.exchange_currency_id)
  );

  const company = useCurrentCompany();

  const colors = useColorScheme();

  const handleChange = <
    TField extends keyof Payment,
    TValue extends Payment[TField]
  >(
    field: TField,
    value: TValue
  ) => {
    setPayment((current) => current && { ...current, [field]: value });
  };

  return (
    <Card title={documentTitle}>
      {payment?.client && <ClientCard client={payment.client} />}
      {payment && <PaymentOverview payment={payment} />}

      <Divider />

      <Element leftSide={t('payment_number')}>
        <InputField
          style={{ color: colors.$3, colorScheme: colors.$0 }}
          id="number"
          value={payment?.number}
          onValueChange={(value) => handleChange('number', value)}
          errorMessage={errors?.errors.number}
        />
      </Element>

      <Element leftSide={t('payment_date')}>
        <InputField
          style={{ color: colors.$3, colorScheme: colors.$0 }}
          id="date"
          type="date"
          value={payment?.date}
          onValueChange={(value) => handleChange('date', value)}
          errorMessage={errors?.errors.date}
        />
      </Element>

      <Element leftSide={t('payment_type')}>
        <SelectField
          style={{ color: colors.$3, colorScheme: colors.$0 }}
          id="type_id"
          value={payment?.type_id}
          onValueChange={(value) => handleChange('type_id', value)}
          errorMessage={errors?.errors.type_id}
          withBlank
        >
          {Object.entries(paymentType).map((value: any, index: any) => {
            return (
              <option key={index} value={String(value[0])}>
                {t(value[1])}
              </option>
            );
          })}
        </SelectField>
      </Element>

      <Element leftSide={t('transaction_reference')}>
        <InputField
          style={{ color: colors.$3, colorScheme: colors.$0 }}
          id="transaction_reference"
          onValueChange={(value) =>
            handleChange('transaction_reference', value)
          }
          value={payment?.transaction_reference}
          errorMessage={errors?.errors.transaction_reference}
        />
      </Element>

      <Element leftSide={t('private_notes')}>
        <InputField
          style={{ color: colors.$3, colorScheme: colors.$0 }}
          element="textarea"
          id="private_notes"
          value={payment?.private_notes}
          onValueChange={(value) => handleChange('private_notes', value)}
          errorMessage={errors?.errors.private_notes}
        />
      </Element>

      {company?.custom_fields?.payment1 && (
        <CustomField
          field="custom_value1"
          defaultValue={payment?.custom_value1}
          value={company?.custom_fields?.payment1}
          onValueChange={(value) =>
            handleChange('custom_value1', value.toString())
          }
        />
      )}

      {company?.custom_fields?.payment2 && (
        <CustomField
          field="custom_value2"
          defaultValue={payment?.custom_value2}
          value={company?.custom_fields?.payment2}
          onValueChange={(value) =>
            handleChange('custom_value2', value.toString())
          }
        />
      )}

      {company?.custom_fields?.payment3 && (
        <CustomField
          field="custom_value3"
          defaultValue={payment?.custom_value3}
          value={company?.custom_fields?.payment3}
          onValueChange={(value) =>
            handleChange('custom_value3', value.toString())
          }
        />
      )}

      {company?.custom_fields?.payment4 && (
        <CustomField
          field="custom_value4"
          defaultValue={payment?.custom_value4}
          value={company?.custom_fields?.payment4}
          onValueChange={(value) =>
            handleChange('custom_value4', value.toString())
          }
        />
      )}

      <Element leftSide={t('convert_currency')}>
        <Toggle
          style={{ color: colors.$3, colorScheme: colors.$0 }}
          checked={Boolean(payment?.exchange_currency_id)}
          onChange={(value) => {
            setConvertCurrency(value);

            if (!value) {
              handleChange('exchange_currency_id', '');
              handleChange('exchange_rate', 1);
            }
          }}
        />
      </Element>

      {payment &&
        (Boolean(payment?.exchange_currency_id) || convertCurrency) && (
          <ConvertCurrency
            exchangeRate={payment.exchange_rate.toString() || '1'}
            exchangeCurrencyId={payment.exchange_currency_id || '1'}
            currencyId={payment.currency_id || '1'}
            amount={payment?.amount}
            onChange={(exchangeRate, exchangeCurrencyId) => {
              handleChange('exchange_rate', exchangeRate);
              handleChange('exchange_currency_id', exchangeCurrencyId);
            }}
            onExchangeRateChange={(value) =>
              handleChange('exchange_rate', value)
            }
          />
        )}
    </Card>
  );
}
