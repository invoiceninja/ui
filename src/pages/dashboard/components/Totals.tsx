/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { SelectField } from '$app/components/forms';
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
import { Badge } from '$app/components/Badge';
import {
  ChartsDefaultView,
  useReactSettings,
} from '$app/common/hooks/useReactSettings';
import { usePreferences } from '$app/common/hooks/usePreferences';
import collect from 'collect.js';
import { useColorScheme } from '$app/common/colors';
import { CurrencySelector } from '$app/components/CurrencySelector';
import { useQuery } from 'react-query';
import dayjs from 'dayjs';
import styled from 'styled-components';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';

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
  Gray = '#242930',
}

const ChartScaleBox = styled.div`
  background-color: ${(props) => props.theme.backgroundColor};
  &:hover {
    background-color: ${(props) => props.theme.hoverBgColor};
  }
`;

const GLOBAL_DATE_RANGES: Record<string, { start: string; end: string }> = {
  last7_days: {
    start: dayjs().subtract(7, 'days').format('YYYY-MM-DD'),
    end: dayjs().format('YYYY-MM-DD'),
  },
  last30_days: {
    start: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
    end: dayjs().format('YYYY-MM-DD'),
  },
  last365_days: {
    start: dayjs().subtract(365, 'days').format('YYYY-MM-DD'),
    end: dayjs().format('YYYY-MM-DD'),
  },
  this_month: {
    start: dayjs().startOf('month').format('YYYY-MM-DD'),
    end: dayjs().endOf('month').format('YYYY-MM-DD'),
  },
  last_month: {
    start: dayjs().startOf('month').subtract(1, 'month').format('YYYY-MM-DD'),
    end: dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
  },
  this_quarter: {
    start: dayjs().startOf('quarter').format('YYYY-MM-DD'),
    end: dayjs().endOf('quarter').format('YYYY-MM-DD'),
  },
  last_quarter: {
    start: dayjs()
      .subtract(1, 'quarter')
      .startOf('quarter')
      .format('YYYY-MM-DD'),
    end: dayjs().subtract(1, 'quarter').endOf('quarter').format('YYYY-MM-DD'),
  },
  this_year: {
    start: dayjs().startOf('year').format('YYYY-MM-DD'),
    end: dayjs().format('YYYY-MM-DD'),
  },
  last_year: {
    start: dayjs().subtract(1, 'year').startOf('year').format('YYYY-MM-DD'),
    end: dayjs().subtract(1, 'year').endOf('year').format('YYYY-MM-DD'),
  },
};

export function Totals() {
  const [t] = useTranslation();

  const settings = useReactSettings();

  const { Preferences, update } = usePreferences();

  const formatMoney = useFormatMoney();

  const colors = useColorScheme();
  const company = useCurrentCompany();
  const currentUser = useCurrentUser();

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [totalsData, setTotalsData] = useState<TotalsRecord[]>([]);

  const chartScale =
    settings?.preferences?.dashboard_charts?.default_view || 'month';
  const currency = settings?.preferences?.dashboard_charts?.currency || 1;
  const dateRange =
    settings?.preferences?.dashboard_charts?.range || 'this_month';

  const [dates, setDates] = useState<{ start_date: string; end_date: string }>({
    start_date: GLOBAL_DATE_RANGES[dateRange]?.start || '',
    end_date: GLOBAL_DATE_RANGES[dateRange]?.end || '',
  });

  const [body, setBody] = useState<{
    start_date: string;
    end_date: string;
    date_range: string;
  }>({
    start_date: GLOBAL_DATE_RANGES[dateRange]?.start || '',
    end_date: GLOBAL_DATE_RANGES[dateRange]?.end || '',
    date_range: dateRange,
  });

  useEffect(() => {
    setBody((current) => ({
      ...current,
      date_range: dateRange,
    }));
  }, [settings?.preferences?.dashboard_charts?.range]);

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

  const totals = useQuery({
    queryKey: ['/api/v1/charts/totals_v2', body],
    queryFn: () =>
      request('POST', endpoint('/api/v1/charts/totals_v2'), body).then(
        (response) => response.data
      ),
    staleTime: Infinity,
  });

  const chart = useQuery({
    queryKey: ['/api/v1/charts/chart_summary_v2', body],
    queryFn: () =>
      request('POST', endpoint('/api/v1/charts/chart_summary_v2'), body).then(
        (response) => response.data
      ),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (totals.data) {
      setTotalsData(totals.data);

      const currencies: Currency[] = [];

      Object.entries(totals.data.currencies).map(([id, name]) => {
        currencies.push({ value: id, label: name as unknown as string });
      });

      const $currencies = collect(currencies)
        .pluck('value')
        .map((value) => parseInt(value as string))
        .toArray() as number[];

      if (!$currencies.includes(currency) && currency !== 999) {
        update('preferences.dashboard_charts.currency', $currencies[0]);
      }

      setCurrencies(currencies);
    }
  }, [totals.data]);

  useEffect(() => {
    if (chart.data) {
      setDates({
        start_date: chart.data.start_date,
        end_date: chart.data.end_date,
      });

      setChartData(chart.data);
    }
  }, [chart.data]);

  useEffect(() => {
    return () => {
      if (settings?.preferences?.dashboard_charts?.range === 'custom') {
        const currentRange =
          currentUser?.company_user?.react_settings?.preferences
            ?.dashboard_charts?.range;

        update(
          'preferences.dashboard_charts.range',
          currentRange || 'this_month'
        );
      }
    };
  }, []);

  return (
    <>
      {totals.isLoading && (
        <div className="w-full flex justify-center">
          <Spinner />
        </div>
      )}

      {/* Quick date, currency & date picker. */}
      <div className="flex items-center justify-end lg:justify-between">
        <span className="hidden lg:inline-block text-sm text-gray-500">
          {t('account_login_text')}
        </span>

        <div className="flex">
          <div className="flex space-x-2">
            {currencies && (
              <SelectField
                className="rounded-md shadow-sm"
                value={currency.toString()}
                onValueChange={(value) =>
                  update(
                    'preferences.dashboard_charts.currency',
                    parseInt(value)
                  )
                }
                customSelector
                withoutSeparator
                dismissable={false}
              >
                <option value="999">{t('all')}</option>

                {currencies.map((currency, index) => (
                  <option key={index} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </SelectField>
            )}

            <div
              className="flex rounded-lg overflow-hidden border shadow-sm"
              style={{ borderColor: colors.$5 }}
            >
              <ChartScaleBox
                className="flex items-center px-4 cursor-pointer text-sm"
                onClick={() =>
                  update('preferences.dashboard_charts.default_view', 'day')
                }
                theme={{
                  backgroundColor: chartScale === 'day' ? colors.$3 : colors.$1,
                  hoverBgColor: chartScale === 'day' ? colors.$3 : colors.$4,
                }}
                style={{
                  color: chartScale === 'day' ? colors.$1 : colors.$3,
                }}
              >
                {t('day')}
              </ChartScaleBox>

              <ChartScaleBox
                className="flex items-center px-4 cursor-pointer border-l text-sm"
                onClick={() =>
                  update('preferences.dashboard_charts.default_view', 'week')
                }
                theme={{
                  backgroundColor:
                    chartScale === 'week' ? colors.$3 : colors.$1,
                  hoverBgColor: chartScale === 'week' ? colors.$3 : colors.$4,
                }}
                style={{
                  borderColor: colors.$4,
                  color: chartScale === 'week' ? colors.$1 : colors.$3,
                }}
              >
                {t('week')}
              </ChartScaleBox>

              <ChartScaleBox
                className="flex items-center px-4 cursor-pointer border-l text-sm"
                onClick={() =>
                  update('preferences.dashboard_charts.default_view', 'month')
                }
                theme={{
                  backgroundColor:
                    chartScale === 'month' ? colors.$3 : colors.$1,
                  hoverBgColor: chartScale === 'month' ? colors.$3 : colors.$4,
                }}
                style={{
                  borderColor: colors.$4,
                  color: chartScale === 'month' ? colors.$1 : colors.$3,
                }}
              >
                {t('month')}
              </ChartScaleBox>
            </div>

            <div className="flex flex-auto justify-center sm:col-start-3 ">
              <DropdownDateRangePicker
                handleDateChange={handleDateChange}
                startDate={dates.start_date}
                endDate={dates.end_date}
                handleDateRangeChange={(value) =>
                  update('preferences.dashboard_charts.range', value)
                }
                value={body.date_range}
              />
            </div>

            <Preferences>
              <CurrencySelector
                label={t('currency')}
                value={currency.toString()}
                onChange={(v) =>
                  update('preferences.dashboard_charts.currency', parseInt(v))
                }
                additionalCurrencies={[{ id: '999', label: t('all') }]}
              />

              <SelectField
                label={t('range')}
                value={chartScale}
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
                label={t('date_range')}
                value={dateRange}
                onValueChange={(value) =>
                  update('preferences.dashboard_charts.range', value)
                }
              >
                <option value="last7_days">{t('last_7_days')}</option>
                <option value="last30_days">{t('last_30_days')}</option>
                <option value="this_month">{t('this_month')}</option>
                <option value="last_month">{t('last_month')}</option>
                <option value="this_quarter">{t('current_quarter')}</option>
                <option value="last_quarter">{t('last_quarter')}</option>
                <option value="this_year">{t('this_year')}</option>
                <option value="last_year">{t('last_year')}</option>
                <option value={'last365_days'}>{`${t('last365_days')}`}</option>
              </SelectField>
            </Preferences>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-10 mt-4 gap-8">
        {company && (
          <Card
            title={t('recent_transactions')}
            className="col-span-10 xl:col-span-3 shadow-sm"
            headerClassName="px-3 sm:px-4 py-3 sm:py-4"
            withoutBodyPadding
            style={{ borderColor: colors.$5 }}
            headerStyle={{ borderColor: colors.$5 }}
            withoutHeaderPadding
          >
            <div className="flex flex-col px-4">
              <div
                className="flex justify-between items-center border-b border-dashed py-5"
                style={{ borderColor: colors.$5 }}
              >
                <span className="text-gray-500">{t('invoices')}</span>

                <Badge style={{ backgroundColor: '#2176FF26' }}>
                  <span
                    className="text-base font-mono"
                    style={{ color: '#2176FF' }}
                  >
                    {formatMoney(
                      totalsData[currency]?.invoices?.invoiced_amount || 0,
                      company.settings.country_id,
                      currency.toString(),
                      2
                    )}
                  </span>
                </Badge>
              </div>

              <div
                className="flex justify-between items-center border-b border-dashed py-5"
                style={{ borderColor: colors.$5 }}
              >
                <span className="text-gray-500">{t('payments')}</span>

                <Badge style={{ backgroundColor: '#22C55E26' }}>
                  <span
                    className="text-base font-mono"
                    style={{ color: '#22C55E' }}
                  >
                    {formatMoney(
                      totalsData[currency]?.revenue?.paid_to_date || 0,
                      company.settings.country_id,
                      currency.toString(),
                      2
                    )}
                  </span>
                </Badge>
              </div>

              <div
                className="flex justify-between items-center border-b border-dashed py-5"
                style={{ borderColor: colors.$5 }}
              >
                <span className="text-gray-500">{t('expenses')}</span>

                <Badge style={{ backgroundColor: '#A1A1AA26' }}>
                  <span
                    className="text-base font-mono"
                    style={{ color: '#A1A1AA' }}
                  >
                    {formatMoney(
                      totalsData[currency]?.expenses?.amount || 0,
                      company.settings.country_id,
                      currency.toString(),
                      2
                    )}
                  </span>
                </Badge>
              </div>

              <div
                className="flex justify-between items-center border-b border-dashed py-5"
                style={{ borderColor: colors.$5 }}
              >
                <span className="text-gray-500">{t('outstanding')}</span>

                <Badge style={{ backgroundColor: '#EF444426' }}>
                  <span
                    className="text-base font-mono"
                    style={{ color: '#EF4444' }}
                  >
                    {formatMoney(
                      totalsData[currency]?.outstanding?.amount || 0,
                      company.settings.country_id,
                      currency.toString(),
                      2
                    )}
                  </span>
                </Badge>
              </div>

              <div className="flex justify-between items-center py-5">
                <span className="text-gray-500">
                  {t('total_invoices_outstanding')}
                </span>

                <Badge
                  variant="transparent"
                  className="border"
                  style={{ borderColor: colors.$5 }}
                >
                  <span className="mx-2 text-base font-mono">
                    {totalsData[currency]?.outstanding?.outstanding_count || 0}
                  </span>
                </Badge>
              </div>
            </div>
          </Card>
        )}

        {chartData && (
          <Card
            title={t('overview')}
            className="col-span-10 xl:col-span-7 shadow-sm"
            headerClassName="px-3 sm:px-4 py-3 sm:py-4"
            childrenClassName="px-4"
            style={{ borderColor: colors.$5 }}
            headerStyle={{ borderColor: colors.$5 }}
            withoutHeaderPadding
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
