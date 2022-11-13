/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect } from 'react';
import { Card, Element } from '@invoiceninja/cards';
import { InputField, SelectField } from '@invoiceninja/forms';
import {
  defaultTransactionProperties,
  transactionTypes,
} from 'common/constants/transactions';
import { useCurrencies } from 'common/hooks/useCurrencies';
import { useTitle } from 'common/hooks/useTitle';
import { endpoint } from 'common/helpers';
import { TransactionInput } from 'common/interfaces/transactions';
import { Container } from 'components/Container';
import { DebouncedCombobox } from 'components/forms/DebouncedCombobox';
import { Default } from 'components/layouts/Default';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTransactionPages } from '../common/hooks/useTransactionPages';
import { useTransactionValidation } from '../common/hooks/useTransactionValidation';
import { TransactionValidation } from '../common/validation/ValidationInterface';
import { request } from 'common/helpers/request';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { route } from 'common/helpers/route';

const Edit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<string>();
  const currencies = useCurrencies();
  const pages = useTransactionPages();
  const { documentTitle } = useTitle('edit_transaction');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errors, setErrors] = useState<TransactionValidation>();
  const [transaction, setTransaction] = useState<TransactionInput>(
    defaultTransactionProperties
  );
  const { checkValidation, setValidation } = useTransactionValidation();

  const getTransactionInputObject = (
    responseDetails: any
  ): TransactionInput => {
    const { date, amount, currency_id, bank_integration_id, description } =
      responseDetails || {};
    return {
      base_type:
        responseDetails?.base_type === 'CREDIT' ? 'deposit' : 'withdrawal',
      date,
      amount,
      currency_id,
      bank_integration_id,
      description,
    };
  };

  const fetchTransactionDetails = async () => {
    const response = await request(
      'GET',
      endpoint('/api/v1/bank_transactions/:id', { id })
    );
    setIsLoading(false);
    setTransaction(getTransactionInputObject(response?.data?.data));
  };

  const handleChange = (
    property: keyof TransactionInput,
    value: unknown
  ): void => {
    setTransaction(
      (transaction) => transaction && { ...transaction, [property]: value }
    );
  };

  const onSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setErrors(undefined);
    const isFormValid = checkValidation(transaction);

    if (!isFormValid && !errors) {
      setValidation(transaction, setErrors, errors);
    }

    if (isFormValid) {
      setIsSaving(true);
      const toastId = toast.loading(t('processing'));
      try {
        await request(
          'PUT',
          endpoint('/api/v1/bank_transactions/:id', { id }),
          {
            ...transaction,
            amount: +transaction?.amount,
            base_type:
              transaction?.base_type === 'deposit' ? 'CREDIT' : 'DEBIT',
          }
        );
        toast.success(t('updated_transaction'), { id: toastId });
        setIsSaving(false);
        navigate(route('/transactions'));
      } catch (error: any) {
        setIsSaving(false);
        console.error(error);
        if (error.response?.status == 422) {
          setErrors(error.response.data);
        }
        toast.error(t('error_title'), { id: toastId });
      }
    }
  };

  useEffect(() => {
    fetchTransactionDetails();
  }, [id]);

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
          disableSubmitButton={isSaving || isLoading}
        >
          <Element required leftSide={t('type')}>
            <SelectField
              value={transaction?.base_type}
              onValueChange={(e) => handleChange('base_type', e)}
              errorMessage={errors?.type}
            >
              {transactionTypes?.map(({ id, key }) => (
                <option key={id} value={key}>
                  {t(`${key}`)}
                </option>
              ))}
            </SelectField>
          </Element>
          <Element required leftSide={t('date')}>
            <InputField
              type="date"
              value={transaction?.date}
              onValueChange={(e) => handleChange('date', e)}
              errorMessage={errors?.date}
            />
          </Element>
          <Element required leftSide={t('amount')}>
            <InputField
              type="number"
              value={transaction?.amount}
              onValueChange={(e) => handleChange('amount', e)}
            />
          </Element>
          <Element required leftSide={t('currency')}>
            <SelectField
              defaultValue={transaction?.currency_id}
              value={transaction?.currency_id}
              onValueChange={(e) => handleChange('currency_id', e)}
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
                handleChange('bank_integration_id', value?.resource?.id)
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
              onValueChange={(e) => handleChange('description', e)}
              errorMessage={errors?.description}
            />
          </Element>
        </Card>
      </Container>
    </Default>
  );
};

export default Edit;
