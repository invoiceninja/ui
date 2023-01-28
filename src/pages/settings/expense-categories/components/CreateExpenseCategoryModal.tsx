/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ExpenseCategory } from 'common/interfaces/expense-category';
import { Modal } from 'components/Modal';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { CreateExpenseCategoryForm } from './CreateExpenseCategoryForm';

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  setSelectedIds?: Dispatch<SetStateAction<string[]>>;
  onCreatedCategory: (category: ExpenseCategory) => unknown;
}

export function CreateExpenseCategoryModal(props: Props) {
  const [t] = useTranslation();

  return (
    <Modal
      title={t('create_expense_category')}
      visible={props.visible}
      onClose={() => props.setVisible(false)}
    >
      <CreateExpenseCategoryForm
        setSelectedIds={props.setSelectedIds}
        setVisible={props.setVisible}
        onCreatedCategory={props.onCreatedCategory}
      />
    </Modal>
  );
}
