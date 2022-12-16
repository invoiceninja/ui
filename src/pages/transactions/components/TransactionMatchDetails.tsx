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
import { toast } from 'common/helpers/toast/toast';
import { request } from 'common/helpers/request';
import { endpoint } from 'common/helpers';
import { AxiosError } from 'axios';
import { useQueryClient } from 'react-query';
import { TransactionStatus } from 'common/enums/transactions';
import { route } from 'common/helpers/route';
import { TransactionResponse } from 'common/interfaces/transactions';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { ListBox } from './ListBox';
import { Button } from '@invoiceninja/forms';
import { MdContentCopy, MdLink } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { Tab, TabGroup } from 'components/TabGroup';

export interface TransactionDetails {
  base_type: string;
  transaction_id: string;
  status_id: string;
}

interface Props {
  transactionDetails: TransactionDetails;
  isCreditTransactionType: boolean;
}

export function TransactionMatchDetails(props: Props) {
  const [t] = useTranslation();

  const queryClient = useQueryClient();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const [isTransactionConverted, setIsTransactionConverted] =
    useState<boolean>(true);

  const [isCreate, setIsCreate] = useState<boolean>(true);

  const [invoiceIds, setInvoiceIds] = useState<string[]>([]);

  const [vendorIds, setVendorIds] = useState<string[]>([]);

  const [expenseCategoryIds, setExpenseCategoryIds] = useState<string[]>([]);

  const [paymentIds, setPaymentIds] = useState<string[]>([]);

  const [expenseIds, setExpenseIds] = useState<string[]>([]);

  const tabs = [
    props.isCreditTransactionType ? t('create_payment') : t('create_expense'),
    props.isCreditTransactionType ? t('match_payment') : t('match_expense'),
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
          queryClient.invalidateQueries('/api/v1/bank_transactions');
          queryClient.invalidateQueries('/api/v1/invoices');
          queryClient.invalidateQueries(
            route('/api/v1/bank_transactions/:id', {
              id: props.transactionDetails.transaction_id,
            })
          );

          toast.success('converted_transaction');
        })
        .catch((error: AxiosError) => {
          console.error(error);
          toast.error();
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
          queryClient.invalidateQueries('/api/v1/bank_transactions');
          queryClient.invalidateQueries('/api/v1/invoices');
          queryClient.invalidateQueries('/api/v1/payments');
          queryClient.invalidateQueries(
            route('/api/v1/bank_transactions/:id', {
              id: props.transactionDetails.transaction_id,
            })
          );

          toast.success('linked_transaction');
        })
        .catch((error: AxiosError) => {
          console.error(error);
          toast.error();
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
        .then(
          (response: GenericSingleResourceResponse<TransactionResponse[]>) => {
            queryClient.invalidateQueries('/api/v1/bank_transactions');
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
          }
        )
        .catch((error: AxiosError) => {
          console.error(error);
          toast.error();
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
        .then(
          (response: GenericSingleResourceResponse<TransactionResponse[]>) => {
            queryClient.invalidateQueries('/api/v1/bank_transactions');
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
          }
        )
        .catch((error: AxiosError) => {
          console.error(error);
          toast.error();
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  const getMatchingFunction = () => {
    if (isCreate) {
      if (props.isCreditTransactionType) {
        return convertToPayment;
      }

      return convertToExpense;
    }

    if (props.isCreditTransactionType) {
      return linkToPayment;
    }

    return linkToExpense;
  };

  const handleOnTabClick = (tab: Tab) => {
    if (!tab.index) {
      setIsCreate(true);
    } else {
      setIsCreate(false);
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

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col flex-1">
        {!isTransactionConverted && (
          <TabGroup
            className="flex flex-col align-center px-5 flex-1"
            tabs={tabs}
            isTransactionMatchingTabGroup={true}
            onTabClick={handleOnTabClick}
          >
            <div>
              {props.isCreditTransactionType ? (
                <ListBox
                  transactionDetails={props.transactionDetails}
                  dataKey="invoices"
                  setSelectedIds={setInvoiceIds}
                  selectedIds={invoiceIds}
                  isCreate={isCreate}
                />
              ) : (
                <>
                  <ListBox
                    transactionDetails={props.transactionDetails}
                    dataKey="vendors"
                    setSelectedIds={setVendorIds}
                    selectedIds={vendorIds}
                    isCreate={isCreate}
                  />
                  <ListBox
                    className="mt-5"
                    transactionDetails={props.transactionDetails}
                    dataKey="categories"
                    setSelectedIds={setExpenseCategoryIds}
                    selectedIds={expenseCategoryIds}
                    isCreate={isCreate}
                  />
                </>
              )}
            </div>

            <div>
              {props.isCreditTransactionType ? (
                <ListBox
                  transactionDetails={props.transactionDetails}
                  dataKey="payments"
                  setSelectedIds={setPaymentIds}
                  selectedIds={paymentIds}
                  isCreate={isCreate}
                />
              ) : (
                <ListBox
                  transactionDetails={props.transactionDetails}
                  dataKey="expenses"
                  setSelectedIds={setExpenseIds}
                  selectedIds={expenseIds}
                  isCreate={isCreate}
                />
              )}
            </div>
          </TabGroup>
        )}
      </div>

      {!isTransactionConverted && (
        <div className="px-3 py-3 w-full border-t border-gray-200">
          <Button
            className="w-full"
            onClick={getMatchingFunction()}
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
            {isCreate ? (
              <MdContentCopy fontSize={22} />
            ) : (
              <MdLink fontSize={22} />
            )}

            {isCreate ? (
              <span>
                {props.isCreditTransactionType
                  ? t('convert_to_payment')
                  : t('convert_to_expense')}
              </span>
            ) : (
              <span>
                {props.isCreditTransactionType
                  ? t('link_to_payment')
                  : t('link_to_expense')}
              </span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
