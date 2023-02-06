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
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { toast } from 'common/helpers/toast/toast';
import { useTitle } from 'common/hooks/useTitle';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { TransactionRule } from 'common/interfaces/transaction-rules';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useBlankTransactionRuleQuery } from 'common/queries/transaction-rules';
import { Settings } from 'components/layouts/Settings';
import { Spinner } from 'components/Spinner';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { TransactionRuleForm } from '../components/TransactionRuleForm';

export function Create() {
  const [t] = useTranslation();

  useTitle('new_transaction_rule');

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
      name: t('new_transaction_rule'),
      href: '/settings/bank_accounts/transaction_rules/create',
    },
  ];

  const { data: blankTransactionRule } = useBlankTransactionRuleQuery();

  const [transactionRule, setTransactionRule] = useState<TransactionRule>();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const [errors, setErrors] = useState<ValidationBag>();

  useEffect(() => {
    if (blankTransactionRule) {
      setTransactionRule({
        ...blankTransactionRule,
        matches_on_all: true,
        applies_to: 'DEBIT',
      });
    }
  }, [blankTransactionRule]);

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormBusy) {
      toast.processing();
      setErrors(undefined);
      setIsFormBusy(true);

      request(
        'POST',
        endpoint('/api/v1/bank_transaction_rules'),
        transactionRule
      )
        .then((response: GenericSingleResourceResponse<TransactionRule>) => {
          toast.success('created_transaction_rule');

          queryClient.invalidateQueries('/api/v1/bank_transaction_rules');

          navigate(
            route('/settings/bank_accounts/transaction_rules/:id/edit', {
              id: response.data.data.id,
            })
          );
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            toast.dismiss();
            setErrors(error.response.data);
          } else {
            console.error(error);
            toast.error();
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  return (
    <Settings
      title={t('new_transaction_rule')}
      breadcrumbs={pages}
      docsLink="docs/basic-settings/#create_transaction_rule"
      disableSaveButton={!transactionRule || isFormBusy}
      onSaveClick={handleSave}
    >
      {transactionRule ? (
        <TransactionRuleForm
          page="create"
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
