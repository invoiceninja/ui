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
  Dispatch,
  FormEvent,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'common/helpers/toast/toast';
import { request } from 'common/helpers/request';
import { endpoint } from 'common/helpers';
import { AxiosError } from 'axios';
import { useQueryClient } from 'react-query';
import ListBox from './ListBox';
import { TransactionStatus } from 'common/enums/transactions';
import { ConvertButton } from './ConvertButton';
import { route } from 'common/helpers/route';
import { TransactionResponse } from 'common/interfaces/transactions';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';

export interface TransactionDetails {
  base_type: string;
  transaction_id: string;
  status_id: string;
}

interface Props {
  transactionDetails: TransactionDetails;
  isCreditTransactionType: boolean;
  setActionButton: Dispatch<SetStateAction<ReactNode>>;
}

export function TransactionMatchDetails(props: Props) {
  const [t] = useTranslation();

  const queryClient = useQueryClient();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const [vendorIds, setVendorIds] = useState<string[]>();

  const [invoiceIds, setInvoiceIds] = useState<string[]>();

  const [expenseCategoryIds, setExpenseCategoryIds] = useState<string[]>();

  const convertToPayment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!invoiceIds?.length || isFormBusy) {
      return;
    } else {
      setIsFormBusy(true);

      toast.processing();

      const invoicesIds = invoiceIds.join(',');

      request('POST', endpoint('/api/v1/bank_transactions/match'), {
        transactions: [
          {
            id: props.transactionDetails.transaction_id,
            invoice_ids: invoicesIds,
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
        .finally(() => {
          setIsFormBusy(false);
        });
    }
  };

  const convertToExpense = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if ((!vendorIds?.length && !expenseCategoryIds?.length) || isFormBusy) {
      return;
    } else {
      setIsFormBusy(true);

      toast.processing();

      const vendor_id = vendorIds?.join(',');

      const ninja_category_id = expenseCategoryIds?.join(',');

      request('POST', endpoint('/api/v1/bank_transactions/match'), {
        transactions: [
          {
            id: props.transactionDetails.transaction_id,
            vendor_id,
            ninja_category_id,
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
        .finally(() => {
          setIsFormBusy(false);
        });
    }
  };

  useEffect(() => {
    if (props.transactionDetails.status_id !== TransactionStatus.Converted) {
      props.setActionButton(
        <ConvertButton
          isFormBusy={isFormBusy}
          text={
            props.isCreditTransactionType
              ? t('convert_to_payment')
              : t('convert_to_expense')
          }
          onClick={
            props.isCreditTransactionType ? convertToPayment : convertToExpense
          }
        />
      );
    } else {
      props.setActionButton(undefined);
    }
  }, [
    props.transactionDetails.status_id,
    props.isCreditTransactionType,
    vendorIds,
    invoiceIds,
    expenseCategoryIds,
  ]);

  return (
    <>
      {props.isCreditTransactionType ? (
        <ListBox
          className="border-t-0"
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
    </>
  );
}
