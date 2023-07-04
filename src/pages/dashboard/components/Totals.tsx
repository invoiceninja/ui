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
import { request } from '$app/common/helpers/request';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { Badge } from '$app/components/Badge';
import {
  ChartsDefaultView,
  useReactSettings,
} from '$app/common/hooks/useReactSettings';
import { usePreferences } from '$app/common/hooks/usePreferences';

interface TotalsRecord {
  revenue: { paid_to_date: string; code: string };
  expenses: { amount: string; code: string };
  invoices: { invoiced_amount: string; code: string; date: string };
  outstanding: { outstanding_count: number; amount: string; code: string };
}

interface Currency {
  value: string;
  label: string;
}

export interface ChartData {
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
  outstanding: {
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

  const settings = useReactSettings();
  const { Preferences, update } = usePreferences();

  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();

  const user = useCurrentUser();

  const [isLoadingTotals, setIsLoadingTotals] = useState(true);
  const [totalsData, setTotalsData] = useState<TotalsRecord[]>([]);

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [currency, setCurrency] = useState(
    settings.preferences.dashboard_charts.currency
  );

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [chartScale, setChartScale] = useState(
    settings.preferences.dashboard_charts.default_view
  );

  const [dates, setDates] = useState<{ start_date: string; end_date: string }>({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  const [body, setBody] = useState<{
    start_date: string;
    end_date: string;
    date_range: string;
  }>({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    date_range: 'this_month',
  });

  const handleDateRangeChange = (dateRange: string) => {
    setBody({ start_date: '', end_date: '', date_range: dateRange });
  };

  const handleDateChange = (DateSet: string) => {
    const [startDate, endDate] = DateSet.split(',');
    if (new Date(startDate) > new Date(endDate)) {
      setBody({
        start_date: endDate,
        end_date: startDate,
        date_range: 'custom',
      });
    } else {
      setBody({
        start_date: startDate,
        end_date: endDate,
        date_range: 'custom',
      });
    }
  };

  const getTotals = () => {
    request('POST', endpoint('/api/v1/charts/totals_v2'), body).then(
      (response: AxiosResponse) => {
        setTotalsData(response.data);
        const currencies: Currency[] = [];

        Object.entries(response.data.currencies).map(([id, name]) => {
          currencies.push({ value: id, label: name as unknown as string });
        });

        setCurrency(parseInt(currencies[0].value) ?? 1);
        setCurrencies(currencies);
        setIsLoadingTotals(false);
      }
    );
  };

  const getChartData = () => {
    request('POST', endpoint('/api/v1/charts/chart_summary_v2'), body).then(
      (response: AxiosResponse) => {
        setDates({
          start_date: response.data.start_date,
          end_date: response.data.end_date,
        });
        setChartData(response.data);
      }
    );
  };

  useEffect(() => {
    getTotals();
    getChartData();
  }, [body]);

  useEffect(() => {
    setChartScale(settings.preferences.dashboard_charts.default_view);
  }, [settings.preferences.dashboard_charts.default_view]);

  useEffect(() => {
    setCurrency(settings.preferences.dashboard_charts.currency);
  }, [currencies, settings.preferences.dashboard_charts.currency]);

  return (
    <>
      {JSON.stringify(settings.preferences.dashboard_charts.currency)}

      {isLoadingTotals && (
        <div className="w-full flex justify-center">
          <Spinner />
        </div>
      )}

      {/* Quick date, currency & date picker. */}
      <div className="flex justify-end">
        <div className="flex space-x-2">
          {currencies && (
            <SelectField
              value={currency.toString()}
              onValueChange={(value) => setCurrency(parseInt(value))}
              style={{ width: '5rem' }}
            >
              {currencies.map((currency, index) => (
                <option key={index} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </SelectField>
          )}

          <div className="flex space-x-2">
            <Button
              key="day-btn"
              type={chartScale === 'day' ? 'primary' : 'secondary'}
              onClick={() => setChartScale('day')}
            >
              {t('day')}
            </Button>

            <Button
              key="week-btn"
              type={chartScale === 'week' ? 'primary' : 'secondary'}
              onClick={() => setChartScale('week')}
            >
              {t('week')}
            </Button>

            <Button
              key="month-btn"
              type={chartScale === 'month' ? 'primary' : 'secondary'}
              onClick={() => setChartScale('month')}
            >
              {t('month')}
            </Button>
          </div>

          <div className="flex flex-auto justify-center sm:col-start-3 ">
            <DropdownDateRangePicker
              handleDateChange={handleDateChange}
              startDate={dates.start_date}
              endDate={dates.end_date}
              handleDateRangeChange={handleDateRangeChange}
            />
          </div>

          <Preferences>
            <SelectField
              label={t('dashboard_charts_default_view')}
              value={settings.preferences.dashboard_charts.default_view}
              onValueChange={(value) =>
                update(
                  'preferences.dashboard_charts.default_view',
                  value as ChartsDefaultView
                )
              }
            >
              <option value="day">{t('day')}</option>
              <option value="week">{t('week')}</option>
              <option value="month">{t('month')}</option>
            </SelectField>

            <SelectField
              label={t('currency')}
              value={settings.preferences.dashboard_charts.currency}
              onValueChange={(value) =>
                update('preferences.dashboard_charts.currency', parseInt(value))
              }
            >
              {currencies.map((currency) => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </SelectField>
          </Preferences>
        </div>
      </div>

      <div className="grid grid-cols-12 mt-4 gap-4">
        {company && (
          <Card
            title={t('account_login_text')}
            className="col-span-12 xl:col-span-4"
          >
            <div className="px-6 pb-8">
              <div className="flex flex-col space-y-2">
                <span className="text-2xl">{`${user?.first_name} ${user?.last_name}`}</span>

                <span className="text-sm text-gray-600">
                  {t('recent_transactions')}
                </span>
              </div>

              <div className="flex flex-col mt-8">
                <div className="flex justify-between items-center border-b border-gray-200 py-3">
                  <span className="text-gray-600">{t('invoices')}</span>

                  <Badge style={{ backgroundColor: TotalColors.Blue }}>
                    <span className="mx-2 text-base">
                      {formatMoney(
                        totalsData[currency]?.invoices.invoiced_amount || 0,
                        company.settings.country_id,
                        currency.toString() ?? company.settings.currency_id
                      )}
                    </span>
                  </Badge>
                </div>

                <div className="flex justify-between items-center border-b border-gray-200 py-3">
                  <span className="text-gray-600">{t('payments')}</span>
                  <Badge style={{ backgroundColor: TotalColors.Green }}>
                    <span className="mx-2 text-base">
                      {formatMoney(
                        totalsData[currency]?.revenue.paid_to_date || 0,
                        company.settings.country_id,
                        currency.toString() ?? company.settings.currency_id
                      )}
                    </span>
                  </Badge>
                </div>

                <div className="flex justify-between items-center border-b border-gray-200 py-3">
                  <span className="text-gray-600">{t('outstanding')}</span>
                  <Badge style={{ backgroundColor: TotalColors.Red }}>
                    <span className="mx-2 text-base">
                      {formatMoney(
                        totalsData[currency]?.outstanding.amount || 0,
                        company.settings.country_id,
                        currency.toString() ?? company.settings.currency_id
                      )}
                    </span>
                  </Badge>
                </div>

                <div className="flex justify-between items-center border-b border-gray-200 py-3">
                  <span className="text-gray-600">
                    {t('total_invoices_outstanding')}
                  </span>

                  <Badge variant="white">
                    <span className="mx-2 text-base">
                      {totalsData[currency]?.outstanding.outstanding_count || 0}
                    </span>
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        )}

        {chartData && (
          <Card
            title={t('overview')}
            className="col-span-12 xl:col-span-8 pr-4"
          >
            <Chart
              chartSensitivity={chartScale}
              dates={{ start_date: dates.start_date, end_date: dates.end_date }}
              data={chartData[currency]}
              currency={currency.toString()}
            />
          </Card>
        )}
      </div>
    </>
  );
}
