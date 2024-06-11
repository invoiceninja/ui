/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { trans } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { useExpenseQuery } from '$app/common/queries/expenses';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { MdPreview } from 'react-icons/md';

interface Props {
  expenseId: string;
}
export function ViewExpenseLineItemAction(props: Props) {
  const { expenseId } = props;

  const { data: expenseResponse } = useExpenseQuery({ id: expenseId });

  return (
    <DropdownElement
      icon={<Icon element={MdPreview} />}
      to={route('/expenses/:id/edit', { id: expenseId })}
      linkTarget="_blank"
    >
      {trans('view_expense', { expense: expenseResponse?.number })}
    </DropdownElement>
  );
}
