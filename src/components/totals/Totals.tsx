/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import { Button } from '@invoiceninja/forms';
import { AxiosResponse } from 'axios';
import { endpoint, request } from 'common/helpers';
import { defaultHeaders } from 'common/queries/common/headers';
import Chart from 'components/charts/Chart';

import React, { useEffect, useState } from 'react';

import Total from './Total';
import {
  ChartDataDTO,
  RequestBodyDTO,
  TotalDataDTO,
} from '../../common/dtos/TotalsDTO';
import { Spinner } from 'components/Spinner';
import DropdownDateRangePicker from '../DropdownDateRangePicker';
import { Card } from '@invoiceninja/cards';

export default function Totals() {
  const [TotalsIsLoading, setTotalsIsLoading] = useState(true);
  const [ChartDataIsLoading, setChartDataIsLoading] = useState(true);
  const [TotalsData, setTotals] = useState<TotalDataDTO[]>([]);
  const [Currencies, setCurrencies] = useState([]);
  const [ChartData, setChartData] = useState<ChartDataDTO[]>([]);
  const [Currency, setCurrency] = useState(1);
  const [ChartScale, setChartScale] = useState<'day' | 'week' | 'month'>('day');
  //default date is last 7 days
  const [body, setbody] = useState<RequestBodyDTO>({
    start_date: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() - 7
    )
      .toISOString()
      .split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  const handleDateChange = (DateSet: string) => {
    const data = DateSet.split(',');
    const s_date = new Date(DateSet.split(',')[0]);
    const e_date = new Date(DateSet.split(',')[1]);

    if (s_date > e_date) {
      setbody({
        start_date: data[1],
        end_date: data[0],
      });
    } else {
      setbody({ start_date: data[0], end_date: data[1] });
    }
  };
  const getTotals = async () => {
    await request(
      'POST',
      endpoint('/api/v1/charts/totals'),
      body,
      defaultHeaders
    ).then((response: AxiosResponse) => {
      setTotals(response.data);
      setCurrencies(response.data.currencies);

      setTotalsIsLoading(false);
    });
  };

  const getChartData = async () => {
    await request(
      'POST',
      endpoint('/api/v1/charts/chart_summary'),
      body,
      defaultHeaders
    ).then((response: AxiosResponse) => {
      setChartData(response.data);
      setChartDataIsLoading(false);
    });
  };

  useEffect(() => {
    getTotals();
    getChartData();
  }, [body]);
  return (
    <div className="max-w-screen-2xl mx-auto">
      {TotalsIsLoading && <Spinner />}

      {!TotalsIsLoading && (
        <div className="flex flex-col sm:grid grid-cols-3 gap-5 my-5 ">
          <div className="flex flex-wrap justify-center col-start-2">
            {Currencies &&
              Object.entries(Currencies).map(([key, value]) => {
                return (
                  <Button
                    key={`currency-btn-${key}`}
                    value={value}
                    type="secondary"
                    className={'mx-0.5'}
                    onClick={() => {
                      setCurrency(Number(key));
                    }}
                  >
                    {String(value)}
                  </Button>
                );
              })}
          </div>
          <div className="flex justify-center sm:justify-start">
            <Button
              key={`day-btn`}
              className={'mx-0.5'}
              type="secondary"
              onClick={() => {
                setChartScale('day');
              }}
            >
              Day
            </Button>
            <Button
              key={`week-btn`}
              className={'mx-0.5 '}
              type="secondary"
              onClick={() => {
                setChartScale('week');
              }}
            >
              Week
            </Button>
            <Button
              key={`month-btn`}
              className={'mx-0.5'}
              type="secondary"
              onClick={() => {
                setChartScale('month');
              }}
            >
              Month
            </Button>
          </div>
          <div className="flex justify-center  sm:col-start-3 ">
            <DropdownDateRangePicker
              handleDateChange={handleDateChange}
              start_date={body.start_date}
              end_date={body.end_date}
            ></DropdownDateRangePicker>
          </div>
          {TotalsData[Currency] && (
            <>
              <div>
                {' '}
                <Total
                  Title="Total Revenue"
                  Amount={TotalsData[Currency].revenue.paid_to_date}
                  Currency={TotalsData[Currency].revenue.code}
                ></Total>
              </div>
              <div>
                {' '}
                <Total
                  Title="Total Expenses"
                  Amount={TotalsData[Currency].expenses.amount}
                  Currency={TotalsData[Currency].expenses.code}
                ></Total>
              </div>
              <div>
                {' '}
                <Total
                  Title="Outstanding"
                  Amount={'70000.52'}
                  Currency={TotalsData[Currency].revenue.code}
                ></Total>
              </div>
            </>
          )}
        </div>
      )}

      {ChartDataIsLoading && <Spinner />}

      <Card className="px-4 ">
        <div>
          <Chart
            chartSensitivity={ChartScale}
            dates={{ start_date: body.start_date, end_date: body.end_date }}
            data={ChartData[Currency]}
          ></Chart>
        </div>
      </Card>
    </div>
  );
}
