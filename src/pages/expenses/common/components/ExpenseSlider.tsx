/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { atom, useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Slider } from '$app/components/cards/Slider';
import { TabGroup } from '$app/components/TabGroup';
import { Element } from '$app/components/cards';
import { date, endpoint } from '$app/common/helpers';
import { DocumentsTable } from '$app/components/DocumentsTable';
import { DocumentsTabLabel } from '$app/components/DocumentsTabLabel';
import { Upload } from '$app/pages/settings/company/documents/components';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useColorScheme } from '$app/common/colors';
import { ResourceActions } from '$app/components/ResourceActions';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Divider } from '$app/components/cards/Divider';
import { Icon } from '$app/components/icons/Icon';
import { MdEdit } from 'react-icons/md';
import { route } from '$app/common/helpers/route';
import { Expense } from '$app/common/interfaces/expense';
import { ExpenseStatus } from './ExpenseStatus';
import { useActions } from '../hooks';
import { useCalculateExpenseAmount } from '../hooks/useCalculateExpenseAmount';

export const expenseSliderAtom = atom<Expense | null>(null);
export const expenseSliderVisibilityAtom = atom(false);

export function ExpenseSlider() {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const actions = useActions();
  const formatMoney = useFormatMoney();
  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();
  const { dateFormat } = useCurrentCompanyDateFormats();
  const calculateExpenseAmount = useCalculateExpenseAmount();

  const [expense, setExpense] = useAtom(expenseSliderAtom);
  const [isVisible, setIsSliderVisible] = useAtom(expenseSliderVisibilityAtom);

  return (
    <Slider
      size="regular"
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
            actions={[
              (resource: Expense) => (
                <DropdownElement
                  to={route('/expenses/:id/edit', { id: resource.id })}
                  icon={<Icon element={MdEdit} />}
                >
                  {t('edit')}
                </DropdownElement>
              ),
              () => <Divider withoutPadding />,
              ...actions,
            ]}
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
        <div className="space-y-2">
          <div className="px-6">
            <Element
              className="border-b border-dashed"
              leftSide={t('amount')}
              pushContentToRight
              withoutWrappingLeftSide
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {expense
                ? formatMoney(
                    calculateExpenseAmount(expense),
                    expense.client?.country_id,
                    expense.currency_id || expense.client?.settings.currency_id
                  )
                : null}
            </Element>

            <Element
              className="border-b border-dashed"
              leftSide={t('date')}
              pushContentToRight
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {expense ? date(expense.date, dateFormat) : null}
            </Element>

            <Element leftSide={t('status')} pushContentToRight noExternalPadding>
              {expense ? <ExpenseStatus entity={expense} /> : null}
            </Element>
          </div>
        </div>

        <div className="px-4">
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
