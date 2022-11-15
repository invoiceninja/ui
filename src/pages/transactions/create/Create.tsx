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
import { useTransactionValidation } from '../common/hooks/useTransactionValidation';
import { toast } from 'common/helpers/toast/toast';
import { AxiosError } from 'axios';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';

export function Create() {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const currencies = useCurrencies();

  const company = useCurrentCompany();

  const formatMoney = useFormatMoney();

  const { documentTitle } = useTitle('new_transaction');

  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [errors, setErrors] = useState<TransactionValidation>();

  const [transaction, setTransaction] = useState<TransactionInput>();

  const { checkValidation, setValidation } = useTransactionValidation();

  const pages = [
    { name: t('transactions'), href: '/transactions' },
    { name: t('new_transaction'), href: '/transactions/create' },
  ];

  const handleChange = (
    property: keyof TransactionInput,
    value: TransactionInput[keyof TransactionInput]
  ) => {
    setTransaction((prevState) => ({ ...prevState, [property]: value }));
  };

  const onSave = async (event: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setErrors(undefined);
    const isFormValid = checkValidation(transaction);

    if (!isFormValid && !errors) {
      setValidation(transaction, setErrors, errors);
    }

    if (isFormValid) {
      setIsSaving(true);
      const toastId = toast.processing();
      try {
        await request('POST', endpoint('/api/v1/bank_transactions'), {
          ...transaction,
          amount: Number(transaction?.amount),
          base_type: transaction?.base_type === 'deposit' ? 'CREDIT' : 'DEBIT',
        });
        toast.success(t('created_transaction'), { id: toastId });
        setIsSaving(false);
        navigate(route('/transactions'));
      } catch (cachedError) {
        const error = cachedError as AxiosError;
        setIsSaving(false);
        console.error(error);
        if (error.response?.status == 422) {
          setErrors(error.response.data);
        }
        toast.error(t('error_title'));
      }
    }
  };

  useEffect(() => {
    setTransaction((prevState) => ({
      ...prevState,
      base_type: 'deposit',
      currency_id: company?.settings?.currency_id,
      date: date(new Date().toString(), 'YYYY-MM-DD'),
    }));
  }, []);

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
              errorMessage={errors?.type}
            >
              {Object.values(transactionTypes).map((transactionType) => (
                <option key={transactionType} value={transactionType}>
                  {t(`${transactionType}`)}
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
            <InputField
              value={formatMoney(
                transaction?.amount || 0,
                company?.settings?.country_id,
                transaction?.currency_id || ''
              )}
              onValueChange={(value) => handleChange('amount', value)}
              errorMessage={errors?.amount}
            />
          </Element>
          <Element required leftSide={t('currency')}>
            <SelectField
              value={transaction?.currency_id}
              onValueChange={(value) => handleChange('currency_id', value)}
              errorMessage={errors?.currency}
            >
              {currencies?.map(({ id, name }) => (
                <option key={id} value={id}>
                  {t(`${name}`)}
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
              errorMessage={errors?.bank_account}
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
