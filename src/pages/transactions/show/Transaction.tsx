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
import { Settings } from 'components/layouts/Settings';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useTransactionPages } from '../common/hooks/useTransactionPages';
import { Details } from '../components/index';
import { TransactionDetails } from 'common/interfaces/transactions';
import { request } from 'common/helpers/request';
import { endpoint } from 'common/helpers';

const BankAccountDetails = () => {
  useTitle('transaction_details');
  const { id } = useParams();
  const [t] = useTranslation();
  const pages = useTransactionPages();

  const [transaction, setTransaction] = useState<
    TransactionDetails | undefined
  >(undefined);

  const getTransactionDetailsObject = (
    responseDetails: any
  ): TransactionDetails => {
    const { date, amount, currency_id } = responseDetails || {};
    return {
      date,
      amount,
      currency_id,
    };
  };

  const fetchTransactionDetails = async () => {
    const response = await request(
      'GET',
      endpoint('/api/v1/bank_transactions/:id', { id })
    );
    setTransaction(getTransactionDetailsObject(response?.data?.data));
  };

  useEffect(() => {
    fetchTransactionDetails();
  }, [id]);

  return (
    <Settings
      title={t('transaction_details')}
      breadcrumbs={pages}
      docsLink="docs/basic-settings/#transaction_details"
    >
      <Details transactionDetails={transaction} />
    </Settings>
  );
};

export default BankAccountDetails;
