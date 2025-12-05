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
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { date as formatDate, useParseDayjs } from '$app/common/helpers';
import { ChartData, TotalColors } from './DashboardGrid.types';
import {
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
} from 'recharts';
import dayjs from 'dayjs';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useColorScheme } from '$app/common/colors';
import { useGenerateWeekDateRange } from '../hooks/useGenerateWeekDateRange';
import { ensureUniqueDates, generateMonthDateRange } from '../helpers/helpers';

type Props = {
  data: ChartData;
  dates: { start_date: string; end_date: string };
  chartSensitivity: 'day' | 'week' | 'month';
  currency: string;
};

type LineChartData = {
  date: string;
  invoices: number;
  outstanding: number;
  payments: number;
  expenses: number;
}[];

export function Chart(props: Props) {
  const [t] = useTranslation();
  const { currency, chartSensitivity } = props;

  const company = useCurrentCompany();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const parseDayjs = useParseDayjs();
  const generateWeekDateRange = useGenerateWeekDateRange();

  const formatMoney = useFormatMoney();

  const [chartData, setChartData] = useState<LineChartData>([]);

  const generateDateRange = (
    startDate: Date,
    endDate: Date,
    period: 'day' | 'week' | 'month'
  ) => {
    let dates = [];

    const start = dayjs(startDate);
    const end = dayjs(endDate);

    let currentDate = start.clone();

    switch (period) {
      case 'day':
        while (currentDate.isBefore(end) || currentDate.isSame(end, 'day')) {
          dates.push(currentDate.toDate());
          currentDate = currentDate.add(1, 'day');
        }
        break;

      case 'week':
        dates = generateWeekDateRange(startDate, endDate);
        break;

      case 'month':
        dates = generateMonthDateRange(start, end);
        break;

      default:
        return [];
    }

    return ensureUniqueDates(dates, end);
  };

  const getRecordIndex = (data: LineChartData | undefined, date: string) => {
    if (!data || !date) return -1;

    let isEntryDateMatch = false;

    const recordIndex = data.findIndex((entry, index) => {
      const nextEntry = data[index + 1];

      if (nextEntry) {
        const dateToCheck = parseDayjs(date);

        const startDate = parseDayjs(entry.date);
        const endDate = parseDayjs(nextEntry.date);

        const isDateInRange =
          dateToCheck.isAfter(startDate) && dateToCheck.isBefore(endDate);

        isEntryDateMatch = entry.date === date;

        return isDateInRange || isEntryDateMatch;
      }

      if (!nextEntry && entry) {
        isEntryDateMatch = entry.date === date;

        return isEntryDateMatch;
      }

      return false;
    });

    return chartSensitivity !== 'day' && recordIndex > -1 && !isEntryDateMatch
      ? recordIndex + 1
      : recordIndex;
  };

  const yAxisWidth = useMemo(() => {
    const properties = ['invoices', 'outstanding', 'payments', 'expenses'];

    const largestTick = chartData.reduce((maxTick, data) => {
      return properties.reduce((currentMax, property) => {
        const currentTickLength = formatMoney(
          typeof data[property as keyof typeof data] === 'number'
            ? Number((data[property as keyof typeof data] as number) * 10)
            : 0,
          company?.settings.country_id,
          currency
        ).toString().length;

        return Math.max(currentMax, currentTickLength);
      }, maxTick);
    }, 0);

    return largestTick ? largestTick * 8.5 : undefined;
  }, [chartData]);

  useEffect(() => {
    const dates = generateDateRange(
      new Date(props.dates.start_date),
      new Date(props.dates.end_date),
      props.chartSensitivity
    );

    const data: LineChartData = dates.map((date) => ({
      date: formatDate(date.toString(), dateFormat),
      invoices: 0,
      outstanding: 0,
      payments: 0,
      expenses: 0,
    }));

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

    props.data?.expenses.forEach((expense) => {
      const date = formatDate(expense.date, dateFormat);
      const recordIndex = getRecordIndex(data, date);

      if (recordIndex >= 0) {
        data[recordIndex].expenses += parseFloat(expense.total);
      }
    });

    setChartData(data);
  }, [props.data, props.dates, props.chartSensitivity]);

  const colors = useColorScheme();

  const formatTooltipValues = (number: string) => {
    return formatMoney(
      Number(number) || 0,
      company.settings.country_id,
      currency,
      2
    ).toString();
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', minHeight: 0, minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, left: 8, right: 8, bottom: 24 }}>
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

        <Line
          id="expenses"
          type="monotone"
          name={t('expenses') || ''}
          dataKey="expenses"
          stroke={TotalColors.Gray}
          dot={false}
          strokeWidth={2}
        />

        <CartesianGrid strokeDasharray="0" vertical={false} />
        <Tooltip formatter={formatTooltipValues} />

        <XAxis
          dataKey="date"
          tickMargin={6}
          tick={{ fontSize: 14 }}
          stroke={colors.$3}
        />

        <YAxis
          interval={0}
          tickCount={6}
          tickFormatter={(value) =>
            formatTooltipValues(value).replace(/ /g, '\u00A0')
          }
          tick={{ fontSize: 12 }}
          width={yAxisWidth}
          stroke={colors.$3}
        />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
