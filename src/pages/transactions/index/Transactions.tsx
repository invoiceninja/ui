/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from '$app/common/hooks/useTitle';
import { DataTable } from '$app/components/DataTable';
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { useTransactionColumns } from '../common/hooks/useTransactionColumns';
import { ImportButton } from '$app/components/import/ImportButton';
import { useState } from 'react';
import { Details } from '../components/Details';
import { Slider } from '$app/components/cards/Slider';
import { Transaction } from '$app/common/interfaces/transactions';
import { useTransactionFilters } from '../common/hooks/useTransactionFilters';

export function Transactions() {
  useTitle('transactions');

  const [t] = useTranslation();

  const columns = useTransactionColumns();

  const filters = useTransactionFilters();

  const pages = [{ name: t('transactions'), href: '/transactions' }];

  const [transactionId, setTransactionId] = useState<string>('');

  const [sliderTitle, setSliderTitle] = useState<string>();

  const getSelectedTransaction = (transaction: Transaction) => {
    setTransactionId(transaction.id);

    if (transaction.description) {
      let cutDescription = transaction.description;
      if (transaction.description.length > 35) {
        cutDescription = cutDescription.slice(0, 35).concat('...');
      }
      setSliderTitle(cutDescription);
    } else {
      setSliderTitle(transaction.date);
    }
  };

  return (
    <>
      <Slider
        title={sliderTitle}
        visible={Boolean(transactionId)}
        onClose={() => setTransactionId('')}
        size="large"
      >
        <Details
          transactionId={transactionId}
          setTransactionId={setTransactionId}
        />
      </Slider>

      <Default
        title={t('transactions')}
        breadcrumbs={pages}
        docsLink="docs/transactions/"
      >
        <DataTable
          resource="transaction"
          endpoint="/api/v1/bank_transactions?sort=id|desc"
          bulkRoute="/api/v1/bank_transactions/bulk"
          columns={columns}
          linkToCreate="/transactions/create"
          linkToEdit="/transactions/:id/edit"
          onTableRowClick={getSelectedTransaction}
          customFilters={filters}
          customFilterQueryKey="client_status"
          customFilterPlaceholder="status"
          rightSide={<ImportButton route="/transactions/import" />}
          withResourcefulActions
        />
      </Default>
    </>
  );
}
