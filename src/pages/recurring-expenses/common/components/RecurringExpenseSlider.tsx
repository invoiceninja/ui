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
import { endpoint } from '$app/common/helpers';
import { DocumentsTable } from '$app/components/DocumentsTable';
import { DocumentsTabLabel } from '$app/components/DocumentsTabLabel';
import { Upload } from '$app/pages/settings/company/documents/components';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useColorScheme } from '$app/common/colors';
import { ResourceActions } from '$app/components/ResourceActions';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Divider } from '$app/components/cards/Divider';
import { Icon } from '$app/components/icons/Icon';
import { MdEdit } from 'react-icons/md';
import { route } from '$app/common/helpers/route';
import { RecurringExpense } from '$app/common/interfaces/recurring-expense';
import { RecurringExpenseStatus } from './RecurringExpenseStatus';
import { useActions } from '../hooks';
import frequencies from '$app/common/constants/recurring-expense-frequency';
import { useCalculateExpenseAmount } from '$app/pages/expenses/common/hooks/useCalculateExpenseAmount';

export const recurringExpenseSliderAtom = atom<RecurringExpense | null>(null);
export const recurringExpenseSliderVisibilityAtom = atom(false);

export function RecurringExpenseSlider() {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const actions = useActions();
  const formatMoney = useFormatMoney();
  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();
  const calculateExpenseAmount = useCalculateExpenseAmount();

  const [recurringExpense, setRecurringExpense] = useAtom(
    recurringExpenseSliderAtom
  );
  const [isVisible, setIsSliderVisible] = useAtom(
    recurringExpenseSliderVisibilityAtom
  );

  return (
    <Slider
      size="regular"
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
            actions={[
              (resource: RecurringExpense) => (
                <DropdownElement
                  to={route('/recurring_expenses/:id/edit', {
                    id: resource.id,
                  })}
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
                numberOfDocuments={recurringExpense?.documents?.length}
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
              {recurringExpense
                ? formatMoney(
                    calculateExpenseAmount(recurringExpense),
                    recurringExpense.client?.country_id,
                    recurringExpense.currency_id ||
                      recurringExpense.client?.settings.currency_id
                  )
                : null}
            </Element>

            <Element
              className="border-b border-dashed"
              leftSide={t('frequency')}
              pushContentToRight
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {recurringExpense
                ? t(
                    frequencies[
                      recurringExpense.frequency_id as keyof typeof frequencies
                    ]
                  )
                : null}
            </Element>

            <Element leftSide={t('status')} pushContentToRight noExternalPadding>
              {recurringExpense ? (
                <RecurringExpenseStatus recurringExpense={recurringExpense} />
              ) : null}
            </Element>
          </div>
        </div>

        <div className="px-4">
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
