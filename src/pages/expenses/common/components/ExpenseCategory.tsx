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
import { Expense } from '$app/common/interfaces/expense';
import { ExpenseCategory as ExpenseCategoryType } from '$app/common/interfaces/expense-category';
import { useExpenseCategoriesQuery } from '$app/common/queries/expense-categories';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import Tippy from '@tippyjs/react/headless';
import { Dispatch, SetStateAction } from 'react';

interface DropdownProps {
  visible: boolean;
  isFormBusy: boolean;
  setIsFormBusy: Dispatch<SetStateAction<boolean>>;
  setVisible: Dispatch<SetStateAction<boolean>>;
  expense: Expense;
}
export function ExpenseCategoriesDropdown(props: DropdownProps) {
  const colors = useColorScheme();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { visible, isFormBusy, setIsFormBusy, expense, setVisible } = props;

  const { data: expenseCategories } = useExpenseCategoriesQuery({
    status: ['active'],
  });

  return (
    <Tippy
      placement="bottom"
      interactive={true}
      render={() => (
        <div
          className="border box rounded-md shadow-lg focus:outline-none"
          style={{
            backgroundColor: colors.$1,
            borderColor: colors.$4,
            minWidth: '12rem',
            maxWidth: '14.7rem',
          }}
        >
          {expenseCategories?.map(
            (expenseCategory, index) =>
              expenseCategory.id !== expense.category_id && (
                <DropdownElement
                  key={index}
                  onClick={() => {
                    setVisible(false);
                  }}
                >
                  {expenseCategory.name}
                </DropdownElement>
              )
          )}
        </div>
      )}
      visible={visible}
    >
      <div></div>
    </Tippy>
  );
}

interface Props {
  expenseCategory: ExpenseCategoryType;
}

export function ExpenseCategory(props: Props) {
  const { expenseCategory } = props;

  return <div>{expenseCategory.name}</div>;
}
