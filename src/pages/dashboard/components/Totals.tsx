/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button, SelectField } from '$app/components/forms';
import { AxiosResponse } from 'axios';
import { endpoint } from '$app/common/helpers';
import { Chart } from '$app/pages/dashboard/components/Chart';
import { useEffect, useState } from 'react';
import { Spinner } from '$app/components/Spinner';
import { DropdownDateRangePicker } from '../../../components/DropdownDateRangePicker';
import { Card } from '$app/components/cards';
import { useTranslation } from 'react-i18next';
import { InfoCard } from '$app/components/InfoCard';
import { request } from '$app/common/helpers/request';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';

interface TotalsRecord {
  revenue: { paid_to_date: string; code: string };
  expenses: { amount: string; code: string };
  outstanding: { amount: string; code: string };
}

interface Currency {
  value: string;
  label: string;
}

interface ChartData {
  invoices: {
    total: string;
    date: string;
    currency: string;
  }[];
  payments: {
    total: string;
    date: string;
    currency: string;
  }[];
  expenses: {
    total: string;
    date: string;
    currency: string;
  }[];
}

export enum TotalColors {
  Green = '#54B434',
  Blue = '#2596BE',
  Red = '#BE4D25',
}

export function Totals() {
  const [t] = useTranslation();

  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();

  const [isLoadingTotals, setIsLoadingTotals] = useState(true);
  const [totalsData, setTotalsData] = useState<TotalsRecord[]>([]);

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [currency, setCurrency] = useState(1);

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [chartScale, setChartScale] = useState<'day' | 'week' | 'month'>('day');

  const [body, setBody] = useState<{ start_date: string; end_date: string }>({
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
      setBody({
        start_date: endDate,
        end_date: startDate,
      });
    } else {
      setBody({ start_date: startDate, end_date: endDate });
    }
  };

  const getTotals = () => {
    request('POST', endpoint('/api/v1/charts/totals'), body).then(
      (response: AxiosResponse) => {
        setTotalsData(response.data);

        const currencies: Currency[] = [];

        Object.entries(response.data.currencies).map(([id, name]) => {
          currencies.push({ value: id, label: name as unknown as string });
        });

        setCurrencies(currencies);
        setIsLoadingTotals(false);
      }
    );
  };

  const getChartData = () => {
    request('POST', endpoint('/api/v1/charts/chart_summary'), body).then(
      (response: AxiosResponse) => setChartData(response.data)
    );
  };

  useEffect(() => {
    getTotals();
    getChartData();
  }, [body]);

  return (
    <>
      {isLoadingTotals && (
        <div className="w-full flex justify-center">
          <Spinner />
        </div>
      )}

      {/* Quick date, currency & date picker. */}
      <div className="flex justify-end space-x-2">
        {currencies && (
          <SelectField
            className="w-24"
            defaultValue={currencies[0]}
            onValueChange={(value) => setCurrency(parseInt(value))}
          >
            {currencies.map((currency, index) => (
              <option key={index} value={currency.value}>
                {currency.label}
              </option>
            ))}
          </SelectField>
        )}

        <Button
          key="day-btn"
          className="mx-0.5"
          type="secondary"
          onClick={() => setChartScale('day')}
        >
          {t('day')}
        </Button>

        <Button
          key="week-btn"
          className="mx-0.5"
          type="secondary"
          onClick={() => setChartScale('week')}
        >
          {t('week')}
        </Button>

        <Button
          key="month-btn"
          className="mx-0.5"
          type="secondary"
          onClick={() => setChartScale('month')}
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

      {totalsData[currency] && company && (
        <div className="grid grid-cols-12 gap-4 mt-4">
          <InfoCard
            style={{ borderColor: TotalColors.Green }}
            className="col-span-12 lg:col-span-4 border-t-4"
            title={`${t('total')} ${t('revenue')}`}
            value={formatMoney(
              totalsData[currency].revenue.paid_to_date || 0,
              company.settings.country_id,
              currency.toString()
            )}
          />

          <InfoCard
            style={{ borderColor: TotalColors.Red }}
            className="col-span-12 lg:col-span-4 border-t-4"
            title={`${t('total')} ${t('expenses')}`}
            value={formatMoney(
              totalsData[currency].expenses.amount || 0,
              company.settings.country_id,
              currency.toString()
            )}
          />

          <InfoCard
            style={{ borderColor: TotalColors.Blue }}
            className="col-span-12 lg:col-span-4 border-t-4"
            title={`${t('total')} ${t('outstanding')}`}
            value={formatMoney(
              totalsData[currency].outstanding.amount || 0,
              company.settings.country_id,
              currency.toString()
            )}
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
