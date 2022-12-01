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
import { ReactNode, useEffect, useState } from 'react';
import { Details } from '../components/Details';
import { CollapseCard } from 'components/cards/CollapseCard';

export function Transactions() {
  useTitle('transactions');

  const [t] = useTranslation();

  const columns = useTransactionColumns();

  const pages = [{ name: t('transactions'), href: '/transactions' }];

  const [transactionId, setTransactionId] = useState<string>('');

  const [actionButton, setActionButton] = useState<ReactNode>();

  const [isTransactionSliderVisible, setIsTransactionSliderVisible] =
    useState<boolean>(false);

  useEffect(() => {
    if (transactionId) {
      setIsTransactionSliderVisible(true);
    }
  }, [transactionId]);

  return (
    <>
      <CollapseCard
        title={t('transaction_details')}
        visible={isTransactionSliderVisible}
        setVisible={setIsTransactionSliderVisible}
        size="large"
        actionElement={actionButton}
      >
        <Details
          transactionId={transactionId}
          setTransactionId={setTransactionId}
          setActionButton={setActionButton}
        />
      </CollapseCard>
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
          setResourceId={setTransactionId}
          rightSide={<ImportButton route="/transactions/import" />}
          withResourcefulActions
        />
      </Default>
    </>
  );
}
