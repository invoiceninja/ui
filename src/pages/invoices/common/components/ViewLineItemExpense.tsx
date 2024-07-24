/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useExpenseQuery } from '$app/common/queries/expenses';
import { Link } from '$app/components/forms';
import { useTranslation } from 'react-i18next';

interface Props {
  expenseId: string;
}
export function ViewLineItemExpense(props: Props) {
  const [t] = useTranslation();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const { expenseId } = props;

  const { data: expenseResponse } = useExpenseQuery({ id: expenseId });

  return (
    <>
      {expenseResponse && (
        <div className="flex items-center space-x-1">
          <span className="text-sm">
            {date(expenseResponse.date, dateFormat)} -
          </span>

          <span className="text-sm">
            {t('expense')} {'=>'}
          </span>

          <Link to={route('/expenses/:id/edit', { id: expenseId })}>
            # {expenseResponse.number}
          </Link>
        </div>
      )}
    </>
  );
}
