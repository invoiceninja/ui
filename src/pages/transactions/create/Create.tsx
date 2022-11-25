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
import { transactionTypes } from 'common/constants/transactions';
import { useCurrencies } from 'common/hooks/useCurrencies';
import { useTitle } from 'common/hooks/useTitle';
import { date, endpoint } from 'common/helpers';
import { TransactionInput } from 'common/interfaces/transactions';
import { Container } from 'components/Container';
import { DebouncedCombobox } from 'components/forms/DebouncedCombobox';
import { Default } from 'components/layouts/Default';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TransactionValidation } from '../common/validation/ValidationInterface';
import { request } from 'common/helpers/request';
import { useNavigate } from 'react-router-dom';
import { route } from 'common/helpers/route';
import { toast } from 'common/helpers/toast/toast';
import { AxiosError } from 'axios';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { DecimalNumberInput } from 'components/forms/DecimalNumberInput';
import { useResolveCurrency } from 'common/hooks/useResolveCurrency';
import { DecimalInputSeparators } from 'common/interfaces/decimal-number-input-separators';
import { ApiTransactionType, TransactionType } from 'common/enums/transactions';

export function Create() {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const currencies = useCurrencies();

  const company = useCurrentCompany();

  const resolveCurrency = useResolveCurrency();

  const { documentTitle } = useTitle('new_transaction');

  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [currencySeparators, setCurrencySeparators] = useState<
    DecimalInputSeparators | undefined
  >();

  const [errors, setErrors] = useState<TransactionValidation>();

  const [transaction, setTransaction] = useState<TransactionInput>();

  const pages = [
    { name: t('transactions'), href: '/transactions' },
    { name: t('new_transaction'), href: '/transactions/create' },
  ];

  const getCurrencySeparators = (currencyId: string) => {
    const currency = resolveCurrency(currencyId) || currencies[0];
    return {
      decimalSeparator: currency?.decimal_separator,
      precision: currency?.precision,
      thousandSeparator: currency?.thousand_separator,
    };
  };

  const handleChange = (
    property: keyof TransactionInput,
    value: TransactionInput[keyof TransactionInput]
  ) => {
    if (property === 'currency_id') {
      setCurrencySeparators(getCurrencySeparators(value?.toString() || ''));
    }

    setTransaction((prevState) => ({ ...prevState, [property]: value }));
  };

  const onSave = async (event: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    setErrors(undefined);

    setIsSaving(true);

    toast.processing();

    try {
      await request('POST', endpoint('/api/v1/bank_transactions'), {
        ...transaction,
        amount: Number(transaction?.amount),
        base_type:
          transaction?.base_type === TransactionType.Deposit
            ? ApiTransactionType.Credit
            : ApiTransactionType.Debit,
      });
      toast.success(t('created_transaction'));
      setIsSaving(false);
      navigate(route('/transactions'));
    } catch (error) {
      setIsSaving(false);
      const axiosError = error as AxiosError;
      console.error(axiosError);

      if (axiosError?.response?.status === 422) {
        setErrors(axiosError?.response?.data?.errors);
        toast.dismiss();
      } else {
        toast.error(t('error_title'));
      }
    }
  };

  useEffect(() => {
    setTransaction((prevState) => ({
      ...prevState,
      base_type: TransactionType.Deposit,
      currency_id: company?.settings?.currency_id,
      date: date(new Date().toString(), 'YYYY-MM-DD'),
      amount: 0,
    }));
    setCurrencySeparators(getCurrencySeparators(currencies[0]?.id));
  }, [currencies]);

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
              errorMessage={errors?.base_type}
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
              errorMessage={errors?.date}
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
              errorMessage={errors?.amount}
            />
          </Element>
          <Element required leftSide={t('currency')}>
            <SelectField
              value={transaction?.currency_id}
              onValueChange={(value) => handleChange('currency_id', value)}
              errorMessage={errors?.currency_id}
            >
              {currencies?.map(({ id, name }) => (
                <option key={id} value={id}>
                  {t(name)}
                </option>
              ))}
            </SelectField>
          </Element>
          <Element required leftSide={t('bank_account')}>
            <DebouncedCombobox
              endpoint="/api/v1/bank_integrations"
              label="bank_account_name"
              defaultValue={transaction?.bank_integration_id}
              onChange={(value) =>
                handleChange('bank_integration_id', value?.value)
              }
              clearButton
              onClearButtonClick={() => handleChange('bank_integration_id', '')}
              errorMessage={errors?.bank_integration_id}
              actionLabel={t('new_bank_account')}
              onActionClick={() =>
                navigate(route('/settings/bank_accounts/create'))
              }
            />
          </Element>
          <Element required leftSide={t('description')}>
            <InputField
              element="textarea"
              value={transaction?.description}
              onValueChange={(value) => handleChange('description', value)}
              errorMessage={errors?.description}
            />
          </Element>
        </Card>
      </Container>
    </Default>
  );
}
