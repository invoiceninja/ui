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
import { date } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useExpenseQuery } from '$app/common/queries/expenses';
import { Link } from '$app/components/forms';
import { ArrowRight } from '$app/components/icons/ArrowRight';
import { useTranslation } from 'react-i18next';

interface Props {
  expenseId: string;
}
export function ViewLineItemExpense(props: Props) {
  const { expenseId } = props;

  const [t] = useTranslation();

  const colors = useColorScheme();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const { data: expenseResponse } = useExpenseQuery({ id: expenseId });

  return (
    <>
      {expenseResponse && (
        <div className="flex items-center space-x-1">
          <span className="text-sm" style={{ color: colors.$3 }}>
            {date(expenseResponse.date, dateFormat)} -
          </span>

          <span className="text-sm" style={{ color: colors.$3 }}>
            {t('expense')}
          </span>

          <div>
            <ArrowRight color={colors.$17} size="1.1rem" />
          </div>

          <Link to={route('/expenses/:id/edit', { id: expenseId })}>
            # {expenseResponse.number}
          </Link>
        </div>
      )}
    </>
  );
}
