/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { Button } from '@invoiceninja/forms';
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
import { TransactionDetails } from 'common/interfaces/transactions';
import { Vendor } from 'common/interfaces/vendor';
import { useExpenseCategoryQuery } from 'common/queries/expense-categories';
import { useExpenseQuery } from 'common/queries/expenses';
import { useVendorQuery } from 'common/queries/vendor';
import { useInvoicesQuery } from 'pages/invoices/common/queries';
import { useBankAccountsQuery } from 'pages/settings/bank-accounts/common/queries';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { TransactionMatchDetails } from './TransactionMatchDetails';

interface Props {
  transactionDetails?: TransactionDetails;
}

export function Details(props: Props) {
  const {
    id = '',
    amount = 0,
    date,
    currency_id = '',
    base_type = '',
    status_id = '',
    bank_integration_id = '',
    invoice_ids,
    ninja_category_id = '',
    vendor_id = '',
    expense_id = '',
  } = props.transactionDetails || {};

  const [t] = useTranslation();

  const navigate = useNavigate();

  const company = useCurrentCompany();

  const formatMoney = useFormatMoney();

  const { data: invoicesResponse } = useInvoicesQuery();

  const { data: bankAccountResponse } = useBankAccountsQuery({
    id: bank_integration_id,
  });

  const { data: vendorResponse } = useVendorQuery({ id: vendor_id });

  const { data: expenseResponse } = useExpenseQuery({ id: expense_id });

  const { data: expenseCategoryResponse } = useExpenseCategoryQuery({
    id: ninja_category_id,
  });

  const [isCreditTransactionType, setIsCreditTransactionType] =
    useState<boolean>(false);

  const [isMatchTransactionDialogOpened, setIsMatchTransactionDialogOpened] =
    useState<boolean>(false);

  const [matchedInvoices, setMatchedInvoices] = useState<Invoice[]>();

  const [matchedVendor, setMatchedVendor] = useState<Vendor>();

  const [matchedExpense, setMatchedExpense] = useState<Expense>();

  const [matchedExpenseCategory, setMatchedExpenseCategory] =
    useState<ExpenseCategory>();

  const [
    shouldShowTransactionMatchDetails,
    setShouldShowTransactionMatchDetails,
  ] = useState<boolean>(false);

  useEffect(() => {
    const filteredMatchedInvoices = invoicesResponse?.filter(({ id }) =>
      invoice_ids?.includes(id)
    );
    setMatchedInvoices(filteredMatchedInvoices);

    setShouldShowTransactionMatchDetails(
      TransactionStatus.Converted !== status_id
    );

    setIsCreditTransactionType(base_type === ApiTransactionType.Credit);

    setMatchedVendor(vendorResponse);

    setMatchedExpenseCategory(expenseCategoryResponse?.data.data);

    setMatchedExpense(expenseResponse);
  }, [
    invoicesResponse,
    invoice_ids,
    vendorResponse,
    expenseCategoryResponse,
    id,
  ]);

  return (
    <Card title={t('details')}>
      <Element leftSide={t('type')}>
        {isCreditTransactionType
          ? t(TransactionType.Deposit)
          : t(TransactionType.Withdrawal)}
      </Element>
      <Element leftSide={t('amount')}>
        {formatMoney(amount, company?.settings.country_id, currency_id)}
      </Element>
      <Element leftSide={t('date')}>{date}</Element>
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
      {isCreditTransactionType &&
        !shouldShowTransactionMatchDetails &&
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

      {!isCreditTransactionType && !shouldShowTransactionMatchDetails && (
        <>
          {vendor_id && (
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
          {ninja_category_id && (
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
          {expense_id && (
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
      {shouldShowTransactionMatchDetails && (
        <>
          <Element leftSide={t('match_transaction')}>
            <Button onClick={() => setIsMatchTransactionDialogOpened(true)}>
              {t('match')}
            </Button>
          </Element>
          <TransactionMatchDetails
            transactionDetails={{ base_type, transaction_id: id, status_id }}
            visible={isMatchTransactionDialogOpened}
            setVisible={setIsMatchTransactionDialogOpened}
          />
        </>
      )}
    </Card>
  );
}
