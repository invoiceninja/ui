/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date, trans } from '$app/common/helpers';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { ActivityRecord } from '$app/common/interfaces/activity-record';
import { route } from '$app/common/helpers/route';
import reactStringReplace from 'react-string-replace';
import { Link } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';

export function useGenerateActivityElement() {
  const { dateFormat } = useCurrentCompanyDateFormats();
  const { t } = useTranslation();

  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();

  const contact = (activity: ActivityRecord) => {
    if (!activity.client) {
      return t('client');
    }

    const generate = (activity: ActivityRecord) => {
      let text = trans(`activity_${activity.activity_type_id}`, {});

      const replacements = {
        client: (
          <Link to={route('/clients/:id', { id: activity.client[1] })}>
            {activity.client[0]}
          </Link>
        ),
        contact: (
          <Link to={route('/clients/:id', { id: activity.client[1] })}>
            {activity.client[0]}
          </Link>
        ),
        quote: (
          <Link to={route('/quotes/:id/edit', { id: activity.quote[1] })}>
            {activity.quote[0]}
          </Link>
        ),
        user: activity?.user
          ? activity.user[0]
          : 'System',
        expense: (
          <Link
            to={route('/expenses/:id/edit', { id: activity.expense[1] })}
          >
            {activity?.expense[0]}
          </Link>
        ),
        recurring_invoice: (
          <Link
            to={route('/recurring_invoices/:id/edit', {
              id: activity.recurring_invoice[1],
            })}
          >
            {activity?.recurring_invoice[0]}
          </Link>
        ),
        recurring_expense: (
          <Link
            to={route('/recurring_expenses/:id/edit', {
              id: activity.recurring_expense[1],
            })}
          >
            {activity?.recurring_expense[0]}
          </Link>
        ),
        purchase_order: (
          <Link
            to={route('/purchase_orders/:id/edit', {
              id: activity.purchase_order[1],
            })}
          >
            {activity?.purchase_order[0]}
          </Link>
        ),
        invoice: (
          <Link
            to={route('/invoices/:id/edit', { id: activity.invoice[1] })}
          >
            {activity?.invoice[0]}
          </Link>
        ),
        payment_amount:
          activity.payment[0],
        payment: (
          <Link to={route('/payments/:id', { id: activity.payment[1] })}>
            {activity?.payment[0]}
          </Link>
        ),
        credit: (
          <Link
            to={route('/credits/:id/edit', { id: activity.credit[1] })}
          >
            {activity?.credit[0]}
          </Link>
        ),
        task: (
          <Link to={route('/tasks/:id/edit', { id: activity.task[1] })}>
            {activity?.task[0]}
          </Link>
        ),
        vendor: (
          <Link to={route('/vendors/:id', { id: activity.vendor[1] })}>
            {activity?.vendor[0]}
          </Link>
        ),
        subscription: (
          <Link
            to={route('/settings/subscriptions/:id/edit', {
              id: activity.subscription[1],
            })}
          >
            {activity?.subscription[0]}
          </Link>
        ),
        adjustment:
          activity.payment_adjustment,
      };

      for (const [variable, value] of Object.entries(replacements)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        text = reactStringReplace(text, `:${variable}`, () => value);
      }

      return text;
    };

    return (activity: ActivityRecord) => (
      <div className="flex flex-col py-2 border border-b-gray-200 border-t-0 border-x-0 last:border-b-0 hover:bg-gray-50">
        <div className="flex flex-col">
          <span className="text-sm">{generate(activity)}</span>

          <div className="flex space-x-3">
            <span className="dark:text-white text-sm">
              {date(activity.created_at, dateFormat)}
            </span>

            <span className="text-gray-500 text-sm">{activity.ip}</span>
          </div>
        </div>
      </div>
    );
  }
}