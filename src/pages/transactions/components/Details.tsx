/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Element } from '$app/components/cards';
import { useInvoiceEditorPaths } from '$app/common/hooks/useInvoiceEditor';
import { DynamicLink } from '$app/components/DynamicLink';
import { TagPills } from '$app/components/tags/TagPills';
import {
  ApiTransactionType,
  TransactionStatus,
  TransactionType,
} from '$app/common/enums/transactions';
import { route } from '$app/common/helpers/route';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { ExpenseCategory } from '$app/common/interfaces/expense-category';
import { Invoice } from '$app/common/interfaces/invoice';
import { Payment } from '$app/common/interfaces/payment';
import { useExpenseCategoryQuery } from '$app/common/queries/expense-categories';
import { useExpensesQuery } from '$app/common/queries/expenses';
import { usePaymentQuery } from '$app/common/queries/payments';
import { useVendorQuery } from '$app/common/queries/vendor';
import { useInvoicesQuery } from '$app/pages/invoices/common/queries';
import { useBankAccountQuery } from '$app/pages/settings/bank-accounts/common/queries';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TransactionMatchDetails } from './TransactionMatchDetails';
import { useTransactionRuleQuery } from '$app/common/queries/transaction-rules';
import { Expense } from '$app/common/interfaces/expense';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { date as formatDate } from '$app/common/helpers';
import { useTransactionQuery } from '$app/common/queries/transactions';
import { useColorScheme } from '$app/common/colors';

interface Props {
  transactionId: string;
  setTransactionId: Dispatch<SetStateAction<string>>;
  onConverted?: () => void;
}

export function Details(props: Props) {
  const invoicePaths = useInvoiceEditorPaths();
  const [t] = useTranslation();

  const company = useCurrentCompany();

  const formatMoney = useFormatMoney();
  const disableNavigation = useDisableNavigation();

  const { isAdmin, isOwner } = useAdmin();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const { data: transaction } = useTransactionQuery({
    id: props.transactionId,
    enabled: Boolean(props.transactionId),
  });

  const { data: bankAccountResponse } = useBankAccountQuery({
    id: transaction?.bank_integration_id || '',
    enabled: Boolean(transaction),
  });

  const { data: bankTransactionRuleResponse } = useTransactionRuleQuery({
    id: transaction?.bank_transaction_rule_id || '',
    enabled: Boolean(transaction?.bank_transaction_rule_id),
  });

  const [matchedInvoices, setMatchedInvoices] = useState<Invoice[]>();

  const [matchedPayment, setMatchedPayment] = useState<Payment>();

  const [matchedExpenseCategory, setMatchedExpenseCategory] =
    useState<ExpenseCategory>();

  const [matchedExpenses, setMatchedExpenses] = useState<Expense[]>();

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

  const { data: expensesResponse } = useExpensesQuery({
    enabled: !isCreditTransactionType && shouldEnableQueries,
  });

  const { data: expenseCategoryResponse } = useExpenseCategoryQuery({
    id: transaction?.ninja_category_id || '',
    enabled: !isCreditTransactionType && shouldEnableQueries,
  });

  useEffect(() => {
    if (transaction) {
      const filteredMatchedInvoices = invoicesResponse?.filter(({ id }) =>
        transaction.invoice_ids?.includes(id)
      );

      setMatchedInvoices(filteredMatchedInvoices);

      const filteredMatchedExpenses = expensesResponse?.filter(({ id }) =>
        transaction.expense_id?.includes(id)
      );

      setMatchedExpenses(filteredMatchedExpenses);
      setMatchedExpenseCategory(expenseCategoryResponse?.data.data);
      setMatchedPayment(paymentResponse);
    }
  }, [
    transaction,
    expenseCategoryResponse,
    paymentResponse,
    props.transactionId,
    expensesResponse,
  ]);
  const colors = useColorScheme();

  return (
    <div
      className="flex flex-col flex-1 border-b"
      style={{
        color: colors.$3,
        backgroundColor: colors.$1,
        borderColor: colors.$24,
      }}
    >
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
            transaction?.currency_id
          )}
        </Element>

        <Element leftSide={t('date')}>
          {formatDate(transaction?.date || '', dateFormat)}
        </Element>

        {Boolean(transaction?.tags?.length) && (
          <Element leftSide={t('tags')}>
            <TagPills tags={transaction?.tags} />
          </Element>
        )}

        <Element leftSide={t('bank_account')} className="cursor-pointer">
          <DynamicLink
            to={route('/settings/bank_accounts/:id/details', {
              id: bankAccountResponse?.id,
            })}
            renderSpan={!isAdmin && !isOwner}
          >
            {bankAccountResponse?.bank_account_name}
          </DynamicLink>
        </Element>

        {transaction?.participant && (
          <Element leftSide={t('participant')}>
            {transaction.participant}
          </Element>
        )}

        {transaction?.participant_name && (
          <Element leftSide={t('participant_name')}>
            {transaction.participant_name}
          </Element>
        )}
      </div>

      {!showTransactionMatchDetails ? (
        <>
          {matchedInvoices?.map((invoice) => (
            <Element
              key={invoice.id}
              leftSide={t('invoice')}
              className="cursor-pointer"
            >
              <DynamicLink
                to={route(invoicePaths.edit, {
                  id: invoice.id,
                })}
                renderSpan={disableNavigation('invoice', invoice)}
              >
                {invoice.number}
              </DynamicLink>
            </Element>
          ))}

          {transaction?.payment_id && (
            <Element leftSide={t('payment')} className="cursor-pointer">
              <DynamicLink
                to={route('/payments/:id/edit', {
                  id: matchedPayment?.id,
                })}
                renderSpan={disableNavigation('payment', matchedPayment)}
              >
                {matchedPayment?.number}
              </DynamicLink>
            </Element>
          )}

          {transaction?.vendor_id && (
            <Element leftSide={t('vendor')} className="cursor-pointer">
              <DynamicLink
                to={route('/vendors/:id', {
                  id: vendorResponse?.id,
                })}
                renderSpan={disableNavigation('vendor', vendorResponse)}
              >
                {vendorResponse?.name}
              </DynamicLink>
            </Element>
          )}

          {transaction?.ninja_category_id && (
            <Element leftSide={t('category')} className="cursor-pointer">
              <DynamicLink
                to={route('/settings/expense_categories/:id/edit', {
                  id: matchedExpenseCategory?.id,
                })}
                renderSpan={!isAdmin && !isOwner}
              >
                {matchedExpenseCategory?.name}
              </DynamicLink>
            </Element>
          )}

          {matchedExpenses?.map((expense) => (
            <Element
              key={expense.id}
              leftSide={t('expense')}
              className="cursor-pointer"
            >
              <DynamicLink
                to={route('/expenses/:id/edit', {
                  id: expense.id,
                })}
                renderSpan={disableNavigation('expense', expense)}
              >
                {expense.number || formatDate(expense.date, dateFormat)}
              </DynamicLink>
            </Element>
          ))}
        </>
      ) : transaction ? (
        <TransactionMatchDetails
          key={props.transactionId}
          transactionDetails={{
            base_type: transaction?.base_type || '',
            transaction_id: transaction?.id || '',
            status_id: transaction?.status_id || '',
            invoice_ids: transaction?.invoice_ids || '',
            payment_id: transaction?.payment_id || '',
          }}
          isCreditTransactionType={isCreditTransactionType}
          transactionRule={bankTransactionRuleResponse}
          onConverted={props.onConverted}
        />
      ) : null}
    </div>
  );
}
