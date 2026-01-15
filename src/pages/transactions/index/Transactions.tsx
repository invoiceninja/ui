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
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import {
  date as formatDate,
  isHosted,
  isSelfHosted,
} from '$app/common/helpers';
import { Guard } from '$app/common/guards/Guard';
import { or } from '$app/common/guards/guards/or';
import { permission } from '$app/common/guards/guards/permission';
import { useCustomBulkActions } from '../common/hooks/useCustomBulkActions';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useActions } from '../common/hooks/useActions';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import {
  defaultColumns,
  useAllTransactionColumns,
} from '../common/hooks/useAllTransactionColumns';
import { Button } from '$app/components/forms';
import { useNavigate } from 'react-router-dom';
import { proPlan } from '$app/common/guards/guards/pro-plan';
import { enterprisePlan } from '$app/common/guards/guards/enterprise-plan';
import { Icon } from '$app/components/icons/Icon';
import { MdRuleFolder } from 'react-icons/md';
import { useColorScheme } from '$app/common/colors';

export default function Transactions() {
  useTitle('transactions');

  const [t] = useTranslation();

  const navigate = useNavigate();
  const hasPermission = useHasPermission();

  const pages = [{ name: t('transactions'), href: '/transactions' }];

  const actions = useActions();
  const colors = useColorScheme();
  const filters = useTransactionFilters();
  const columns = useTransactionColumns();
  const customBulkActions = useCustomBulkActions();
  const transactionColumns = useAllTransactionColumns();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const [sliderTitle, setSliderTitle] = useState<string>();
  const [transactionId, setTransactionId] = useState<string>('');

  const getSelectedTransaction = (transaction: Transaction) => {
    setTransactionId(transaction.id);

    if (transaction.description) {
      let cutDescription = transaction.description;
      if (transaction.description.length > 35) {
        cutDescription = cutDescription.slice(0, 35).concat('...');
      }
      setSliderTitle(cutDescription);
    } else {
      setSliderTitle(formatDate(transaction.date, dateFormat));
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
        docsLink="en/transactions/"
      >
        <DataTable
          resource="transaction"
          endpoint="/api/v1/bank_transactions?sort=id|desc&active_banks=true"
          bulkRoute="/api/v1/bank_transactions/bulk"
          columns={columns}
          linkToCreate="/transactions/create"
          linkToEdit="/transactions/:id/edit"
          onTableRowClick={getSelectedTransaction}
          customActions={actions}
          customFilters={filters}
          customBulkActions={customBulkActions}
          customFilterPlaceholder="status"
          rightSide={
            <div className="flex items-center space-x-2">
              {((isHosted() && (proPlan() || enterprisePlan())) ||
                isSelfHosted()) && (
                <Button
                  type="secondary"
                  onClick={() =>
                    navigate('/settings/bank_accounts/transaction_rules')
                  }
                >
                  <span className="mr-2">
                    {
                      <Icon
                        element={MdRuleFolder}
                        size={20}
                        color={colors.$3}
                      />
                    }
                  </span>
                  {t('rules')}
                </Button>
              )}

              <DataTableColumnsPicker
                table="transaction"
                columns={transactionColumns as unknown as string[]}
                defaultColumns={defaultColumns}
              />

              <Guard
                type="component"
                guards={[
                  or(
                    permission('create_bank_transaction'),
                    permission('edit_bank_transaction')
                  ),
                ]}
                component={<ImportButton route="/transactions/import" />}
              />
            </div>
          }
          withResourcefulActions
          linkToCreateGuards={[permission('create_bank_transaction')]}
          hideEditableOptions={!hasPermission('edit_bank_transaction')}
          enableSavingFilterPreference
          dateRangeColumns={[
            { column: 'created_at', queryParameterKey: 'created_between' },
          ]}
        />
      </Default>
    </>
  );
}
