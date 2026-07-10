/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdRuleFolder } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useColorScheme } from '$app/common/colors';
import { Guard } from '$app/common/guards/Guard';
import { enterprisePlan } from '$app/common/guards/guards/enterprise-plan';
import { or } from '$app/common/guards/guards/or';
import { permission } from '$app/common/guards/guards/permission';
import { proPlan } from '$app/common/guards/guards/pro-plan';
import {
  date as formatDate,
  isHosted,
  isSelfHosted,
} from '$app/common/helpers';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useTitle } from '$app/common/hooks/useTitle';
import { Transaction } from '$app/common/interfaces/transactions';
import { Slider } from '$app/components/cards/Slider';
import { DataTable } from '$app/components/DataTable';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { Button } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { ImportButton } from '$app/components/import/ImportButton';
import { Default } from '$app/components/layouts/Default';
import { useActions } from '../common/hooks/useActions';
import {
  defaultColumns,
  useAllTransactionColumns,
} from '../common/hooks/useAllTransactionColumns';
import { useCustomBulkActions } from '../common/hooks/useCustomBulkActions';
import { useTransactionColumns } from '../common/hooks/useTransactionColumns';
import { useTransactionFilters } from '../common/hooks/useTransactionFilters';
import { Details } from '../components/Details';

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
            { column: 'date', queryParameterKey: 'date_range' },
            { column: 'created_at', queryParameterKey: 'created_between' },
          ]}
          enableSavingLatestDataForNavigation
        />
      </Default>
    </>
  );
}
