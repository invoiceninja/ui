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
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'common/helpers/toast/toast';
import { request } from 'common/helpers/request';
import { endpoint } from 'common/helpers';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { MdContentCopy } from 'react-icons/md';
import { ApiTransactionType } from 'common/enums/transactions';
import { Button } from '@invoiceninja/forms';
import ListBox from './ListBox';
import { CollapseCard } from 'components/cards/CollapseCard';

export interface TransactionDetails {
  base_type: string;
  transaction_id: string;
  status_id: string;
}

interface Props {
  transactionDetails: TransactionDetails;
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}

export function TransactionMatchDetails(props: Props) {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const [isCreditTransactionType, setIsCreditTransactionType] =
    useState<boolean>(false);

  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>();

  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>();

  const [selectedExpenseCategoryIds, setSelectedExpenseCategoryIds] =
    useState<string[]>();

  const convertToPayment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedInvoiceIds?.length) {
      return;
    } else {
      setIsFormBusy(true);

      toast.processing();

      const invoicesIds = selectedInvoiceIds.join(',');

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
          toast.success('converted_transaction');
          navigate('/transactions');
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

    if (!selectedVendorIds?.length && !selectedExpenseCategoryIds?.length) {
      return;
    } else {
      setIsFormBusy(true);

      toast.processing();

      const vendor_id = selectedVendorIds?.join(',');

      const ninja_category_id = selectedExpenseCategoryIds?.join(',');

      request('POST', endpoint('/api/v1/bank_transactions/match'), {
        transactions: [
          {
            id: props.transactionDetails.transaction_id,
            vendor_id,
            ninja_category_id,
          },
        ],
      })
        .then(() => {
          queryClient.invalidateQueries('/api/v1/bank_transactions');
          toast.success('converted_transaction');
          navigate('/transactions');
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

  useEffect(() => {
    setIsCreditTransactionType(
      props.transactionDetails.base_type === ApiTransactionType.Credit
    );
  }, [props.transactionDetails.base_type]);

  const actionButton = (
    <Button
      className="w-full"
      onClick={isCreditTransactionType ? convertToPayment : convertToExpense}
      disabled={isFormBusy}
    >
      {<MdContentCopy fontSize={22} />}
      <span>
        {isCreditTransactionType
          ? t('convert_to_payment')
          : t('convert_to_expense')}
      </span>
    </Button>
  );

  return (
    <CollapseCard
      title={t('match_transaction')}
      visible={props.visible}
      setVisible={props.setVisible}
      size={isCreditTransactionType ? 'large' : 'small'}
      actionElement={actionButton}
    >
      <div
        className="flex flex-col items-center justify-center border-gray-400"
        style={{ width: isCreditTransactionType ? '600px' : 'auto' }}
      >
        {isCreditTransactionType ? (
          <ListBox
            transactionDetails={props.transactionDetails}
            isCreditTransactionType={isCreditTransactionType}
            dataKey="invoices"
            setSelectedIds={setSelectedInvoiceIds}
            selectedIds={selectedInvoiceIds}
          />
        ) : (
          <>
            <ListBox
              transactionDetails={props.transactionDetails}
              isCreditTransactionType={isCreditTransactionType}
              dataKey="vendors"
              setSelectedIds={setSelectedVendorIds}
              selectedIds={selectedVendorIds}
            />
            <ListBox
              className="border-t-0"
              transactionDetails={props.transactionDetails}
              isCreditTransactionType={isCreditTransactionType}
              dataKey="categories"
              setSelectedIds={setSelectedExpenseCategoryIds}
              selectedIds={selectedExpenseCategoryIds}
            />
          </>
        )}
      </div>
    </CollapseCard>
  );
}
