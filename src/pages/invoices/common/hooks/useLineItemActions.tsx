/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from '$app/common/helpers/route';
import { LineItemAction } from '$app/components/LineItemActions';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdVisibility } from 'react-icons/md';
import { ViewExpenseLineItemAction } from '../components/ViewExpenseLineItemAction';

export function useLineItemActions() {
  const [t] = useTranslation();

  const actions: LineItemAction[] = [
    (lineItem) =>
      lineItem.task_id && (
        <DropdownElement
          icon={<Icon element={MdVisibility} />}
          to={route('/tasks/:id/edit', { id: lineItem.task_id })}
          linkTarget="_blank"
        >
          {t('view_task')}
        </DropdownElement>
      ),
    (lineItem) =>
      lineItem.expense_id && (
        <ViewExpenseLineItemAction expenseId={lineItem.expense_id} />
      ),
  ];

  return actions;
}
