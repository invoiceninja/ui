/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { InputField, SelectField } from '@invoiceninja/forms';
import paymentType from 'common/constants/payment-type';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useTitle } from 'common/hooks/useTitle';
import { Payment } from 'common/interfaces/payment';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { usePaymentQuery } from 'common/queries/payments';
import { Divider } from 'components/cards/Divider';
import { ConvertCurrency } from 'components/ConvertCurrency';
import { CustomField } from 'components/CustomField';
import Toggle from 'components/forms/Toggle';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useSave } from './hooks/useSave';
import { PaymentOverview } from './PaymentOverview';
import { ClientCard } from 'pages/clients/show/components/ClientCard';

export function Edit() {
  const { documentTitle } = useTitle('edit_payment');

  const [t] = useTranslation();
  const [errors, setErrors] = useState<ValidationBag>();
  const [payment, setPayment] = useState<Payment>();
  const [convertCurrency, setConvertCurrency] = useState(false);

  const { id } = useParams();
  const { data } = usePaymentQuery({ id });

  const company = useCurrentCompany();

  useEffect(() => {
    if (data?.data.data) {
      const payment: Payment = { ...data.data.data };
      delete payment.documents;

      setPayment(payment);
    }
  }, [data]);

  const handleChange = <
    TField extends keyof Payment,
    TValue extends Payment[TField]
  >(
    field: TField,
    value: TValue
  ) => {
    setPayment((current) => current && { ...current, [field]: value });
  };

  const onSave = useSave(setErrors);

  return (
    <Card
      title={documentTitle}
      withSaveButton
      onFormSubmit={(event) => {
        event.preventDefault();

        payment && onSave(payment);
      }}
    >
      {payment?.client && <ClientCard client={payment.client}/>}
      {payment && <PaymentOverview payment={payment} />}

      <Divider />

      <Element leftSide={t('payment_number')}>
        <InputField
          id="number"
          value={payment?.number}
          onValueChange={(value) => handleChange('number', value)}
          errorMessage={errors?.errors.payment_amount}
        />
      </Element>

      <Element leftSide={t('payment_date')}>
        <InputField
          id="date"
          type="date"
          value={payment?.date}
          onValueChange={(value) => handleChange('date', value)}
          errorMessage={errors?.errors.date}
        />
      </Element>

      <Element leftSide={t('payment_type')}>
        <SelectField
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
          onChange={(value) => handleChange('custom_value1', value.toString())}
        />
      )}

      {company?.custom_fields?.payment2 && (
        <CustomField
          field="custom_value2"
          defaultValue={payment?.custom_value2}
          value={company?.custom_fields?.payment2}
          onChange={(value) => handleChange('custom_value2', value.toString())}
        />
      )}

      {company?.custom_fields?.payment3 && (
        <CustomField
          field="custom_value3"
          defaultValue={payment?.custom_value3}
          value={company?.custom_fields?.payment3}
          onChange={(value) => handleChange('custom_value3', value.toString())}
        />
      )}

      {company?.custom_fields?.payment4 && (
        <CustomField
          field="custom_value4"
          defaultValue={payment?.custom_value4}
          value={company?.custom_fields?.payment4}
          onChange={(value) => handleChange('custom_value4', value.toString())}
        />
      )}

      <Element leftSide={t('convert_currency')}>
        <Toggle
          checked={Boolean(payment?.exchange_currency_id)}
          onChange={(value) => {
            setConvertCurrency(value);

            handleChange('exchange_currency_id', '');
            handleChange('exchange_rate', 1);
          }}
        />
      </Element>

      {convertCurrency && payment && (
        <ConvertCurrency
          exchangeRate={payment.exchange_rate.toString() || '1'}
          exchangeCurrencyId={payment.exchange_currency_id || '1'}
          currencyId={payment.currency_id || '1'}
          amount={payment?.amount}
          onChange={(exchangeRate, exchangeCurrencyId) => {
            handleChange('exchange_rate', exchangeRate);
            handleChange('exchange_currency_id', exchangeCurrencyId);
          }}
          onExchangeRateChange={(value) => handleChange('exchange_rate', value)}
        />
      )}
    </Card>
  );
}
