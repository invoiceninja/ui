/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '@invoiceninja/cards';
import { useTitle } from 'common/hooks/useTitle';
import { endpoint } from 'common/helpers';
import { Transaction } from 'common/interfaces/transactions';
import { Container } from 'components/Container';
import { Default } from 'components/layouts/Default';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { request } from 'common/helpers/request';
import { useNavigate } from 'react-router-dom';
import { toast } from 'common/helpers/toast/toast';
import { AxiosError } from 'axios';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { DecimalInputSeparators } from 'common/interfaces/decimal-number-input-separators';
import { ApiTransactionType } from 'common/enums/transactions';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useBlankTransactionQuery } from '../common/queries';
import { useResolveCurrencySeparator } from '../common/hooks/useResolveCurrencySeparator';
import { TransactionForm } from '../components/TransactionForm';
import { useHandleChange } from '../common/hooks/useHandleChange';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { route } from 'common/helpers/route';
import { useQueryClient } from 'react-query';

export function Create() {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const company = useCurrentCompany();

  const { data } = useBlankTransactionQuery();

  const queryClient = useQueryClient();

  const resolveCurrencySeparator = useResolveCurrencySeparator();

  const { documentTitle } = useTitle('new_transaction');

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const [currencySeparators, setCurrencySeparators] =
    useState<DecimalInputSeparators>();

  const [errors, setErrors] = useState<ValidationBag>();

  const [transaction, setTransaction] = useState<Transaction>();

  const handleChange = useHandleChange({
    transaction,
    setTransaction,
    setCurrencySeparators,
    setErrors,
  });

  const pages = [
    { name: t('transactions'), href: '/transactions' },
    { name: t('new_transaction'), href: '/transactions/create' },
  ];

  const onSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrors(undefined);

    setIsFormBusy(true);

    toast.processing();

    request('POST', endpoint('/api/v1/bank_transactions'), transaction)
      .then((response: GenericSingleResourceResponse<Transaction>) => {
        toast.success('created_transaction');

        queryClient.invalidateQueries('/api/v1/bank_transactions');

        navigate(
          route('/transactions/:id/edit', { id: response.data.data.id })
        );
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          setErrors(error.response.data);
          toast.dismiss();
        } else {
          console.error(error);
          toast.error();
        }
      })
      .finally(() => setIsFormBusy(false));
  };

  useEffect(() => {
    if (!transaction) {
      if (data) {
        setTransaction({
          ...data,
          base_type: ApiTransactionType.Credit,
          currency_id: company?.settings.currency_id,
        });
      }
    } else {
      const resolvedCurrencySeparator = resolveCurrencySeparator(
        transaction.currency_id
      );

      if (resolvedCurrencySeparator) {
        setCurrencySeparators(resolvedCurrencySeparator);
      }
    }
  }, [company, transaction, data]);

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
          disableSubmitButton={isFormBusy}
        >
          {currencySeparators && transaction && (
            <TransactionForm
              errors={errors}
              transaction={transaction}
              handleChange={handleChange}
              currencySeparators={currencySeparators}
            />
          )}
        </Card>
      </Container>
    </Default>
  );
}
