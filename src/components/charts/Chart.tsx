/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ChartDataDTO, ChartMapDTO } from 'common/dtos/TotalsDTO';
import React, { useEffect, useState } from 'react';
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
  data: ChartDataDTO;
  dates: any;
  chartSensitivity: 'day' | 'week' | 'month';
};

export default function Chart(props: Props) {
  const [ChartData, setChartData] = useState<unknown[]>([]);

  useEffect(() => {
    const CompleteChartData: ChartMapDTO[] = [];

    switch (props.chartSensitivity) {
      case 'day': {
        for (
          let date = new Date(props.dates.start_date);
          date < new Date(props.dates.end_date);
          date.setDate(date.getDate() + 1)
        ) {
          CompleteChartData.push({
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
          CompleteChartData.push({
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
          CompleteChartData.push({
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
      let item_added = false;
      CompleteChartData.forEach((element) => {
        if (element.name === item.date) {
          element.expenses = item.total;
          item_added = true;
        }
      });
      if (!item_added) {
        CompleteChartData.push({
          name: item.date,
          invoices: '0',
          expenses: item.total,
          payments: '0',
        });
      }
    });
    props.data?.payments.forEach((item) => {
      let item_added = false;

      CompleteChartData.forEach((element) => {
        if (element.name === item.date) {
          element.payments = item.total;
          item_added = true;
        }
      });
      if (!item_added) {
        CompleteChartData.push({
          name: item.date,
          invoices: '0',
          expenses: '0',
          payments: item.total,
        });
      }
    });
    props.data?.invoices.forEach((item) => {
      let item_added = false;

      CompleteChartData.forEach((element) => {
        if (element.name === item.date) {
          element.invoices = item.total;
          item_added = true;
        }
      });
      if (!item_added) {
        CompleteChartData.push({
          name: item.date,
          invoices: item.total,
          expenses: '0',
          payments: '0',
        });
      }
    });

    CompleteChartData.sort((a, b) => {
      return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
    });
    setChartData(CompleteChartData);
  }, [props]);

  return (
    <>
      <div>
        <ResponsiveContainer width={'100%'} height={250}>
          <AreaChart height={200} data={ChartData}>
            <Legend></Legend>
            <defs>
              <linearGradient id="colorpayments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#131317" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#131317" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorexpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorincoices" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#58585c" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#58585c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />

            <XAxis height={50} dataKey="name" />
            <YAxis />
            <Area
              dataKey="payments"
              stroke="#131317"
              fill="url(#colorpayments)"
              fillOpacity={1}
            />
            <Area
              dataKey="expenses"
              stroke="#82ca9d"
              fill="url(#colorexpenses)"
              fillOpacity={1}
            />
            <Area
              dataKey="invoices"
              stroke="#58585c"
              fill="url(#colorinvoices)"
              fillOpacity={1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
