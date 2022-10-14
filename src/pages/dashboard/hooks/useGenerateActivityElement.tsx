/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date, trans } from 'common/helpers';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { ActivityRecord } from 'common/interfaces/activity-record';
import { route } from 'common/helpers/route';
import { useCallback } from 'react';
import { NonClickableElement } from 'components/cards/NonClickableElement';
import reactStringReplace from 'react-string-replace';
import { Link } from '@invoiceninja/forms';
import { useTranslation } from 'react-i18next';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';

export function useGenerateActivityElement() {
  const { dateFormat } = useCurrentCompanyDateFormats();
  const { t } = useTranslation();

  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();

  const contact = (activity: ActivityRecord) => {
    if (!activity.client) {
      return t('client');
    }

    // First use primary contact, if possible.
    const primary = activity.client.contacts.find(
      (contact) => contact.is_primary
    );

    if (primary) {
      return `${primary.first_name} ${primary.last_name}`;
    }

    // If we don't have a primary, let's just use first contact.
    const first = activity.client.contacts[0];

    if (first) {
      return `${first.first_name} ${first.last_name}`;
    }

    // As a fallback, use client name.
    return activity.client.display_name;
  };

  const generate = useCallback((activity: ActivityRecord) => {
    let text = trans(`activity_${activity.activity_type_id}`, {});

    const replacements = {
      client: (
        <Link to={route('/clients/:id', { id: activity.client?.hashed_id })}>
          {activity.client?.name}
        </Link>
      ),
      contact: (
        <Link to={route('/clients/:id', { id: activity.client?.hashed_id })}>
          {contact(activity)}
        </Link>
      ),
      quote: (
        <Link to={route('/quotes/:id/edit', { id: activity.quote?.hashed_id })}>
          {activity.quote?.number}
        </Link>
      ),
      user: activity?.user ? (
        <Link
          to={route('/settings/users/:id/edit', {
            id: activity.user?.hashed_id,
          })}
        >
          {activity?.user?.first_name} {activity?.user?.last_name}
        </Link>
      ) : (
        'System'
      ),
      expense: (
        <Link
          to={route('/expenses/:id/edit', { id: activity.expense?.hashed_id })}
        >
          {activity?.expense?.number}
        </Link>
      ),
      recurring_invoice: (
        <Link
          to={route('/recurring_invoices/:id/edit', {
            id: activity.recurring_invoice?.hashed_id,
          })}
        >
          {activity?.recurring_invoice?.number}
        </Link>
      ),
      invoice: (
        <Link
          to={route('/invoices/:id/edit', { id: activity.invoice?.hashed_id })}
        >
          {activity?.invoice?.number}
        </Link>
      ),
      payment_amount:
        activity.payment &&
        formatMoney(
          activity.payment.amount,
          activity.client?.country_id || company?.settings.country_id,
          activity.client?.settings.currency_id || company?.settings.currency_id
        ),
      payment: (
        <Link to={route('/payments/:id', { id: activity.payment?.hashed_id })}>
          {activity?.payment?.number}
        </Link>
      ),
      credit: (
        <Link
          to={route('/credits/:id/edit', { id: activity.credit?.hashed_id })}
        >
          {activity?.credit?.number}
        </Link>
      ),
      task: (
        <Link to={route('/tasks/:id/edit', { id: activity.credit?.hashed_id })}>
          {activity?.task?.number}
        </Link>
      ),
      vendor: (
        <Link to={route('/vendors/:id', { id: activity.vendor?.hashed_id })}>
          {activity?.vendor?.name}
        </Link>
      ),
      adjustment:
        activity.payment &&
        formatMoney(
          activity.payment.refunded,
          activity.client?.country_id || company?.settings.country_id,
          activity.client?.settings.currency_id || company?.settings.currency_id
        ),
    };

    for (const [variable, value] of Object.entries(replacements)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      text = reactStringReplace(text, `:${variable}`, () => value);
    }

    return text;
  }, [company]);

  return (activity: ActivityRecord) => (
    <NonClickableElement>
      {generate(activity)}

      <p className="text-gray-500 text-xs">
        {date(activity.created_at, dateFormat)} &#183; {activity.ip}
      </p>
    </NonClickableElement>
  );
}
