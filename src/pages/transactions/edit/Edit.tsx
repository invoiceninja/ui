/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '$app/components/cards';
import { useTitle } from '$app/common/hooks/useTitle';
import { endpoint } from '$app/common/helpers';
import { Transaction } from '$app/common/interfaces/transactions';
import { Container } from '$app/components/Container';
import { Default } from '$app/components/layouts/Default';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { request } from '$app/common/helpers/request';
import { useParams } from 'react-router-dom';
import { toast } from '$app/common/helpers/toast/toast';
import { AxiosError } from 'axios';
import { DecimalInputSeparators } from '$app/common/interfaces/decimal-number-input-separators';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useResolveCurrencySeparator } from '../common/hooks/useResolveCurrencySeparator';
import { TransactionForm } from '../components/TransactionForm';
import { useHandleChange } from '../common/hooks/useHandleChange';
import { route } from '$app/common/helpers/route';
import { ResourceActions } from '$app/components/ResourceActions';
import { useActions } from '../common/hooks/useActions';
import { useTransactionQuery } from '$app/common/queries/transactions';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { useCleanDescriptionText } from '../common/hooks/useCleanDescription';

export default function Edit() {
  const [t] = useTranslation();

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();
  const cleanDescriptionText = useCleanDescriptionText();

  const { id } = useParams<string>();

  const { data } = useTransactionQuery({ id });

  const actions = useActions();

  const resolveCurrencySeparator = useResolveCurrencySeparator();

  const { documentTitle } = useTitle('edit_transaction');

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const [currencySeparators, setCurrencySeparators] =
    useState<DecimalInputSeparators>();

  const [errors, setErrors] = useState<ValidationBag>();

  const [transaction, setTransaction] = useState<Transaction>();

  const handleChange = useHandleChange({
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

  const onSave = async () => {
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

        $refetch(['bank_transactions']);
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          setErrors(error.response.data);
          toast.dismiss();
        }
      })
      .finally(() => setIsFormBusy(false));
  };

  useEffect(() => {
    if (data) {
      setTransaction({
        ...data,
        description: cleanDescriptionText(data.description),
      });
    }
  }, [data]);

  useEffect(() => {
    if (transaction) {
      const resolvedCurrencySeparator = resolveCurrencySeparator(
        transaction.currency_id
      );

      if (resolvedCurrencySeparator) {
        setCurrencySeparators(resolvedCurrencySeparator);
      }
    }
  }, [transaction]);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      {...((hasPermission('edit_bank_transaction') ||
        entityAssigned(transaction)) &&
        transaction && {
          navigationTopRight: (
            <ResourceActions
              resource={transaction}
              actions={actions}
              onSaveClick={onSave}
              disableSaveButton={!transaction || isFormBusy}
              cypressRef="transactionActionDropdown"
            />
          ),
        })}
    >
      <Container>
        <Card title={documentTitle}>
          {transaction && currencySeparators && (
            <TransactionForm
              page="edit"
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
