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
import { ChartData, TotalColors } from './Totals';
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
  data: ChartData;
  dates: any;
  chartSensitivity: 'day' | 'week' | 'month';
};

type LineChartData = {
  date: string;
  invoices: number;
  outstanding: number;
  payments: number;
}[];

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

  const getRecordIndex = (data: LineChartData | undefined, date: string) => {
    let recordIndex = -1;

    if (!data || !date) return recordIndex;

    data.forEach((entry, index) => {
      if (entry.date === date) {
        recordIndex = index;
      } else if (index + 1 <= data.length) {
        if (
          data[index] &&
          data[index + 1] &&
          new Date(date) >= new Date(data[index].date) &&
          new Date(date) <= new Date(data[index + 1].date)
        ) {
          recordIndex = index;
        }
      }
    });

    return recordIndex;
  };

  useEffect(() => {
    const data: LineChartData = [];

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
          outstanding: 0,
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
          outstanding: 0,
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
          outstanding: 0,
          payments: 0,
        });
      });
    }

    props.data?.invoices.forEach((invoice) => {
      const date = formatDate(invoice.date, dateFormat);
      const recordIndex = getRecordIndex(data, date);

      if (recordIndex >= 0) {
        data[recordIndex].invoices += parseFloat(invoice.total);
      }
    });

    props.data?.outstanding.forEach((outstanding) => {
      const date = formatDate(outstanding.date, dateFormat);
      const recordIndex = getRecordIndex(data, date);

      if (recordIndex >= 0) {
        data[recordIndex].outstanding += parseFloat(outstanding.total);
      }
    });

    props.data?.payments.forEach((payment) => {
      const date = formatDate(payment.date, dateFormat);
      const recordIndex = getRecordIndex(data, date);

      if (recordIndex >= 0) {
        data[recordIndex].payments += parseFloat(payment.total);
      }
    });

    setChartData(data);
  }, [props]);

  return (
    <ResponsiveContainer width="100%" height={330}>
      <LineChart height={200} data={chartData} margin={{ top: 9, left: 20 }}>
        <Line
          id="invoices"
          type="monotone"
          name={t('invoices') || ''}
          dataKey="invoices"
          stroke={TotalColors.Blue}
          dot={false}
          strokeWidth={2}
        />

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
          id="outstanding"
          type="monotone"
          name={t('outstanding') || ''}
          dataKey="outstanding"
          stroke={TotalColors.Red}
          dot={false}
          strokeWidth={2}
        />

        <CartesianGrid strokeDasharray="0" vertical={false} />
        <Tooltip />

        <XAxis dataKey="date" />
        <YAxis interval={0} tickCount={6} />
      </LineChart>
    </ResponsiveContainer>
  );
}
