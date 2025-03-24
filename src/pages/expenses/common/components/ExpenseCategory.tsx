/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

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
import Tippy from '@tippyjs/react/headless';
import { Dispatch, SetStateAction } from 'react';
import { useSave } from '../../edit/hooks/useSave';
import { useTranslation } from 'react-i18next';
import { CreateExpenseCategoryModal } from '$app/pages/settings/expense-categories/components/CreateExpenseCategoryModal';
import { ExpenseCategory as ExpenseCategoryType } from '$app/common/interfaces/expense-category';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import styled from 'styled-components';
import { RadioChecked } from '$app/components/icons/RadioChecked';
import { RadioUnchecked } from '$app/components/icons/RadioUnchecked';
import { Plus } from '$app/components/icons/Plus';
import { ChevronDown } from '$app/components/icons/ChevronDown';

interface DropdownProps {
  visible: boolean;
  isFormBusy: boolean;
  setIsFormBusy: Dispatch<SetStateAction<boolean>>;
  setVisible: Dispatch<SetStateAction<boolean>>;
  expense: Expense;
}

const OptionElement = styled.div`
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

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
            className="border box rounded-md shadow-lg focus:outline-none p-1"
            style={{
              backgroundColor: colors.$1,
              borderColor: colors.$4,
              minWidth: '15rem',
              maxWidth: '20rem',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col max-h-80 overflow-y-auto">
              {expenseCategories?.map((expenseCategory, index) => (
                <OptionElement
                  key={index}
                  className="flex items-center p-2 space-x-2 rounded-sm cursor-pointer"
                  onClick={() => {
                    setVisible(false);
                    save({ ...expense, category_id: expenseCategory.id });
                  }}
                  theme={{
                    hoverColor: colors.$7,
                  }}
                >
                  <div>
                    {expenseCategory.id === expense.category_id ? (
                      <RadioChecked
                        size="1.2rem"
                        filledColor={colors.$1}
                        borderColor={colors.$3}
                      />
                    ) : (
                      <RadioUnchecked size="1.2rem" color={colors.$17} />
                    )}
                  </div>

                  <span className="truncate">{expenseCategory.name}</span>
                </OptionElement>
              ))}
            </div>

            {Boolean(!expenseCategories?.length) && (
              <div className="font-medium text-center py-2 text-xs">
                {t('no_records_found')}
              </div>
            )}

            {hasPermission('create_expense') && (
              <OptionElement
                className="flex items-center font-medium text-center p-2 rounded-sm cursor-pointer"
                onClick={() => {
                  setIsModalOpen(true);
                  setVisible(false);
                }}
                theme={{
                  hoverColor: colors.$7,
                }}
              >
                <div className="flex items-center gap-2">
                  <Plus color={colors.$17} size="1.2rem" />

                  <span>{t('create_new')}</span>
                </div>
              </OptionElement>
            )}
          </div>
        )}
        visible={visible}
      >
        <div
          className="flex items-center cursor-pointer"
          data-cy="expenseCategoryBadge"
        >
          <div
            className="text-xs rounded-l px-2 py-1 border-r border-white font-medium"
            style={{
              color: expense.category?.color
                ? adjustColorDarkness(hex, darknessAmount)
                : '#1f2937',
              backgroundColor: expense.category?.color || '#f3f4f6',
            }}
          >
            {expense.category?.name || (t('uncategorized') as string)}
          </div>

          <div
            className="flex items-center justify-center rounded-r py-1 h-full"
            style={{
              backgroundColor: expense.category?.color || '#f3f4f6',
              width: '1.5rem',
            }}
            onClick={() =>
              !isFormBusy &&
              setVisible((currentVisibility) => !currentVisibility)
            }
          >
            <ChevronDown
              color={
                expense.category?.color
                  ? adjustColorDarkness(hex, darknessAmount)
                  : '#1f2937'
              }
              size="1rem"
            />
          </div>
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
