/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Element } from '@invoiceninja/cards';
import { Link } from '@invoiceninja/forms';
import {
  ApiTransactionType,
  TransactionStatus,
  TransactionType,
} from 'common/enums/transactions';
import { route } from 'common/helpers/route';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { ExpenseCategory } from 'common/interfaces/expense-category';
import { Invoice } from 'common/interfaces/invoice';
import { Payment } from 'common/interfaces/payment';
import { useExpenseCategoryQuery } from 'common/queries/expense-categories';
import { useExpenseQuery } from 'common/queries/expenses';
import { usePaymentQuery } from 'common/queries/payments';
import { useVendorQuery } from 'common/queries/vendor';
import { useInvoicesQuery } from 'pages/invoices/common/queries';
import { useBankAccountQuery } from 'pages/settings/bank-accounts/common/queries';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTransactionQuery } from '../common/queries';
import { TransactionMatchDetails } from './TransactionMatchDetails';

interface Props {
  transactionId: string;
  setTransactionId: Dispatch<SetStateAction<string>>;
  setSliderVisible?: Dispatch<SetStateAction<boolean>>;
}

export function Details(props: Props) {
  const [t] = useTranslation();

  const company = useCurrentCompany();

  const formatMoney = useFormatMoney();

  const { data: transaction } = useTransactionQuery({
    id: props.transactionId,
    enabled: !!props.transactionId,
  });

  const { data: bankAccountResponse } = useBankAccountQuery({
    id: transaction?.bank_integration_id || '',
    enabled: !!transaction,
  });

  const [matchedInvoices, setMatchedInvoices] = useState<Invoice[]>();

  const [matchedPayment, setMatchedPayment] = useState<Payment>();

  const [matchedExpenseCategory, setMatchedExpenseCategory] =
    useState<ExpenseCategory>();

  const isCreditTransactionType =
    transaction?.base_type === ApiTransactionType.Credit;

  const showTransactionMatchDetails =
    TransactionStatus.Converted !== transaction?.status_id;

  const shouldEnableQueries =
    transaction && !showTransactionMatchDetails && !!props.transactionId;

  const { data: invoicesResponse } = useInvoicesQuery({
    enabled: isCreditTransactionType && shouldEnableQueries,
  });

  const { data: paymentResponse } = usePaymentQuery({
    id: transaction?.payment_id || '',
    enabled: isCreditTransactionType && shouldEnableQueries,
  });

  const { data: vendorResponse } = useVendorQuery({
    id: transaction?.vendor_id || '',
    enabled: !isCreditTransactionType && shouldEnableQueries,
  });

  const { data: expenseResponse } = useExpenseQuery({
    id: transaction?.expense_id || '',
    enabled: !isCreditTransactionType && shouldEnableQueries,
  });

  const { data: expenseCategoryResponse } = useExpenseCategoryQuery({
    id: transaction?.ninja_category_id || '',
    enabled: !isCreditTransactionType && shouldEnableQueries,
  });

  useEffect(() => {
    if (transaction) {
      const filteredMatchedInvoices = invoicesResponse?.filter(({ id }) =>
        transaction?.invoice_ids?.includes(id)
      );
      setMatchedInvoices(filteredMatchedInvoices);

      setMatchedExpenseCategory(expenseCategoryResponse?.data.data);

      setMatchedPayment(paymentResponse?.data.data);
    }
  }, [
    transaction,
    expenseCategoryResponse,
    paymentResponse,
    props.transactionId,
  ]);

  return (
    <div className="flex flex-col flex-1 border-b border-gray-200">
      <div>
        <Element leftSide={t('type')}>
          {isCreditTransactionType
            ? t(TransactionType.Deposit)
            : t(TransactionType.Withdrawal)}
        </Element>

        <Element leftSide={t('amount')}>
          {formatMoney(
            transaction?.amount || 0,
            company?.settings.country_id,
            transaction?.currency_id || ''
          )}
        </Element>

        <Element leftSide={t('date')}>{transaction?.date}</Element>

        <Element
          leftSide={t('bank_account')}
          className="hover:bg-gray-100 cursor-pointer"
        >
          <Link
            to={route('/settings/bank_accounts/:id/details', {
              id: bankAccountResponse?.id,
            })}
          >
            {bankAccountResponse?.bank_account_name}
          </Link>
        </Element>
      </div>

      {!showTransactionMatchDetails ? (
        <>
          {matchedInvoices?.map(({ id, number }) => (
            <Element
              key={id}
              leftSide={t('invoice')}
              className="hover:bg-gray-100 cursor-pointer"
            >
              <Link
                to={route('/invoices/:id/edit', {
                  id,
                })}
              >
                {number}
              </Link>
            </Element>
          ))}

          {transaction?.payment_id && (
            <Element
              leftSide={t('payment')}
              className="hover:bg-gray-100 cursor-pointer"
            >
              <Link
                to={route('/payments/:id/edit', {
                  id: matchedPayment?.id,
                })}
              >
                {matchedPayment?.number}
              </Link>
            </Element>
          )}

          {transaction?.vendor_id && (
            <Element
              leftSide={t('vendor')}
              className="hover:bg-gray-100 cursor-pointer"
            >
              <Link
                to={route('/vendors/:id', {
                  id: vendorResponse?.id,
                })}
              >
                {vendorResponse?.name}
              </Link>
            </Element>
          )}

          {transaction?.ninja_category_id && (
            <Element
              leftSide={t('category')}
              className="hover:bg-gray-100 cursor-pointer"
            >
              <Link
                to={route('/settings/expense_categories/:id/edit', {
                  id: matchedExpenseCategory?.id,
                })}
              >
                {matchedExpenseCategory?.name}
              </Link>
            </Element>
          )}

          {transaction?.expense_id && (
            <Element
              leftSide={t('expense')}
              className="hover:bg-gray-100 cursor-pointer"
            >
              <Link
                to={route('/expenses/:id/edit', {
                  id: expenseResponse?.id,
                })}
              >
                {expenseResponse?.number}
              </Link>
            </Element>
          )}
        </>
      ) : (
        <TransactionMatchDetails
          transactionDetails={{
            base_type: transaction?.base_type || '',
            transaction_id: transaction?.id || '',
            status_id: transaction?.status_id || '',
          }}
          isCreditTransactionType={isCreditTransactionType}
        />
      )}
    </div>
  );
}
