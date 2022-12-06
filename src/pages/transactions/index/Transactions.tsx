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
import { DataTable } from 'components/DataTable';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { useTransactionColumns } from '../common/hooks/useTransactionColumns';
import { ImportButton } from 'components/import/ImportButton';
import { useEffect, useState } from 'react';
import { Details } from '../components/Details';
import { Slider } from 'components/cards/Slider';
import { Transaction } from 'common/interfaces/transactions';

export function Transactions() {
  useTitle('transactions');

  const [t] = useTranslation();

  const columns = useTransactionColumns();

  const pages = [{ name: t('transactions'), href: '/transactions' }];

  const [transactionId, setTransactionId] = useState<string>('');

  const [isTransactionSliderVisible, setIsTransactionSliderVisible] =
    useState<boolean>(false);

  const getSelectedTransaction = (transaction: Transaction) => {
    setTransactionId(transaction.id);
  };

  useEffect(() => {
    if (transactionId) {
      setIsTransactionSliderVisible(true);
    }
  }, [transactionId]);

  return (
    <>
      <Slider
        title={t('transaction_details')}
        visible={isTransactionSliderVisible}
        setVisible={setIsTransactionSliderVisible}
        size="large"
      >
        <Details
          transactionId={transactionId}
          setTransactionId={setTransactionId}
          setSliderVisible={setIsTransactionSliderVisible}
        />
      </Slider>
      <Default
        title={t('transactions')}
        breadcrumbs={pages}
        docsLink="docs/transactions/"
      >
        <DataTable
          resource="transaction"
          endpoint="/api/v1/bank_transactions"
          columns={columns}
          linkToCreate="/transactions/create"
          linkToEdit="/transactions/:id/edit"
          onTableRowClick={getSelectedTransaction}
          rightSide={<ImportButton route="/transactions/import" />}
          withResourcefulActions
        />
      </Default>
    </>
  );
}
