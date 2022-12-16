/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { FormEvent, useEffect } from 'react';
import { Card, Element } from '@invoiceninja/cards';
import { InputField, SelectField } from '@invoiceninja/forms';
import { transactionTypes } from 'common/constants/transactions';
import { useCurrencies } from 'common/hooks/useCurrencies';
import { useTitle } from 'common/hooks/useTitle';
import { endpoint } from 'common/helpers';
import {
  TransactionInput,
  TransactionResponse,
} from 'common/interfaces/transactions';
import { Container } from 'components/Container';
import { Default } from 'components/layouts/Default';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TransactionValidation } from '../common/validation/ValidationInterface';
import { request } from 'common/helpers/request';
import { useNavigate, useParams } from 'react-router-dom';
import { route } from 'common/helpers/route';
import { toast } from 'common/helpers/toast/toast';
import { AxiosError } from 'axios';
import { useTransactionQuery } from '../common/queries';
import { DecimalNumberInput } from 'components/forms/DecimalNumberInput';
import { DecimalInputSeparators } from 'common/interfaces/decimal-number-input-separators';
import { useResolveCurrency } from 'common/hooks/useResolveCurrency';
import { ApiTransactionType, TransactionType } from 'common/enums/transactions';
import { BankAccountSelector } from '../components/BankAccountSelector';
import { GenericValidationBag } from 'common/interfaces/validation-bag';
import { useQueryClient } from 'react-query';

export function Edit() {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const { id } = useParams<string>();

  const currencies = useCurrencies();

  const resolveCurrency = useResolveCurrency();

  const queryClient = useQueryClient();

  const { documentTitle } = useTitle('edit_transaction');

  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [errors, setErrors] =
    useState<GenericValidationBag<TransactionValidation>>();

  const { data: response } = useTransactionQuery({ id });

  const [transaction, setTransaction] = useState<TransactionInput>({
    bank_integration_id: '',
    amount: 0,
    base_type: '',
    currency_id: '',
    date: '',
    description: '',
  });

  const [currencySeparators, setCurrencySeparators] =
    useState<DecimalInputSeparators>();

  const pages = [
    { name: t('transactions'), href: '/transactions' },
    {
      name: t('edit_transaction'),
      href: route('/transactions/:id/edit', { id }),
    },
  ];

  const getCurrencySeparators = (currencyId: string) => {
    const currency = resolveCurrency(currencyId) || currencies[0];
    return {
      decimalSeparator: currency?.decimal_separator,
      precision: currency?.precision,
      thousandSeparator: currency?.thousand_separator,
    };
  };

  const getTransactionInputObject = (
    responseDetails: TransactionResponse | undefined
  ) => {
    const { date, amount, currency_id, bank_integration_id, description } =
      responseDetails || {};
    setCurrencySeparators(getCurrencySeparators(currency_id || ''));
    return {
      base_type:
        responseDetails?.base_type === ApiTransactionType.Credit
          ? TransactionType.Deposit
          : TransactionType.Withdrawal,
      date: date || '',
      amount: amount || 0,
      currency_id: currency_id || '',
      bank_integration_id: bank_integration_id || '',
      description: description || '',
    };
  };

  const handleChange = (
    property: keyof TransactionInput,
    value: TransactionInput[keyof TransactionInput]
  ) => {
    setErrors(undefined);

    if (property === 'currency_id') {
      setCurrencySeparators(getCurrencySeparators(value?.toString() || ''));
    }

    setTransaction((prevState) => ({ ...prevState, [property]: value }));
  };

  const onSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrors(undefined);
    setIsSaving(true);
    toast.processing();

    request('PUT', endpoint('/api/v1/bank_transactions/:id', { id }), {
      ...transaction,
      amount: Number(transaction.amount),
      base_type:
        transaction.base_type === TransactionType.Deposit
          ? ApiTransactionType.Credit
          : ApiTransactionType.Debit,
    })
      .then(() => {
        toast.success('updated_transaction');

        queryClient.invalidateQueries('/api/v1/bank_transactions');

        queryClient.invalidateQueries(
          route('/api/v1/bank_transactions/:id', { id })
        );

        navigate('/transactions');
      })
      .catch(
        (error: AxiosError<GenericValidationBag<TransactionValidation>>) => {
          if (error.response?.status === 422) {
            setErrors(error.response.data);
            toast.dismiss();
          } else {
            console.error(error);
            toast.error();
          }
        }
      )
      .finally(() => setIsSaving(false));
  };

  useEffect(() => {
    setTransaction(getTransactionInputObject(response));
  }, [response, currencies]);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onBackClick="/transactions"
    >
      <Container>
        <Card
          title={documentTitle}
          withSaveButton
          onSaveClick={onSave}
          disableSubmitButton={isSaving}
        >
          <Element required leftSide={t('type')}>
            <SelectField
              value={transaction?.base_type}
              onValueChange={(value) => handleChange('base_type', value)}
              errorMessage={errors?.errors?.base_type}
            >
              {Object.values(transactionTypes).map((transactionType) => (
                <option key={transactionType} value={transactionType}>
                  {t(transactionType)}
                </option>
              ))}
            </SelectField>
          </Element>

          <Element required leftSide={t('date')}>
            <InputField
              type="date"
              value={transaction?.date}
              onValueChange={(value) => handleChange('date', value)}
              errorMessage={errors?.errors?.date}
            />
          </Element>

          <Element required leftSide={t('amount')}>
            <DecimalNumberInput
              border
              precision={currencySeparators?.precision}
              currency={currencySeparators}
              className="auto"
              initialValue={transaction?.amount?.toString()}
              value={transaction?.amount?.toString()}
              onChange={(value: string) => handleChange('amount', value)}
              errorMessage={errors?.errors?.amount}
            />
          </Element>

          <Element required leftSide={t('currency')}>
            <SelectField
              defaultValue={transaction?.currency_id}
              value={transaction?.currency_id}
              onValueChange={(value) => handleChange('currency_id', value)}
              errorMessage={errors?.errors?.currency_id}
            >
              {currencies?.map(({ id, name }) => (
                <option key={id} value={id}>
                  {t(name)}
                </option>
              ))}
            </SelectField>
          </Element>

          <Element required leftSide={t('bank_account')}>
            <BankAccountSelector
              value={transaction.bank_integration_id}
              onChange={(value) =>
                handleChange('bank_integration_id', value?.id)
              }
            />
          </Element>

          <Element required leftSide={t('description')}>
            <InputField
              element="textarea"
              value={transaction?.description}
              onValueChange={(value) => handleChange('description', value)}
              errorMessage={errors?.errors?.description}
            />
          </Element>
        </Card>
      </Container>
    </Default>
  );
}
