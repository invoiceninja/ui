/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { StatusBadge } from '$app/components/StatusBadge';
import {
  hexToRGB,
  isColorLight,
  useAdjustColorDarkness,
} from '$app/common/hooks/useAdjustColorDarkness';
import { useRef, useState } from 'react';
import { useClickAway } from 'react-use';
import { useColorScheme } from '$app/common/colors';
import { Expense } from '$app/common/interfaces/expense';
import { useExpenseCategoriesQuery } from '$app/common/queries/expense-categories';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import Tippy from '@tippyjs/react/headless';
import { Dispatch, SetStateAction } from 'react';
import { useSave } from '../../edit/hooks/useSave';
import { useTranslation } from 'react-i18next';
import { CreateExpenseCategoryModal } from '$app/pages/settings/expense-categories/components/CreateExpenseCategoryModal';
import { ExpenseCategory as ExpenseCategoryType } from '$app/common/interfaces/expense-category';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';

interface DropdownProps {
  visible: boolean;
  isFormBusy: boolean;
  setIsFormBusy: Dispatch<SetStateAction<boolean>>;
  setVisible: Dispatch<SetStateAction<boolean>>;
  expense: Expense;
}

function ExpenseCategoriesDropdown(props: DropdownProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const hasPermission = useHasPermission();

  const adjustColorDarkness = useAdjustColorDarkness();

  const { visible, isFormBusy, setIsFormBusy, expense, setVisible } = props;

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { data: expenseCategories } = useExpenseCategoriesQuery({
    status: ['active'],
  });

  const save = useSave({ isFormBusy, setIsFormBusy });

  const { red, green, blue, hex } = hexToRGB(expense.category?.color || '');

  const darknessAmount = isColorLight(red, green, blue) ? -220 : 220;

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <Tippy
        placement="bottom"
        interactive={true}
        render={() => (
          <div
            className="border box rounded-md shadow-lg focus:outline-none"
            style={{
              backgroundColor: colors.$1,
              borderColor: colors.$4,
              minWidth: '15rem',
              maxWidth: '20rem',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            {hasPermission('create_expense') && (
              <DropdownElement
                className="font-medium text-center py-3"
                onClick={() => {
                  setIsModalOpen(true);
                  setVisible(false);
                }}
                cypressRef="newExpenseCategoryAction"
              >
                {t('new_expense_category')}
              </DropdownElement>
            )}

            <div className="flex flex-col max-h-80 overflow-y-auto">
              {expenseCategories?.map(
                (expenseCategory, index) =>
                  expenseCategory.id !== expense.category_id && (
                    <DropdownElement
                      key={index}
                      onClick={() => {
                        setVisible(false);
                        save({ ...expense, category_id: expenseCategory.id });
                      }}
                    >
                      {expenseCategory.name}
                    </DropdownElement>
                  )
              )}
            </div>
          </div>
        )}
        visible={visible}
      >
        <div className="cursor-pointer" data-cy="expenseCategoryBadge">
          <StatusBadge
            for={{}}
            code={expense.category?.name || (t('uncategorized') as string)}
            style={{
              color: adjustColorDarkness(hex, darknessAmount),
              backgroundColor: expense.category?.color || '',
            }}
            onClick={() =>
              !isFormBusy &&
              setVisible((currentVisibility) => !currentVisibility)
            }
          />
        </div>
      </Tippy>

      <CreateExpenseCategoryModal
        visible={isModalOpen}
        setVisible={setIsModalOpen}
        onCreatedCategory={(category: ExpenseCategoryType) =>
          save({ ...expense, category_id: category.id })
        }
      />
    </div>
  );
}

interface Props {
  expense: Expense;
}

export function ExpenseCategory(props: Props) {
  const ref = useRef(null);
  const { expense } = props;

  const [visibleDropdown, setVisibleDropdown] = useState<boolean>(false);
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  useClickAway(ref, () => {
    visibleDropdown && setVisibleDropdown(false);
  });

  return (
    <div ref={ref}>
      <ExpenseCategoriesDropdown
        visible={visibleDropdown}
        isFormBusy={isFormBusy}
        setIsFormBusy={setIsFormBusy}
        expense={expense}
        setVisible={setVisibleDropdown}
      />
    </div>
  );
}
