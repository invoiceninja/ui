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
import { Chart } from 'components/charts/Chart';

import { useEffect, useState } from 'react';

import { Spinner } from 'components/Spinner';
import { DropdownDateRangePicker } from '../DropdownDateRangePicker';
import { Card } from '@invoiceninja/cards';
import { Container } from 'components/Container';
import { useTranslation } from 'react-i18next';
import { InfoCard } from 'components/InfoCard';
import Select from 'react-select';

export function Totals() {
  const [totalsIsLoading, settotalsIsLoading] = useState(true);
  const [chartDataIsLoading, setchartDataIsLoading] = useState(true);
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
  const [ChartData, setChartData] = useState<
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
  const [Currency, setCurrency] = useState(1);
  const [ChartScale, setChartScale] = useState<'day' | 'week' | 'month'>('day');
  //default date is last 7 days
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
  const [t] = useTranslation();

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
    ).then((response: AxiosResponse) => {
      setChartData(response.data);
      setchartDataIsLoading(false);
    });
  };

  useEffect(() => {
    getTotals();
    getChartData();
  }, [body]);
  return (
    <Container>
      {totalsIsLoading && (
        <div className="w-full flex justify-center">
          <Spinner />
        </div>
      )}

      {!totalsIsLoading && (
        <div className="flex flex-col sm:grid grid-cols-3 gap-5 my-5 ">
          <div className="flex flex-wrap justify-center col-start-2">
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
          </div>
          <div className="flex justify-center sm:justify-">
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
          </div>
          <div className="flex justify-center  sm:col-start-3 ">
            <DropdownDateRangePicker
              handleDateChange={handleDateChange}
              startDate={body.start_date}
              endDate={body.end_date}
            />
          </div>
          {totalsData[Currency] && (
            <>
              <div>
                {' '}
                <InfoCard
                  className="w-full h-44"
                  title={`${t('total')} ${t('revenue')}`}
                  value={
                    <>
                      <div className=" text-2xl w-full h-24 py-4 font-black flex justify-start ">
                        {totalsData[Currency].revenue.code}{' '}
                        {totalsData[Currency].revenue.paid_to_date
                          ? new Intl.NumberFormat().format(
                              Number(totalsData[Currency].revenue.paid_to_date)
                            )
                          : '--'}
                      </div>
                    </>
                  }
                />
              </div>
              <div>
                {' '}
                <InfoCard
                  className="w-full h-44"
                  title={`${t('total')} ${t('expenses')}`}
                  value={
                    <>
                      <div className=" text-2xl w-full h-24 py-4 font-black flex justify-start ">
                        {totalsData[Currency].expenses.code}{' '}
                        {totalsData[Currency].expenses.amount
                          ? new Intl.NumberFormat().format(
                              Number(totalsData[Currency].expenses.amount)
                            )
                          : '--'}
                      </div>
                    </>
                  }
                />
              </div>
              <div>
                {' '}
                <InfoCard
                  className="w-full h-44"
                  title={`${t('outstanding')}`}
                  value={
                    <>
                      <div className=" text-2xl w-full h-24 py-4 font-black flex justify-start ">
                        {totalsData[Currency].outstanding.code}{' '}
                        {totalsData[Currency].outstanding.amount
                          ? new Intl.NumberFormat().format(
                              Number(totalsData[Currency].outstanding.amount)
                            )
                          : '--'}
                      </div>
                    </>
                  }
                />
              </div>
            </>
          )}
        </div>
      )}

      {chartDataIsLoading && (
        <div className="w-full flex justify-center">
          <Spinner />
        </div>
      )}

      <Card>
        <div className="px-4 py-4">
          {!chartDataIsLoading && (
            <Chart
              chartSensitivity={ChartScale}
              dates={{ start_date: body.start_date, end_date: body.end_date }}
              data={ChartData[Currency]}
            ></Chart>
          )}
        </div>
      </Card>
    </Container>
  );
}
