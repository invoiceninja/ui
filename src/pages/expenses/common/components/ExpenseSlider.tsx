/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import paymentType from '$app/common/constants/payment-type';
import { date, endpoint } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useResolveCurrency } from '$app/common/hooks/useResolveCurrency';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Expense } from '$app/common/interfaces/expense';
import { Element } from '$app/components/cards';
import { Divider } from '$app/components/cards/Divider';
import { Slider } from '$app/components/cards/Slider';
import { DocumentsTable } from '$app/components/DocumentsTable';
import { DocumentsTabLabel } from '$app/components/DocumentsTabLabel';
import { Link } from '$app/components/forms';
import { ResourceActions } from '$app/components/ResourceActions';
import { Spinner } from '$app/components/Spinner';
import { TabGroup } from '$app/components/TabGroup';
import { Upload } from '$app/pages/settings/company/documents/components';
import { atom, useAtom } from 'jotai';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ExpenseStatus } from './ExpenseStatus';
import { useActions } from '../hooks';
import { useCalculateExpenseAmount } from '../hooks/useCalculateExpenseAmount';

export const expenseSliderAtom = atom<Expense | null>(null);
export const expenseSliderVisibilityAtom = atom(false);

interface StatCardProps {
  label: string;
  value: ReactNode;
}

function StatCard({ label, value }: StatCardProps) {
  const colors = useColorScheme();

  return (
    <div
      className="flex flex-col space-y-1 rounded-md border p-4"
      style={{ borderColor: colors.$20 }}
    >
      <span
        className="text-xs font-medium uppercase tracking-wide"
        style={{ color: colors.$17 }}
      >
        {label}
      </span>

      <span className="text-lg font-medium" style={{ color: colors.$3 }}>
        {value}
      </span>
    </div>
  );
}

export function ExpenseSlider() {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const formatMoney = useFormatMoney();
  const resolveCurrency = useResolveCurrency();
  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();
  const calculateExpenseAmount = useCalculateExpenseAmount();

  const actions = useActions({
    showEditAction: true,
    showCommonBulkAction: true,
  });

  const [expense, setExpense] = useAtom(expenseSliderAtom);
  const [isVisible, setIsSliderVisible] = useAtom(expenseSliderVisibilityAtom);

  const money = (value: number) =>
    formatMoney(
      value,
      expense?.client?.country_id,
      expense?.currency_id || expense?.client?.settings.currency_id
    );

  const renderSectionTitle = (title: string) => (
    <p
      className="px-6 pt-2 text-sm font-medium uppercase tracking-wide"
      style={{ color: colors.$17 }}
    >
      {title}
    </p>
  );

  return (
    <Slider
      size="large"
      visible={isVisible}
      onClose={() => {
        setIsSliderVisible(false);
        setExpense(null);
      }}
      title={`${t('expense')} ${expense?.number || ''}`}
      topRight={
        expense &&
        (hasPermission('edit_expense') || entityAssigned(expense)) ? (
          <ResourceActions
            label={t('actions')}
            resource={expense}
            actions={actions}
          />
        ) : null
      }
      withoutActionContainer
      withoutHeaderBorder
    >
      <TabGroup
        tabs={[t('overview'), t('documents')]}
        width="full"
        formatTabLabel={(tabIndex) => {
          if (tabIndex === 1) {
            return (
              <DocumentsTabLabel
                numberOfDocuments={expense?.documents?.length}
                textCenter
              />
            );
          }
        }}
        withHorizontalPadding
        horizontalPaddingWidth="1.5rem"
      >
        {expense ? (
          <div className="space-y-4 pb-4">
            <div className="grid grid-cols-2 gap-3 px-6 pt-4">
              <StatCard
                label={t('amount')}
                value={money(calculateExpenseAmount(expense))}
              />

              <StatCard
                label={t('net_amount')}
                value={money(expense.amount)}
              />

              <StatCard
                label={t('date')}
                value={date(expense.date, dateFormat)}
              />

              <StatCard
                label={t('status')}
                value={<ExpenseStatus entity={expense} />}
              />
            </div>

            <Divider withoutPadding borderColor={colors.$20} />

            {renderSectionTitle(t('details'))}

            <div className="px-6">
              <Element
                className="border-b border-dashed"
                leftSide={t('number')}
                withoutWrappingLeftSide
                pushContentToRight
                noExternalPadding
                style={{ borderColor: colors.$20 }}
              >
                {expense.number}
              </Element>

              {expense.vendor && (
                <Element
                  className="border-b border-dashed"
                  leftSide={t('vendor')}
                  withoutWrappingLeftSide
                  pushContentToRight
                  noExternalPadding
                  style={{ borderColor: colors.$20 }}
                >
                  <Link to={route('/vendors/:id', { id: expense.vendor_id })}>
                    {expense.vendor.name}
                  </Link>
                </Element>
              )}

              {expense.client && (
                <Element
                  className="border-b border-dashed"
                  leftSide={t('client')}
                  withoutWrappingLeftSide
                  pushContentToRight
                  noExternalPadding
                  style={{ borderColor: colors.$20 }}
                >
                  <Link to={route('/clients/:id', { id: expense.client_id })}>
                    {expense.client.display_name}
                  </Link>
                </Element>
              )}

              {Boolean(expense.category) && (
                <Element
                  className="border-b border-dashed"
                  leftSide={t('category')}
                  withoutWrappingLeftSide
                  pushContentToRight
                  noExternalPadding
                  style={{ borderColor: colors.$20 }}
                >
                  {expense.category?.name}
                </Element>
              )}

              {Boolean(
                expense.currency_id &&
                  resolveCurrency(expense.currency_id)?.name
              ) && (
                <Element
                  leftSide={t('currency')}
                  withoutWrappingLeftSide
                  pushContentToRight
                  noExternalPadding
                >
                  {resolveCurrency(expense.currency_id)?.name || ''}
                </Element>
              )}
            </div>

            {Boolean(expense.public_notes || expense.private_notes) && (
              <>
                <Divider withoutPadding borderColor={colors.$20} />

                {renderSectionTitle(t('notes'))}

                <div className="px-6">
                  {Boolean(expense.public_notes) && (
                    <Element
                      className={
                        expense.private_notes ? 'border-b border-dashed' : ''
                      }
                      leftSide={t('public_notes')}
                      withoutWrappingLeftSide
                      pushContentToRight
                      noExternalPadding
                      style={{ borderColor: colors.$20 }}
                    >
                      {expense.public_notes}
                    </Element>
                  )}

                  {Boolean(expense.private_notes) && (
                    <Element
                      leftSide={t('private_notes')}
                      withoutWrappingLeftSide
                      pushContentToRight
                      noExternalPadding
                    >
                      {expense.private_notes}
                    </Element>
                  )}
                </div>
              </>
            )}

            {Boolean(expense.payment_date) && (
              <>
                <Divider withoutPadding borderColor={colors.$20} />

                {renderSectionTitle(t('payment'))}

                <div className="px-6">
                  <Element
                    className={
                      expense.payment_type_id ? 'border-b border-dashed' : ''
                    }
                    leftSide={t('payment_date')}
                    withoutWrappingLeftSide
                    pushContentToRight
                    noExternalPadding
                    style={{ borderColor: colors.$20 }}
                  >
                    {date(expense.payment_date, dateFormat)}
                  </Element>

                  {Boolean(expense.payment_type_id) && (
                    <Element
                      leftSide={t('payment_type')}
                      withoutWrappingLeftSide
                      pushContentToRight
                      noExternalPadding
                    >
                      {t(
                        paymentType[
                          expense.payment_type_id as keyof typeof paymentType
                        ]
                      )}
                    </Element>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center py-12">
            <Spinner />
          </div>
        )}

        <div className="px-4 pt-4">
          <Upload
            endpoint={endpoint('/api/v1/expenses/:id/upload', {
              id: expense?.id,
            })}
            onSuccess={() => $refetch(['expenses'])}
            widgetOnly
            disableUpload={
              !hasPermission('edit_expense') && !entityAssigned(expense)
            }
          />

          <DocumentsTable
            documents={expense?.documents || []}
            onDocumentDelete={() => $refetch(['expenses'])}
            disableEditableOptions={
              !entityAssigned(expense, true) && !hasPermission('edit_expense')
            }
          />
        </div>
      </TabGroup>
    </Slider>
  );
}
