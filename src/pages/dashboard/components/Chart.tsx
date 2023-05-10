/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { date as formatDate } from '$app/common/helpers';
import { TotalColors } from './Totals';
import {
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
} from 'recharts';

type Props = {
  data: {
    invoices: { total: string; date: string; currency: string }[];
    payments: { total: string; date: string; currency: string }[];
    expenses: {
      total: string;
      date: string;
      currency: string;
    }[];
  };
  dates: any;
  chartSensitivity: 'day' | 'week' | 'month';
};

export function Chart(props: Props) {
  const { t } = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const [chartData, setChartData] = useState<unknown[]>([]);

  const generateDateRange = (start: Date, end: Date, range: 1 | 7 | 30) => {
    const date = new Date(start.getTime());

    const dates = [];

    while (date <= end) {
      dates.push(new Date(date));
      date.setDate(date.getDate() + range);
    }

    return dates;
  };

  useEffect(() => {
    const data: {
      date: string;
      invoices: number;
      expenses: number;
      payments: number;
    }[] = [];

    if (props.chartSensitivity === 'day') {
      const dates = generateDateRange(
        new Date(props.dates.start_date),
        new Date(props.dates.end_date),
        1
      );

      dates.map((date) => {
        data.push({
          date: formatDate(date.toString(), dateFormat),
          invoices: 0,
          expenses: 0,
          payments: 0,
        });
      });
    }

    if (props.chartSensitivity === 'week') {
      const dates = generateDateRange(
        new Date(props.dates.start_date),
        new Date(props.dates.end_date),
        7
      );

      dates.map((date) => {
        data.push({
          date: formatDate(date.toString(), dateFormat),
          invoices: 0,
          expenses: 0,
          payments: 0,
        });
      });
    }

    if (props.chartSensitivity === 'month') {
      const dates = generateDateRange(
        new Date(props.dates.start_date),
        new Date(props.dates.end_date),
        30
      );

      dates.map((date) => {
        data.push({
          date: formatDate(date.toString(), dateFormat),
          invoices: 0,
          expenses: 0,
          payments: 0,
        });
      });
    }

    props.data?.invoices.forEach((invoice) => {
      const date = formatDate(invoice.date, dateFormat);
      const record = data.findIndex((entry) => entry.date === date);

      if (record >= 0) {
        data[record].invoices += parseFloat(invoice.total);
      }
    });

    props.data?.expenses.forEach((expense) => {
      const date = formatDate(expense.date, dateFormat);
      const record = data.findIndex((entry) => entry.date === date);

      if (record >= 0) {
        data[record].expenses += parseFloat(expense.total);
      }
    });

    props.data?.payments.forEach((payment) => {
      const date = formatDate(payment.date, dateFormat);
      const record = data.findIndex((entry) => entry.date === date);

      if (record >= 0) {
        data[record].payments += parseFloat(payment.total);
      }
    });

    setChartData(data);
  }, [props]);

  return (
    <ResponsiveContainer width="100%" height={330}>
      <LineChart height={200} data={chartData} margin={{ top: 9, left: 20 }}>
        <Line
          id="payments"
          type="monotone"
          name={t('payments') || ''}
          dataKey="payments"
          stroke={TotalColors.Green}
          dot={false}
          strokeWidth={2}
        />

        <Line
          id="expenses"
          type="monotone"
          name={t('expenses') || ''}
          dataKey="expenses"
          stroke={TotalColors.Red}
          dot={false}
          strokeWidth={2}
        />

        <Line
          id="invoices"
          type="monotone"
          name={t('invoices') || ''}
          dataKey="invoices"
          stroke={TotalColors.Blue}
          dot={false}
          strokeWidth={2}
        />

        <CartesianGrid strokeDasharray="0" vertical={false} />
        <Tooltip />

        <XAxis height={50} dataKey="date" />
        <YAxis domain={[0, 1000]} interval={0} tickCount={6} />
      </LineChart>
    </ResponsiveContainer>
  );
}
