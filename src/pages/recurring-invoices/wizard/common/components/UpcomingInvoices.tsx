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
import { Badge } from '$app/components/Badge';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../helpers/dates';
import { dueDate } from '../helpers/schedule';

interface Due {
  dueDateDays: string | undefined;
  terms: string | number | null | undefined;
}

interface Props {
  dates: string[];
  firstTag?: string;
  due?: Due;
}

export function UpcomingInvoices({ dates, firstTag, due }: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const rows = dates.map((date) => {
    return {
      date,
      due: due ? dueDate(date, due.dueDateDays, due.terms) : null,
    };
  });

  const withDue = rows.some((row) => row.due !== null);

  if (!rows.length) {
    return null;
  }

  return (
    <div
      className="border px-4 py-3.5"
      style={{
        borderColor: colors.$24,
        borderRadius: '0.375rem',
        backgroundColor: colors.$1,
      }}
    >
      <p
        className="text-xs mb-2"
        style={{ color: colors.$22, fontWeight: 500 }}
      >
        {t('upcoming_invoices')}
      </p>

      <table className="w-full text-sm">
        {withDue ? (
          <thead>
            <tr>
              <th
                className="text-left text-xs pb-1"
                style={{ color: colors.$22, fontWeight: 400 }}
              >
                {t('send_date')}
              </th>
              <th
                className="text-left text-xs pb-1"
                style={{ color: colors.$22, fontWeight: 400 }}
              >
                {t('due_date')}
              </th>
            </tr>
          </thead>
        ) : null}

        <tbody style={{ fontVariantNumeric: 'tabular-nums' }}>
          {rows.map((row, index) => (
            <tr key={row.date}>
              <td
                className="py-0.5 pr-4 whitespace-nowrap"
                style={{ color: colors.$3 }}
              >
                {formatDate(row.date)}

                {index === 0 && firstTag ? (
                  <Badge className="ml-2" variant="primary">
                    {firstTag}
                  </Badge>
                ) : null}
              </td>

              {withDue ? (
                <td className="py-0.5" style={{ color: colors.$3 }}>
                  {row.due ? formatDate(row.due) : null}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
