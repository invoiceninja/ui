/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { date as formatDate } from 'common/helpers';
import { TotalColors } from './Totals';

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
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart height={200} data={chartData}>
        <Legend />
        <defs>
          <Line id="payments" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={TotalColors.Green} stopOpacity={0.8} />
            <stop offset="95%" stopColor={TotalColors.Green} stopOpacity={0} />
          </Line>
          <Line id="expenses" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={TotalColors.Red} stopOpacity={0.8} />
            <stop offset="95%" stopColor={TotalColors.Red} stopOpacity={0} />
          </Line>
          <Line id="invoices" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={TotalColors.Blue} stopOpacity={0.8} />
            <stop offset="95%" stopColor={TotalColors.Blue} stopOpacity={0} />
          </Line>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />

        <XAxis height={50} dataKey="date" />
        <YAxis />
        <Area
          name={t('invoices') ?? ''}
          dataKey="invoices"
          stroke={TotalColors.Blue}
          fill="url(#invoices)"
          fillOpacity={1}
        />
        <Area
          name={t('payments') ?? ''}
          dataKey="payments"
          stroke={TotalColors.Green}
          fill="url(#payments)"
          fillOpacity={1}
        />
        <Area
          name={t('expenses') ?? ''}
          dataKey="expenses"
          stroke={TotalColors.Red}
          fill="url(#expenses)"
          fillOpacity={1}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
