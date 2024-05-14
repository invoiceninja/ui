/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button } from '$app/components/forms';
import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { ExpenseCategory } from '$app/common/interfaces/expense-category';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useBlankExpenseCategoryQuery } from '$app/common/queries/expense-categories';
import { Modal } from '$app/components/Modal';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreateExpenseCategoryForm } from './CreateExpenseCategoryForm';
import { $refetch } from '$app/common/hooks/useRefetch';

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  setSelectedIds?: Dispatch<SetStateAction<string[]>>;
  onCreatedCategory: (category: ExpenseCategory) => unknown;
}

export function CreateExpenseCategoryModal(props: Props) {
  const [t] = useTranslation();

  const accentColor: string = useAccentColor();

  const { data: blankExpenseCategory } = useBlankExpenseCategoryQuery();

  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>();

  const handleSave = () => {
    if (!isFormBusy) {
      toast.processing();
      setIsFormBusy(true);

      request('POST', endpoint('/api/v1/expense_categories'), expenseCategory)
        .then((response: GenericSingleResourceResponse<ExpenseCategory>) => {
          toast.success('created_expense_category');

          $refetch(['expense_categories']);

          window.dispatchEvent(
            new CustomEvent('invalidate.combobox.queries', {
              detail: {
                url: endpoint('/api/v1/expense_categories'),
              },
            })
          );

          if (props.setSelectedIds) {
            props.setSelectedIds([response.data.data.id]);
          }

          if (props.onCreatedCategory) {
            props.onCreatedCategory(response.data.data);
          }

          blankExpenseCategory &&
            setExpenseCategory({
              ...blankExpenseCategory,
              color: accentColor,
            });

          props.setVisible(false);
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            setErrors(error.response.data);
            toast.dismiss();
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  useEffect(() => {
    if (blankExpenseCategory) {
      setExpenseCategory({ ...blankExpenseCategory, color: accentColor });
    }
  }, [blankExpenseCategory]);

  return (
    <Modal
      title={t('create_expense_category')}
      visible={props.visible}
      onClose={() => props.setVisible(false)}
      stopPropagationInHeader
    >
      <div onClick={(event) => event.stopPropagation()}>
        <CreateExpenseCategoryForm
          expenseCategory={expenseCategory}
          setExpenseCategory={setExpenseCategory}
          errors={errors}
          setErrors={setErrors}
        />

        <div className="flex justify-end space-x-4 mt-5">
          <Button behavior="button" onClick={handleSave}>
            {t('save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
