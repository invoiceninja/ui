/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { FormEvent, useEffect, useState } from 'react';
import { toast } from '$app/common/helpers/toast/toast';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { useQueryClient } from 'react-query';
import { TransactionStatus } from '$app/common/enums/transactions';
import { route } from '$app/common/helpers/route';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { ListBox } from './ListBox';
import { Button } from '$app/components/forms';
import { MdContentCopy, MdLink } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { TabGroup } from '$app/components/TabGroup';
import { Transaction } from '$app/common/interfaces/transactions';
import { TransactionRule } from '$app/common/interfaces/transaction-rules';
import { useAtomValue } from 'jotai';
import { invalidationQueryAtom } from '$app/common/atoms/data-table';

export interface TransactionDetails {
  base_type: string;
  transaction_id: string;
  status_id: string;
}

interface Props {
  transactionDetails: TransactionDetails;
  isCreditTransactionType: boolean;
  transactionRule: TransactionRule | undefined;
}

export function TransactionMatchDetails(props: Props) {
  const [t] = useTranslation();

  const queryClient = useQueryClient();

  const { transactionRule } = props;

  const invalidationQuery = useAtomValue(invalidationQueryAtom);

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const [isTransactionConverted, setIsTransactionConverted] =
    useState<boolean>(true);

  const [invoiceIds, setInvoiceIds] = useState<string[]>([]);

  const [vendorIds, setVendorIds] = useState<string[]>([]);

  const [expenseCategoryIds, setExpenseCategoryIds] = useState<string[]>([]);

  const [paymentIds, setPaymentIds] = useState<string[]>([]);

  const [expenseIds, setExpenseIds] = useState<string[]>([]);

  const tabs = [
    props.isCreditTransactionType ? t('create_payment') : t('create_expense'),
    props.isCreditTransactionType ? t('link_payment') : t('link_expense'),
  ];

  const convertToPayment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!invoiceIds.length || isFormBusy) {
      return;
    } else {
      setIsFormBusy(true);

      toast.processing();

      request('POST', endpoint('/api/v1/bank_transactions/match'), {
        transactions: [
          {
            id: props.transactionDetails.transaction_id,
            invoice_ids: invoiceIds.join(','),
          },
        ],
      })
        .then(() => {
          queryClient.invalidateQueries([invalidationQuery]);
          queryClient.invalidateQueries('/api/v1/invoices');
          queryClient.invalidateQueries(
            route('/api/v1/bank_transactions/:id', {
              id: props.transactionDetails.transaction_id,
            })
          );

          toast.success('converted_transaction');
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  const linkToPayment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!paymentIds.length || isFormBusy) {
      return;
    } else {
      setIsFormBusy(true);

      toast.processing();

      request('POST', endpoint('/api/v1/bank_transactions/match'), {
        transactions: [
          {
            id: props.transactionDetails.transaction_id,
            payment_id: paymentIds.join(','),
          },
        ],
      })
        .then(() => {
          queryClient.invalidateQueries([invalidationQuery]);
          queryClient.invalidateQueries('/api/v1/invoices');
          queryClient.invalidateQueries('/api/v1/payments');
          queryClient.invalidateQueries(
            route('/api/v1/bank_transactions/:id', {
              id: props.transactionDetails.transaction_id,
            })
          );

          toast.success('linked_transaction');
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  const convertToExpense = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if ((!vendorIds.length && !expenseCategoryIds.length) || isFormBusy) {
      return;
    } else {
      setIsFormBusy(true);

      toast.processing();

      request('POST', endpoint('/api/v1/bank_transactions/match'), {
        transactions: [
          {
            id: props.transactionDetails.transaction_id,
            vendor_id: vendorIds.join(','),
            ninja_category_id: expenseCategoryIds.join(','),
          },
        ],
      })
        .then((response: GenericSingleResourceResponse<Transaction[]>) => {
          queryClient.invalidateQueries([invalidationQuery]);

          queryClient.invalidateQueries(
            route('/api/v1/bank_transactions/:id', {
              id: props.transactionDetails.transaction_id,
            })
          );

          queryClient.invalidateQueries(
            route('/api/v1/expenses/:id', {
              id: response.data.data[0].expense_id,
            })
          );

          toast.success('converted_transaction');
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  const linkToExpense = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!expenseIds.length || isFormBusy) {
      return;
    } else {
      setIsFormBusy(true);

      toast.processing();

      request('POST', endpoint('/api/v1/bank_transactions/match'), {
        transactions: [
          {
            id: props.transactionDetails.transaction_id,
            expense_id: expenseIds.join(','),
          },
        ],
      })
        .then((response: GenericSingleResourceResponse<Transaction[]>) => {
          queryClient.invalidateQueries([invalidationQuery]);

          queryClient.invalidateQueries('/api/v1/expenses');

          queryClient.invalidateQueries(
            route('/api/v1/bank_transactions/:id', {
              id: props.transactionDetails.transaction_id,
            })
          );

          queryClient.invalidateQueries(
            route('/api/v1/expenses/:id', {
              id: response.data.data[0].expense_id,
            })
          );

          toast.success('linked_transaction');
        })

        .finally(() => setIsFormBusy(false));
    }
  };

  useEffect(() => {
    setIsTransactionConverted(
      props.transactionDetails.status_id === TransactionStatus.Converted
    );
  }, [
    props.transactionDetails.status_id,
    props.isCreditTransactionType,
    vendorIds,
    invoiceIds,
    expenseCategoryIds,
    paymentIds,
    expenseIds,
  ]);

  useEffect(() => {
    return () => {
      setIsTransactionConverted(true);
    };
  }, []);

  useEffect(() => {
    if (transactionRule) {
      const { category_id, vendor_id } = transactionRule;

      if (category_id) {
        setExpenseCategoryIds([category_id]);
      }

      if (vendor_id) {
        setVendorIds([vendor_id]);
      }
    }
  }, [transactionRule]);

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col flex-1">
        {!isTransactionConverted && (
          <TabGroup
            className="flex flex-col flex-1 border-t border-gray-200"
            tabs={tabs}
            height="full"
            width="full"
          >
            <div>
              {props.isCreditTransactionType ? (
                <ListBox
                  transactionDetails={props.transactionDetails}
                  dataKey="invoices"
                  setSelectedIds={setInvoiceIds}
                  selectedIds={invoiceIds}
                />
              ) : (
                <>
                  <ListBox
                    transactionDetails={props.transactionDetails}
                    dataKey="vendors"
                    setSelectedIds={setVendorIds}
                    selectedIds={vendorIds}
                  />
                  <ListBox
                    transactionDetails={props.transactionDetails}
                    dataKey="categories"
                    setSelectedIds={setExpenseCategoryIds}
                    selectedIds={expenseCategoryIds}
                  />
                </>
              )}

              <div className="px-3 py-3 w-full border-t border-gray-200">
                <Button
                  className="w-full"
                  onClick={
                    props.isCreditTransactionType
                      ? convertToPayment
                      : convertToExpense
                  }
                  disableWithoutIcon={true}
                  disabled={
                    isFormBusy ||
                    (props.isCreditTransactionType &&
                      !invoiceIds.length &&
                      !paymentIds.length) ||
                    (!props.isCreditTransactionType &&
                      !vendorIds.length &&
                      !expenseCategoryIds.length &&
                      !expenseIds.length)
                  }
                >
                  <MdContentCopy fontSize={22} />

                  <span>
                    {props.isCreditTransactionType
                      ? t('create_payment')
                      : t('create_expense')}
                  </span>
                </Button>
              </div>
            </div>

            <div>
              {props.isCreditTransactionType ? (
                <ListBox
                  transactionDetails={props.transactionDetails}
                  dataKey="payments"
                  setSelectedIds={setPaymentIds}
                  selectedIds={paymentIds}
                />
              ) : (
                <ListBox
                  transactionDetails={props.transactionDetails}
                  dataKey="expenses"
                  setSelectedIds={setExpenseIds}
                  selectedIds={expenseIds}
                />
              )}

              <div className="px-3 py-3 w-full border-t border-gray-200">
                <Button
                  className="w-full"
                  onClick={
                    props.isCreditTransactionType
                      ? linkToPayment
                      : linkToExpense
                  }
                  disableWithoutIcon={true}
                  disabled={
                    isFormBusy ||
                    (props.isCreditTransactionType &&
                      !invoiceIds.length &&
                      !paymentIds.length) ||
                    (!props.isCreditTransactionType &&
                      !vendorIds.length &&
                      !expenseCategoryIds.length &&
                      !expenseIds.length)
                  }
                >
                  <MdLink fontSize={22} />

                  <span>
                    {props.isCreditTransactionType
                      ? t('link_payment')
                      : t('link_expense')}
                  </span>
                </Button>
              </div>
            </div>
          </TabGroup>
        )}
      </div>
    </div>
  );
}
