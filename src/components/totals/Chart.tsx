/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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
  const [t] = useTranslation();
  const [chartData, setchartData] = useState<unknown[]>([]);

  useEffect(() => {
    const completeChartData: {
      name: string;
      invoices: string;
      expenses: string;
      payments: string;
    }[] = [];

    switch (props.chartSensitivity) {
      case 'day': {
        for (
          let date = new Date(props.dates.start_date);
          date < new Date(props.dates.end_date);
          date.setDate(date.getDate() + 1)
        ) {
          completeChartData.push({
            name: date.toISOString().split('T')[0],
            invoices: '0',
            expenses: '0',
            payments: '0',
          });
        }
        break;
      }
      case 'week': {
        for (
          let date = new Date(props.dates.start_date);
          date < new Date(props.dates.end_date);
          date.setDate(date.getDate() + 7)
        ) {
          completeChartData.push({
            name: date.toISOString().split('T')[0],
            invoices: '0',
            expenses: '0',
            payments: '0',
          });
        }
        break;
      }
      case 'month': {
        for (
          let date = new Date(props.dates.start_date);
          date < new Date(props.dates.end_date);
          date.setDate(date.getDate() + 30)
        ) {
          completeChartData.push({
            name: date.toISOString().split('T')[0],
            invoices: '0',
            expenses: '0',
            payments: '0',
          });
        }
        break;
      }
    }

    props.data?.expenses.forEach((item) => {
      let itemAdded = false;
      completeChartData.forEach((element) => {
        if (element.name === item.date) {
          element.expenses = item.total;
          itemAdded = true;
        }
      });
      if (!itemAdded) {
        completeChartData.push({
          name: item.date,
          invoices: '0',
          expenses: item.total,
          payments: '0',
        });
      }
    });
    props.data?.payments.forEach((item) => {
      let itemAdded = false;

      completeChartData.forEach((element) => {
        if (element.name === item.date) {
          element.payments = item.total;
          itemAdded = true;
        }
      });
      if (!itemAdded) {
        completeChartData.push({
          name: item.date,
          invoices: '0',
          expenses: '0',
          payments: item.total,
        });
      }
    });
    props.data?.invoices.forEach((item) => {
      let itemAdded = false;

      completeChartData.forEach((element) => {
        if (element.name === item.date) {
          element.invoices = item.total;
          itemAdded = true;
        }
      });
      if (!itemAdded) {
        completeChartData.push({
          name: item.date,
          invoices: item.total,
          expenses: '0',
          payments: '0',
        });
      }
    });

    completeChartData.sort((a, b) => {
      return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
    });
    setchartData(completeChartData);
  }, [props]);

  return (
    <ResponsiveContainer width={'100%'} height={250}>
      <AreaChart height={200} data={chartData}>
        <Legend></Legend>
        <defs>
          <linearGradient id="colorpayments" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#15803d" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorexpenses" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4b5563" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#4b5563" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorincoices" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#000000" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#000000" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />

        <XAxis height={50} dataKey="name" />
        <YAxis />
        <Area
          name={t('invoices')}
          dataKey="invoices"
          stroke="#000000"
          fill="url(#colorinvoices)"
          fillOpacity={1}
        />
        <Area
          name={t('payments')}
          dataKey="payments"
          stroke="#15803d"
          fill="url(#colorpayments)"
          fillOpacity={1}
        />
        <Area
          name={t('expenses')}
          dataKey="expenses"
          stroke="#4b5563"
          fill="url(#colorexpenses)"
          fillOpacity={1}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
