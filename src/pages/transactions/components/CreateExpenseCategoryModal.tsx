/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { CardContainer } from '@invoiceninja/cards';
import { Button, InputField, InputLabel } from '@invoiceninja/forms';
import { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { toast } from 'common/helpers/toast/toast';
import { ExpenseCategory } from 'common/interfaces/expense-category';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { ColorPicker } from 'components/forms/ColorPicker';
import { Modal } from 'components/Modal';
import { Dispatch, FormEvent, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

interface ExpenseCategoryInput {
  name: string;
  color: string;
}

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  setSelectedIds: Dispatch<SetStateAction<string[] | undefined>>;
}

export function CreateExpenseCategoryModal(props: Props) {
  const [t] = useTranslation();

  const queryClient = useQueryClient();

  const [errors, setErrors] = useState<ValidationBag>();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategoryInput>({
    name: '',
    color: '',
  });

  const handleChange = (
    property: keyof ExpenseCategory,
    value: ExpenseCategory[keyof ExpenseCategory]
  ) => {
    setExpenseCategory((prevState) => ({
      ...prevState,
      [property]: value,
    }));
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormBusy) {
      setIsFormBusy(true);

      toast.processing();

      request('POST', endpoint('/api/v1/expense_categories'), expenseCategory)
        .then((response: GenericSingleResourceResponse<ExpenseCategory>) => {
          toast.success('created_expense_category');

          queryClient.invalidateQueries('/api/v1/expense_categories');

          props.setSelectedIds([response.data.data.id]);

          props.setVisible(false);
        })
        .catch((error: AxiosError) => {
          if (error.response?.status === 422) {
            setErrors(error.response.data);
            toast.dismiss();
          } else {
            toast.error();
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  return (
    <Modal
      title={t('create_expense_category')}
      visible={props.visible}
      onClose={() => props.setVisible(false)}
      size="small"
    >
      <form onSubmit={handleSave}>
        <CardContainer>
          <InputField
            label={t('name')}
            onValueChange={(value) => handleChange('name', value)}
            errorMessage={errors?.errors.name}
            required
          />

          <InputLabel>{t('color')}</InputLabel>

          <ColorPicker
            onValueChange={(value) => handleChange('color', value)}
          />

          <div className="flex justify-end space-x-4 mt-5">
            <Button onClick={handleSave}>{t('save')}</Button>
          </div>
        </CardContainer>
      </form>
    </Modal>
  );
}
