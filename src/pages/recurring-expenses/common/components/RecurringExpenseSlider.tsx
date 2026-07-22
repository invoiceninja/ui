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
import frequencies from '$app/common/constants/recurring-expense-frequency';
import { date, endpoint } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useResolveCurrency } from '$app/common/hooks/useResolveCurrency';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { $refetch } from '$app/common/hooks/useRefetch';
import { RecurringExpense } from '$app/common/interfaces/recurring-expense';
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
import { useCalculateExpenseAmount } from '$app/pages/expenses/common/hooks/useCalculateExpenseAmount';
import { atom, useAtom } from 'jotai';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { RecurringExpenseStatus } from './RecurringExpenseStatus';
import { useActions } from '../hooks';

export const recurringExpenseSliderAtom = atom<RecurringExpense | null>(null);
export const recurringExpenseSliderVisibilityAtom = atom(false);

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

export function RecurringExpenseSlider() {
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

  const [recurringExpense, setRecurringExpense] = useAtom(
    recurringExpenseSliderAtom
  );
  const [isVisible, setIsSliderVisible] = useAtom(
    recurringExpenseSliderVisibilityAtom
  );

  const money = (value: number) =>
    formatMoney(
      value,
      recurringExpense?.client?.country_id,
      recurringExpense?.currency_id ||
        recurringExpense?.client?.settings.currency_id
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
        setRecurringExpense(null);
      }}
      title={`${t('recurring_expense')} ${recurringExpense?.number || ''}`}
      topRight={
        recurringExpense &&
        (hasPermission('edit_recurring_expense') ||
          entityAssigned(recurringExpense)) ? (
          <ResourceActions
            label={t('actions')}
            resource={recurringExpense}
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
                numberOfDocuments={recurringExpense?.documents?.length}
                textCenter
              />
            );
          }
        }}
        withHorizontalPadding
        horizontalPaddingWidth="1.5rem"
      >
        {recurringExpense ? (
          <div className="space-y-4 pb-4">
            <div className="grid grid-cols-2 gap-3 px-6 pt-4">
              <StatCard
                label={t('amount')}
                value={money(calculateExpenseAmount(recurringExpense))}
              />

              <StatCard
                label={t('net_amount')}
                value={money(recurringExpense.amount)}
              />

              <StatCard
                label={t('frequency')}
                value={t(
                  frequencies[
                    recurringExpense.frequency_id as keyof typeof frequencies
                  ]
                )}
              />

              <StatCard
                label={t('status')}
                value={
                  <RecurringExpenseStatus
                    recurringExpense={recurringExpense}
                  />
                }
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
                {recurringExpense.number}
              </Element>

              {recurringExpense.vendor && (
                <Element
                  className="border-b border-dashed"
                  leftSide={t('vendor')}
                  withoutWrappingLeftSide
                  pushContentToRight
                  noExternalPadding
                  style={{ borderColor: colors.$20 }}
                >
                  <Link
                    to={route('/vendors/:id', {
                      id: recurringExpense.vendor_id,
                    })}
                  >
                    {recurringExpense.vendor.name}
                  </Link>
                </Element>
              )}

              {recurringExpense.client && (
                <Element
                  className="border-b border-dashed"
                  leftSide={t('client')}
                  withoutWrappingLeftSide
                  pushContentToRight
                  noExternalPadding
                  style={{ borderColor: colors.$20 }}
                >
                  <Link
                    to={route('/clients/:id', {
                      id: recurringExpense.client_id,
                    })}
                  >
                    {recurringExpense.client.display_name}
                  </Link>
                </Element>
              )}

              {Boolean(recurringExpense.category) && (
                <Element
                  className="border-b border-dashed"
                  leftSide={t('category')}
                  withoutWrappingLeftSide
                  pushContentToRight
                  noExternalPadding
                  style={{ borderColor: colors.$20 }}
                >
                  {recurringExpense.category?.name}
                </Element>
              )}

              {Boolean(
                recurringExpense.currency_id &&
                  resolveCurrency(recurringExpense.currency_id)?.name
              ) && (
                <Element
                  className="border-b border-dashed"
                  leftSide={t('currency')}
                  withoutWrappingLeftSide
                  pushContentToRight
                  noExternalPadding
                  style={{ borderColor: colors.$20 }}
                >
                  {resolveCurrency(recurringExpense.currency_id)?.name || ''}
                </Element>
              )}

              <Element
                className="border-b border-dashed"
                leftSide={t('remaining_cycles')}
                withoutWrappingLeftSide
                pushContentToRight
                noExternalPadding
                style={{ borderColor: colors.$20 }}
              >
                {recurringExpense.remaining_cycles === -1
                  ? t('endless')
                  : recurringExpense.remaining_cycles}
              </Element>

              {Boolean(recurringExpense.next_send_date) && (
                <Element
                  className="border-b border-dashed"
                  leftSide={t('next_send_date')}
                  withoutWrappingLeftSide
                  pushContentToRight
                  noExternalPadding
                  style={{ borderColor: colors.$20 }}
                >
                  {date(recurringExpense.next_send_date, dateFormat)}
                </Element>
              )}

              {Boolean(recurringExpense.date) && (
                <Element
                  leftSide={t('date')}
                  withoutWrappingLeftSide
                  pushContentToRight
                  noExternalPadding
                >
                  {date(recurringExpense.date, dateFormat)}
                </Element>
              )}
            </div>

            {Boolean(
              recurringExpense.public_notes || recurringExpense.private_notes
            ) && (
              <>
                <Divider withoutPadding borderColor={colors.$20} />

                {renderSectionTitle(t('notes'))}

                <div className="px-6">
                  {Boolean(recurringExpense.public_notes) && (
                    <Element
                      className={
                        recurringExpense.private_notes
                          ? 'border-b border-dashed'
                          : ''
                      }
                      leftSide={t('public_notes')}
                      withoutWrappingLeftSide
                      pushContentToRight
                      noExternalPadding
                      style={{ borderColor: colors.$20 }}
                    >
                      {recurringExpense.public_notes}
                    </Element>
                  )}

                  {Boolean(recurringExpense.private_notes) && (
                    <Element
                      leftSide={t('private_notes')}
                      withoutWrappingLeftSide
                      pushContentToRight
                      noExternalPadding
                    >
                      {recurringExpense.private_notes}
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
            endpoint={endpoint('/api/v1/recurring_expenses/:id/upload', {
              id: recurringExpense?.id,
            })}
            onSuccess={() => $refetch(['recurring_expenses'])}
            widgetOnly
            disableUpload={
              !hasPermission('edit_recurring_expense') &&
              !entityAssigned(recurringExpense)
            }
          />

          <DocumentsTable
            documents={recurringExpense?.documents || []}
            onDocumentDelete={() => $refetch(['recurring_expenses'])}
            disableEditableOptions={
              !entityAssigned(recurringExpense, true) &&
              !hasPermission('edit_recurring_expense')
            }
          />
        </div>
      </TabGroup>
    </Slider>
  );
}
