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
import {
  ApiTransactionType,
  TransactionStatus,
  TransactionType,
} from 'common/enums/transactions';
import { route } from 'common/helpers/route';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { Expense } from 'common/interfaces/expense';
import { ExpenseCategory } from 'common/interfaces/expense-category';
import { Invoice } from 'common/interfaces/invoice';
import { Vendor } from 'common/interfaces/vendor';
import { useExpenseCategoryQuery } from 'common/queries/expense-categories';
import { useExpenseQuery } from 'common/queries/expenses';
import { useVendorQuery } from 'common/queries/vendor';
import { useInvoicesQuery } from 'pages/invoices/common/queries';
import { useBankAccountsQuery } from 'pages/settings/bank-accounts/common/queries';
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useTransactionQuery } from '../common/queries';
import { TransactionMatchDetails } from './TransactionMatchDetails';

interface Props {
  transactionId: string;
  setTransactionId: Dispatch<SetStateAction<string>>;
  setActionButton: Dispatch<SetStateAction<ReactNode>>;
}

export function Details(props: Props) {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const company = useCurrentCompany();

  const formatMoney = useFormatMoney();

  const { data: invoicesResponse } = useInvoicesQuery();

  const { data: transaction } = useTransactionQuery({
    id: props.transactionId,
  });

  const { data: bankAccountResponse } = useBankAccountsQuery({
    id: transaction?.bank_integration_id || '',
  });

  const { data: vendorResponse } = useVendorQuery({
    id: transaction?.vendor_id || '',
  });

  const { data: expenseResponse } = useExpenseQuery({
    id: transaction?.expense_id || '',
  });

  const { data: expenseCategoryResponse } = useExpenseCategoryQuery({
    id: transaction?.ninja_category_id || '',
  });

  const [isCreditTransactionType, setIsCreditTransactionType] =
    useState<boolean>(false);

  const [matchedInvoices, setMatchedInvoices] = useState<Invoice[]>();

  const [matchedVendor, setMatchedVendor] = useState<Vendor>();

  const [matchedExpense, setMatchedExpense] = useState<Expense>();

  const [matchedExpenseCategory, setMatchedExpenseCategory] =
    useState<ExpenseCategory>();

  const [showTransactionMatchDetails, setShowTransactionMatchDetails] =
    useState<boolean>(false);

  useEffect(() => {
    const filteredMatchedInvoices = invoicesResponse?.filter(({ id }) =>
      transaction?.invoice_ids?.includes(id)
    );
    setMatchedInvoices(filteredMatchedInvoices);

    setShowTransactionMatchDetails(
      TransactionStatus.Converted !== transaction?.status_id
    );

    setIsCreditTransactionType(
      transaction?.base_type === ApiTransactionType.Credit
    );

    setMatchedVendor(vendorResponse);

    setMatchedExpenseCategory(expenseCategoryResponse?.data.data);

    setMatchedExpense(expenseResponse);
  }, [
    transaction,
    expenseResponse,
    vendorResponse,
    expenseCategoryResponse,
    props.transactionId,
  ]);

  useEffect(() => {
    return () => {
      props.setTransactionId('');
    };
  }, []);

  return (
    <div>
      <Element leftSide={t('type')}>
        {isCreditTransactionType
          ? t(TransactionType.Deposit)
          : t(TransactionType.Withdrawal)}
      </Element>
      <Element leftSide={t('amount')}>
        {formatMoney(
          Number(transaction?.amount),
          company?.settings.country_id,
          transaction?.currency_id || ''
        )}
      </Element>
      <Element leftSide={t('date')}>{transaction?.date}</Element>
      <Element
        leftSide={t('bank_account')}
        className="hover:bg-gray-100 cursor-pointer"
        onClick={() =>
          navigate(
            route('/settings/bank_accounts/:id/details', {
              id: bankAccountResponse?.id,
            })
          )
        }
      >
        {bankAccountResponse?.bank_account_name}
      </Element>
      {!showTransactionMatchDetails ? (
        <>
          {isCreditTransactionType &&
            matchedInvoices?.map(({ id, number }) => (
              <Element
                key={id}
                leftSide={t('invoice')}
                className="hover:bg-gray-100 cursor-pointer"
                onClick={() =>
                  navigate(
                    route('/invoices/:id/edit', {
                      id,
                    })
                  )
                }
              >
                {number}
              </Element>
            ))}

          {!isCreditTransactionType && (
            <>
              {transaction?.vendor_id && (
                <Element
                  leftSide={t('vendor')}
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() =>
                    navigate(
                      route('/vendors/:id', {
                        id: matchedVendor?.id,
                      })
                    )
                  }
                >
                  {matchedVendor?.name}
                </Element>
              )}
              {transaction?.ninja_category_id && (
                <Element
                  leftSide={t('category')}
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() =>
                    navigate(
                      route('/settings/expense_categories/:id/edit', {
                        id: matchedExpenseCategory?.id,
                      })
                    )
                  }
                >
                  {matchedExpenseCategory?.name}
                </Element>
              )}
              {transaction?.expense_id && (
                <Element
                  leftSide={t('expense')}
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() =>
                    navigate(
                      route('/expenses/:id/edit', {
                        id: matchedExpense?.id,
                      })
                    )
                  }
                >
                  {matchedExpense?.number}
                </Element>
              )}
            </>
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
          setActionButton={props.setActionButton}
        />
      )}
    </div>
  );
}
