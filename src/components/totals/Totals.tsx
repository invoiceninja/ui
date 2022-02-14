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
import { Chart } from 'components/totals/Chart';

import { useEffect, useState } from 'react';

import { Spinner } from 'components/Spinner';
import { DropdownDateRangePicker } from '../DropdownDateRangePicker';
import { Card } from '@invoiceninja/cards';
import { Container } from 'components/Container';
import { useTranslation } from 'react-i18next';
import { InfoCard } from 'components/InfoCard';
import Select from 'react-select';

export function Totals() {
  const [t] = useTranslation();

  const [totalsIsLoading, settotalsIsLoading] = useState(true);
  const [totalsData, setTotals] = useState<
    {
      revenue: { paid_to_date: string; code: string };
      expenses: { amount: string; code: string };
      outstanding: { amount: string; code: string };
    }[]
  >([]);

  const [currencies, setCurrencies] = useState<
    { value: string; label: unknown }[]
  >([]);

  const [chartData, setChartData] = useState<
    {
      invoices: { total: string; date: string; currency: string }[];
      payments: { total: string; date: string; currency: string }[];
      expenses: {
        total: string;
        date: string;
        currency: string;
      }[];
    }[]
  >([]);

  const [currency, setCurrency] = useState(1);
  const [chartScale, setChartScale] = useState<'day' | 'week' | 'month'>('day');

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

  const handleDateChange = (DateSet: string) => {
    const [startDate, endDate] = DateSet.split(',');

    if (new Date(startDate) > new Date(endDate)) {
      setbody({
        start_date: endDate,
        end_date: startDate,
      });
    } else {
      setbody({ start_date: startDate, end_date: endDate });
    }
  };

  const getTotals = () => {
    request(
      'POST',
      endpoint('/api/v1/charts/totals'),
      body,
      defaultHeaders
    ).then((response: AxiosResponse) => {
      setTotals(response.data);
      const currencies: { value: string; label: unknown }[] = [];
      Object.entries(response.data.currencies).map(([id, name]) => {
        currencies.push({ value: id, label: name });
      });
      setCurrencies(currencies);

      settotalsIsLoading(false);
    });
  };

  const getChartData = () => {
    request(
      'POST',
      endpoint('/api/v1/charts/chart_summary'),
      body,
      defaultHeaders
    ).then((response: AxiosResponse) => setChartData(response.data));
  };

  useEffect(() => {
    getTotals();
    getChartData();
  }, [body]);

  return (
    <>
      {totalsIsLoading && (
        <div className="w-full flex justify-center">
          <Spinner />
        </div>
      )}

      {/* Quick date, currency & date picker. */}
      <div className="flex justify-end">
        {currencies && (
          <Select
            onChange={(key) => {
              setCurrency(Number(key?.value));
            }}
            defaultValue={currencies[0]}
            placeholder={t('currency')}
            options={currencies}
            isMulti={false}
          />
        )}

        <Button
          key={`day-btn`}
          className={'mx-0.5'}
          type="secondary"
          onClick={() => {
            setChartScale('day');
          }}
        >
          {t('day')}
        </Button>

        <Button
          key={`week-btn`}
          className={'mx-0.5 '}
          type="secondary"
          onClick={() => {
            setChartScale('week');
          }}
        >
          {t('week')}
        </Button>

        <Button
          key={`month-btn`}
          className={'mx-0.5'}
          type="secondary"
          onClick={() => {
            setChartScale('month');
          }}
        >
          {t('month')}
        </Button>

        <div className="flex justify-center  sm:col-start-3 ">
          <DropdownDateRangePicker
            handleDateChange={handleDateChange}
            startDate={body.start_date}
            endDate={body.end_date}
          />
        </div>
      </div>

      {/* Info cards. */}
      {totalsData[currency] && (
        <div className="grid grid-cols-12 gap-4 mt-4">
          <InfoCard
            className="col-span-12 lg:col-span-4"
            title={`${t('total')} ${t('revenue')}`}
            value={
              <Card>
                {totalsData[currency].revenue.code}{' '}
                {totalsData[currency].revenue.paid_to_date
                  ? new Intl.NumberFormat().format(
                      Number(totalsData[currency].revenue.paid_to_date)
                    )
                  : ''}
              </Card>
            }
          />

          <InfoCard
            className="col-span-12 lg:col-span-4"
            title={`${t('total')} ${t('expenses')}`}
            value={
              <Card>
                {totalsData[currency].expenses.code}{' '}
                {totalsData[currency].expenses.amount
                  ? new Intl.NumberFormat().format(
                      Number(totalsData[currency].expenses.amount)
                    )
                  : '0'}
              </Card>
            }
          />

          <InfoCard
            className="col-span-12 lg:col-span-4"
            title={`${t('outstanding')}`}
            value={
              <Card>
                {totalsData[currency].outstanding.code}{' '}
                {totalsData[currency].outstanding.amount
                  ? new Intl.NumberFormat().format(
                      Number(totalsData[currency].outstanding.amount)
                    )
                  : '0'}
              </Card>
            }
          />
        </div>
      )}

      {chartData && (
        <Card withContainer className="mt-4">
          <Chart
            chartSensitivity={chartScale}
            dates={{ start_date: body.start_date, end_date: body.end_date }}
            data={chartData[currency]}
          />
        </Card>
      )}
    </>
  );
}
