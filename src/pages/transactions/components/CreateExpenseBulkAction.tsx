/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import {
  ApiTransactionType,
  TransactionStatus,
} from '$app/common/enums/transactions';
import { Transaction } from '$app/common/interfaces/transactions';
import { Modal } from '$app/components/Modal';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdAddCircle } from 'react-icons/md';
import { date, endpoint } from '$app/common/helpers';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { VendorSelector } from '$app/components/vendors/VendorSelector';
import { ExpenseCategorySelector } from '$app/components/expense-categories/ExpenseCategorySelector';
import { Button } from '$app/components/forms';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';

interface Props {
  transactions: Transaction[];
  setSelected: Dispatch<SetStateAction<string[]>>;
}

export function CreateExpenseBulkAction(props: Props) {
  const [t] = useTranslation();

  const { transactions, setSelected } = props;

  const company = useCurrentCompany();
  const formatMoney = useFormatMoney();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const [vendorId, setVendorId] = useState<string>('');
  const [expenseCategoryId, setExpenseCategoryId] = useState<string>('');

  const showAction = () => {
    return transactions.every(
      ({ base_type, status_id }) =>
        base_type === ApiTransactionType.Debit &&
        status_id !== TransactionStatus.Converted
    );
  };

  const handleOnClose = () => {
    setVendorId('');
    setSelected([]);
    setIsModalOpen(false);
    setExpenseCategoryId('');
  };

  const handleCreateExpense = () => {
    toast.processing();

    setIsFormBusy(true);

    const updatedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      vendor_id: vendorId,
      ninja_category_id: expenseCategoryId,
    }));

    request('POST', endpoint('/api/v1/bank_transactions/match'), {
      transactions: updatedTransactions,
    })
      .then(() => {
        $refetch(['bank_transactions', 'expenses']);

        toast.success('converted_transaction');

        handleOnClose();
      })
      .finally(() => setIsFormBusy(false));
  };

  if (!showAction()) {
    return null;
  }

  return (
    <>
      <Modal
        title={t('create_expense')}
        visible={isModalOpen}
        onClose={handleOnClose}
        overflowVisible
      >
        <div className="flex flex-col space-y-3">
          <span className="text-base font-medium">{t('transactions')}:</span>

          <div className="flex flex-col px-10">
            {transactions.map((transaction, index) => (
              <div key={index} className="flex justify-evenly">
                <span className="flex-1">
                  {date(transaction.date, dateFormat)}
                </span>

                <span className="ml-16 flex-1">
                  {formatMoney(
                    transaction.amount,
                    company?.settings.country_id,
                    transaction.currency_id
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        <VendorSelector
          inputLabel={t('vendor')}
          value={vendorId}
          onChange={(vendor) => setVendorId(vendor.id)}
          onClearButtonClick={() => setVendorId('')}
        />

        <ExpenseCategorySelector
          inputLabel={t('expense_category')}
          value={expenseCategoryId}
          onChange={(expenseCategory) =>
            setExpenseCategoryId(expenseCategory.id)
          }
          onClearButtonClick={() => setExpenseCategoryId('')}
        />

        <Button
          behavior="button"
          onClick={handleCreateExpense}
          disableWithoutIcon
          disabled={(!vendorId && !expenseCategoryId) || isFormBusy}
        >
          {t('create_expense')}
        </Button>
      </Modal>

      <DropdownElement
        onClick={() => setIsModalOpen(true)}
        icon={<Icon element={MdAddCircle} />}
      >
        {t('create_expense')}
      </DropdownElement>
    </>
  );
}
