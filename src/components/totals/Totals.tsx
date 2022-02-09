/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import { Button, Datepicker, SelectField } from '@invoiceninja/forms';
import { AxiosResponse } from 'axios';
import { classNames, endpoint, request } from 'common/helpers';
import { defaultHeaders } from 'common/queries/common/headers';
import Chart from 'components/charts/Chart';
import { InfoCard } from 'components/InfoCard';
import { DateRangePicker } from 'react-date-range';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import Total from './Total';
import { ChartDataDTO, TotalDataDTO } from '../../common/dtos/TotalsDTO';
import { Spinner } from 'components/Spinner';
import DropdownDateRangePicker from './DropdownDateRangePicker';
import { Calendar } from 'react-feather';
import { Card } from '@invoiceninja/cards';

type Props = {};

export default function Totals({}: Props) {
  const [TotalsIsLoading, setTotalsIsLoading] = useState(true);
  const [ChartDataIsLoading, setChartDataIsLoading] = useState(true);
  const [AllTotalsData, setAllTotalsData] = useState([]);
  const [TotalsData, setTotals] = useState<TotalDataDTO[]>([]);
  const [Currencies, setCurrencies] = useState([]);
  const [ChartData, setChartData] = useState<ChartDataDTO[]>([]);
  const [Currency, setCurrency] = useState(1);
  const [ChartScale, setChartScale] = useState<'day' | 'week' | 'month'>('day');
  const [body, setbody] = useState<{ start_date: string; end_date: string }>({
    start_date: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() - 7
    )
      .toISOString()
      .split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  const switchCurrency = (id: string) => {
    setCurrency(Number(id));
  };
  const handleDateChange = (DateSet: string) => {
    console.log("input date",DateSet.split(','))
    let data = DateSet.split(',');

    let s_date = new Date(DateSet.split(',')[0]);
    let e_date = new Date(DateSet.split(',')[1]);
    
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
      setAllTotalsData(response.data);
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
      console.log(response.data[Currency]);
      setChartDataIsLoading(false);
    });
  };

  useEffect(() => {
    console.log("useefect dates ",body)
    getTotals();
    getChartData();
  }, [body]);
  const active = '   focus:outline-none focus:ring-1 focus:ring-slate-800';
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
                      switchCurrency(key);
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
      <button
        onClick={() => {
          console.log('------------------------------------------------------');
          console.log('currency', Currency);
          console.log('currencies', Currencies);
          console.log('chart scale', ChartScale);
          console.log('selected dates', body);

          console.log('chart data:', ChartData);
          console.log('totals data:', TotalsData);
        }}
      >
        {' '}
        test all data
      </button>
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
