/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState, useEffect } from 'react';
import { useTitle } from 'common/hooks/useTitle';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  TransactionDetails,
  TransactionResponse,
} from 'common/interfaces/transactions';
import { Details } from '../components/Details';
import { useTransactionQuery } from '../common/queries';
import { route } from 'common/helpers/route';
import { Default } from 'components/layouts/Default';

export function Transaction() {
  useTitle('transaction_details');

  const { id } = useParams();

  const [t] = useTranslation();

  const { data: response } = useTransactionQuery({ id });

  const [transaction, setTransaction] = useState<TransactionDetails>();

  const pages = [
    { name: t('transactions'), href: '/transactions' },
    {
      name: t('transaction_details'),
      href: route('/transactions/:id', { id }),
    },
  ];

  const getTransactionDetailsObject = (
    responseDetails: TransactionResponse | undefined
  ) => {
    const {
      date = '',
      amount = 0,
      currency_id = '',
      base_type = '',
      id = '',
      bank_integration_id = '',
      invoice_ids = '',
      status_id = '',
      ninja_category_id = '',
      vendor_id = '',
      expense_id = '',
    } = responseDetails || {};
    return {
      id,
      date,
      amount,
      currency_id,
      base_type,
      bank_integration_id,
      invoice_ids,
      status_id,
      ninja_category_id,
      vendor_id,
      expense_id,
    };
  };

  useEffect(() => {
    setTransaction(getTransactionDetailsObject(response));
  }, [response]);

  return (
    <Default
      title={t('transaction_details')}
      breadcrumbs={pages}
      docsLink="docs/basic-settings/#transaction_details"
    >
      <Details transactionDetails={transaction} />
    </Default>
  );
}
