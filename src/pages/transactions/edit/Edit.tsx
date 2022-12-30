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
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'common/helpers/toast/toast';
import { AxiosError } from 'axios';
import { DecimalInputSeparators } from 'common/interfaces/decimal-number-input-separators';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useTransactionQuery } from '../common/queries';
import { useResolveCurrencySeparator } from '../common/hooks/useResolveCurrencySeparator';
import { TransactionForm } from '../components/TransactionForm';
import { useHandleChange } from '../common/hooks/useHandleChange';
import { route } from 'common/helpers/route';
import { useQueryClient } from 'react-query';

export function Edit() {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const { id } = useParams<string>();

  const { data } = useTransactionQuery({ id });

  const queryClient = useQueryClient();

  const resolveCurrencySeparator = useResolveCurrencySeparator();

  const { documentTitle } = useTitle('edit_transaction');

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
    {
      name: t('edit_transaction'),
      href: route('/transactions/:id/edit', { id }),
    },
  ];

  const onSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrors(undefined);

    setIsFormBusy(true);

    toast.processing();

    request(
      'PUT',
      endpoint('/api/v1/bank_transactions/:id', { id }),
      transaction
    )
      .then(() => {
        toast.success('updated_transaction');

        queryClient.invalidateQueries('/api/v1/bank_transactions');

        queryClient.invalidateQueries(
          route('/api/v1/bank_transactions/:id', { id })
        );

        navigate('/transactions');
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
      setTransaction(data);
    } else {
      const resolvedCurrencySeparator = resolveCurrencySeparator(
        transaction.currency_id
      );

      if (resolvedCurrencySeparator) {
        setCurrencySeparators(resolvedCurrencySeparator);
      }
    }
  }, [data, transaction]);

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
          {transaction && currencySeparators && (
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
