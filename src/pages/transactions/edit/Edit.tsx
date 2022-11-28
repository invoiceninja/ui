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
import { DebouncedCombobox } from 'components/forms/DebouncedCombobox';
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
import CreateBankAccountModal from '../components/CreateBankAccountModal';

export function Edit() {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const { id } = useParams<string>();

  const currencies = useCurrencies();

  const resolveCurrency = useResolveCurrency();

  const { documentTitle } = useTitle('edit_transaction');

  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [errors, setErrors] = useState<TransactionValidation>();

  const { data: response } = useTransactionQuery({ id });

  const [transaction, setTransaction] = useState<TransactionInput>({
    bank_integration_id: '',
    amount: 0,
    base_type: '',
    currency_id: '',
    date: '',
    description: '',
  });

  const [isAddNewBankAccountModalOpened, setIsAddNewBankAccountModalOpened] =
    useState<boolean>(false);

  const [currencySeparators, setCurrencySeparators] = useState<
    DecimalInputSeparators | undefined
  >();

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

    if (transaction.bank_integration_id) {
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
          navigate('/transactions');
        })
        .catch((error: AxiosError) => {
          console.error(error);

          if (error?.response?.status === 422) {
            setErrors(error?.response.data.errors);
            toast.dismiss();
          } else {
            toast.error();
          }
        })
        .finally(() => setIsSaving(false));
    } else {
      setErrors((prevState) => ({
        ...prevState,
        bank_integration_id: t('required_field'),
      }));
    }
  };

  useEffect(() => {
    setTransaction(getTransactionInputObject(response));
  }, [response, currencies]);

  return (
    <>
      <CreateBankAccountModal
        isModalOpen={isAddNewBankAccountModalOpened}
        setIsModalOpen={setIsAddNewBankAccountModalOpened}
      />

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
                defaultValue={transaction?.currency_id}
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
                onChange={(value) =>
                  handleChange('bank_integration_id', value?.resource?.id)
                }
                value={transaction?.bank_integration_id}
                clearButton
                onClearButtonClick={() =>
                  handleChange('bank_integration_id', '')
                }
                queryAdditional
                errorMessage={errors?.bank_integration_id}
                actionLabel={t('new_bank_account')}
                onActionClick={() => setIsAddNewBankAccountModalOpened(true)}
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
    </>
  );
}
