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
import { MdContentCopy } from 'react-icons/md';
import { useTranslation } from 'react-i18next';

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

  const [invoiceIds, setInvoiceIds] = useState<string[]>([]);

  const [vendorIds, setVendorIds] = useState<string[]>([]);

  const [expenseCategoryIds, setExpenseCategoryIds] = useState<string[]>([]);

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
  ]);

  useEffect(() => {
    return () => {
      setIsTransactionConverted(true);
    };
  }, []);

  return (
    <>
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
            className="mt-5"
            transactionDetails={props.transactionDetails}
            dataKey="categories"
            setSelectedIds={setExpenseCategoryIds}
            selectedIds={expenseCategoryIds}
          />
        </>
      )}

      {!isTransactionConverted && (
        <div className="absolute bottom-0 px-3 py-3 w-full border-t border-gray-200">
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
              (props.isCreditTransactionType && !invoiceIds.length) ||
              (!props.isCreditTransactionType &&
                !vendorIds.length &&
                !expenseCategoryIds.length)
            }
          >
            {<MdContentCopy fontSize={22} />}
            <span>
              {props.isCreditTransactionType
                ? t('convert_to_payment')
                : t('convert_to_expense')}
            </span>
          </Button>
        </div>
      )}
    </>
  );
}
