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

interface DropdownProps {
  visible: boolean;
  isFormBusy: boolean;
  setIsFormBusy: Dispatch<SetStateAction<boolean>>;
  setVisible: Dispatch<SetStateAction<boolean>>;
  expense: Expense;
}
function ExpenseCategoriesDropdown(props: DropdownProps) {
  const colors = useColorScheme();

  const { visible, isFormBusy, setIsFormBusy, expense, setVisible } = props;

  const { data: expenseCategories } = useExpenseCategoriesQuery({
    status: ['active'],
  });

  const save = useSave({ isFormBusy, setIsFormBusy });

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
                    save({ ...expense, category_id: expenseCategory.id });
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
  expense: Expense;
}

export function ExpenseCategory(props: Props) {
  const ref = useRef(null);
  const { expense } = props;

  const adjustColorDarkness = useAdjustColorDarkness();

  const [visibleDropdown, setVisibleDropdown] = useState<boolean>(false);
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  useClickAway(ref, () => {
    visibleDropdown && setVisibleDropdown(false);
  });

  const { red, green, blue, hex } = hexToRGB(expense.category?.color || '');

  const darknessAmount = isColorLight(red, green, blue) ? -220 : 220;

  return (
    <div ref={ref}>
      <StatusBadge
        for={{}}
        code={expense.category?.name || ''}
        style={{
          color: adjustColorDarkness(hex, darknessAmount),
          backgroundColor: expense.category?.color,
        }}
        onClick={() => !isFormBusy && setVisibleDropdown(true)}
      />

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
