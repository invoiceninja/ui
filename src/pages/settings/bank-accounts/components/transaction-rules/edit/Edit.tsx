/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useTitle } from '$app/common/hooks/useTitle';
import { TransactionRule } from '$app/common/interfaces/transaction-rules';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useTransactionRuleQuery } from '$app/common/queries/transaction-rules';
import { Settings } from '$app/components/layouts/Settings';
import { Spinner } from '$app/components/Spinner';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { TransactionRuleForm } from '../components/TransactionRuleForm';

export function Edit() {
  const [t] = useTranslation();

  useTitle('edit_transaction_rule');

  const { id } = useParams();

  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('bank_accounts'), href: '/settings/bank_accounts' },
    {
      name: t('transaction_rules'),
      href: '/settings/bank_accounts/transaction_rules',
    },
    {
      name: t('edit_transaction_rule'),
      href: route('/settings/bank_accounts/transaction_rules/:id/edit', { id }),
    },
  ];

  const { data: transactionRuleResponse } = useTransactionRuleQuery({ id });

  const [transactionRule, setTransactionRule] = useState<TransactionRule>();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const [errors, setErrors] = useState<ValidationBag>();

  useEffect(() => {
    if (transactionRuleResponse) {
      setTransactionRule(transactionRuleResponse);
    }
  }, [transactionRuleResponse]);

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormBusy) {
      toast.processing();
      setErrors(undefined);
      setIsFormBusy(true);

      request(
        'PUT',
        endpoint('/api/v1/bank_transaction_rules/:id', { id }),
        transactionRule
      )
        .then(() => {
          toast.success('updated_transaction_rule');

          queryClient.invalidateQueries('/api/v1/bank_transaction_rules');

          queryClient.invalidateQueries(
            route('/api/v1/bank_transaction_rules/:id', { id })
          );

          navigate('/settings/bank_accounts/transaction_rules');
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            toast.dismiss();
            setErrors(error.response.data);
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  return (
    <Settings
      title={t('edit_transaction_rule')}
      breadcrumbs={pages}
      docsLink="en/basic-settings/#edit_transaction_rule"
      disableSaveButton={!transactionRule || isFormBusy}
      onSaveClick={handleSave}
    >
      {transactionRule ? (
        <TransactionRuleForm
          transactionRule={transactionRule}
          setTransactionRule={setTransactionRule}
          errors={errors}
          setErrors={setErrors}
        />
      ) : (
        <Spinner />
      )}
    </Settings>
  );
}
