/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from 'common/hooks/useTitle';
import { TransactionRule } from 'common/interfaces/transaction-rules';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useBlankTransactionRuleQuery } from 'common/queries/transaction-rules';
import { Settings } from 'components/layouts/Settings';
import { Spinner } from 'components/Spinner';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TransactionRuleForm } from '../components/TransactionRuleForm';

export function Create() {
  const [t] = useTranslation();

  useTitle('new_transaction_rule');

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

  const [errors, setErrors] = useState<ValidationBag>();

  useEffect(() => {
    if (blankTransactionRule) {
      setTransactionRule({ ...blankTransactionRule, matches_on_all: true });
    }
  }, [blankTransactionRule]);

  return (
    <Settings
      title={t('new_transaction_rule')}
      breadcrumbs={pages}
      docsLink="docs/basic-settings/#create_bank_account"
      //onSaveClick={handleSave}
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
