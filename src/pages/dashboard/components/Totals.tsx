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
import { useEffect, useMemo, useState } from 'react';
import { Spinner } from '$app/components/Spinner';
import {
  DropdownDateRangePicker,
  StyledRangePicker,
} from '../../../components/DropdownDateRangePicker';
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
import customParseFormat from 'dayjs/plugin/customParseFormat';
import styled from 'styled-components';
import Toggle from '$app/components/forms/Toggle';
import { DashboardCardSelector } from './DashboardCardSelector';
import { PreferenceCardsGrid } from './PreferenceCardsGrid';
import { ConfigProvider } from 'antd';
import { useAtomValue } from 'jotai';
import { antdLocaleAtom } from '$app/components/DropdownDateRangePicker';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';

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
  invoices: { total: string; date: string; currency: string }[];
  payments: { total: string; date: string; currency: string }[];
  outstanding: { total: string; date: string; currency: string }[];
  expenses: { total: string; date: string; currency: string }[];
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

  const formatMoney = useFormatMoney();
  const { Preferences, update, preferences } = usePreferences();

  const colors = useColorScheme();
  const company = useCurrentCompany();
  const settings = useReactSettings();
  const { dateFormat } = useCurrentCompanyDateFormats();
  const antdLocale = useAtomValue(antdLocaleAtom);

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [totalsData, setTotalsData] = useState<TotalsRecord[]>([]);

  const chartScale = preferences.dashboard_charts.default_view || 'month';
  const currency = preferences.dashboard_charts.currency || 1;
  const dateRange = preferences.dashboard_charts.range || 'this_month';
  const includeDrafts = preferences.dashboard_charts.include_drafts || false;
  const customStartDate = preferences.dashboard_charts.custom_start_date;
  const customEndDate = preferences.dashboard_charts.custom_end_date;
  const currentDashboardFields = settings?.dashboard_fields ?? [];

  const resolvedRange = useMemo(() => {
    if (dateRange === 'custom') {
      return {
        start: customStartDate || dayjs().startOf('month').format('YYYY-MM-DD'),
        end: customEndDate || dayjs().endOf('month').format('YYYY-MM-DD'),
      };
    }

    return {
      start:
        GLOBAL_DATE_RANGES[dateRange]?.start ||
        GLOBAL_DATE_RANGES.this_month.start,
      end:
        GLOBAL_DATE_RANGES[dateRange]?.end || GLOBAL_DATE_RANGES.this_month.end,
    };
  }, [dateRange, customStartDate, customEndDate]);

  const [dates, setDates] = useState<{ start_date: string; end_date: string }>({
    start_date: resolvedRange.start,
    end_date: resolvedRange.end,
  });

  const [body, setBody] = useState<{
    start_date: string;
    end_date: string;
    date_range: string;
  }>({
    start_date: resolvedRange.start,
    end_date: resolvedRange.end,
    date_range: dateRange,
  });

  useEffect(() => {
    if (dateRange === 'custom') {
      setBody({
        start_date: resolvedRange.start,
        end_date: resolvedRange.end,
        date_range: 'custom',
      });
    } else {
      setBody((current) => ({ ...current, date_range: dateRange }));
    }
  }, [dateRange, customStartDate, customEndDate]);

  const handleDateChange = (currentDataSet: string) => {
    const [startDate, endDate] = currentDataSet.split(',');

    const [normalizedStart, normalizedEnd] = dayjs(startDate).isAfter(endDate)
      ? [endDate, startDate]
      : [startDate, endDate];

    setBody({
      start_date: normalizedStart,
      end_date: normalizedEnd,
      date_range: 'custom',
    });

    update('preferences.dashboard_charts.custom_start_date', normalizedStart);
    update('preferences.dashboard_charts.custom_end_date', normalizedEnd);
  };

  const totals = useQuery({
    queryKey: ['/api/v1/charts/totals_v2', body, includeDrafts],
    queryFn: () =>
      request(
        'POST',
        endpoint('/api/v1/charts/totals_v2?include_drafts=:includeDrafts', {
          includeDrafts,
        }),
        body
      ).then((response) => response.data),
    staleTime: Infinity,
  });

  const chart = useQuery({
    queryKey: ['/api/v1/charts/chart_summary_v2', body, includeDrafts],
    queryFn: () =>
      request(
        'POST',
        endpoint(
          '/api/v1/charts/chart_summary_v2?include_drafts=:includeDrafts',
          { includeDrafts }
        ),
        body
      ).then((response) => response.data),
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

  const handlePreferencesCustomRangeChange = (value: [string, string]) => {
    dayjs.extend(customParseFormat);

    if (!value[0] || !value[1]) {
      return;
    }

    const unsupportedFormats = ['DD. MMM. YYYY', 'ddd MMM D, YYYY'];

    const parsed = value.map((date) =>
      dayjs(
        date,
        !unsupportedFormats.includes(dateFormat) ? dateFormat : undefined,
        antdLocale?.locale
      ).format('YYYY-MM-DD')
    );

    const [start, end] = dayjs(parsed[0]).isAfter(parsed[1])
      ? [parsed[1], parsed[0]]
      : [parsed[0], parsed[1]];

    update('preferences.dashboard_charts.custom_start_date', start);
    update('preferences.dashboard_charts.custom_end_date', end);
  };

  return (
    <>
      {totals.isLoading && (
        <div className="w-full flex justify-center">
          <Spinner />
        </div>
      )}

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
              style={{ borderColor: colors.$24 }}
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
                  borderColor: colors.$24,
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
                  borderColor: colors.$24,
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
                  borderColor: colors.$24,
                  color: chartScale === 'month' ? colors.$1 : colors.$3,
                }}
              >
                {t('month')}
              </ChartScaleBox>
            </div>

            <div className="flex flex-auto justify-center sm:col-start-3">
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

            <div
              className="flex items-center justify-center rounded-lg border shadow-sm px-2.5 py-1.5"
              style={{ borderColor: colors.$24, backgroundColor: colors.$1 }}
            >
              <DashboardCardSelector />
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
                <option value="custom">{t('custom_range')}</option>
              </SelectField>

              {dateRange === 'custom' && (
                <div
                  className="flex flex-col space-y-2"
                  style={
                    {
                      '--accent-color': colors.$3,
                      '--active-state-bg': colors.$4,
                      '--calendar-bg': colors.$2,
                      '--input-text-color': colors.$3,
                      '--picker-border-color': colors.$5,
                      '--picker-bg': colors.$1,
                    } as React.CSSProperties
                  }
                >
                  <span
                    className="text-sm"
                    style={{ color: colors.$3, fontWeight: 500 }}
                  >
                    {t('custom_range')}
                  </span>

                  <ConfigProvider locale={antdLocale?.default}>
                    <StyledRangePicker
                      size="large"
                      className="rounded-md"
                      style={{ width: '100%' }}
                      value={[
                        dayjs(resolvedRange.start),
                        dayjs(resolvedRange.end),
                      ]}
                      format={dateFormat}
                      onChange={(_, dateString) =>
                        handlePreferencesCustomRangeChange(dateString)
                      }
                      separator={<span style={{ color: colors.$4 }}>—</span>}
                      allowClear={false}
                    />
                  </ConfigProvider>
                </div>
              )}

              <Toggle
                label={t('include_drafts')}
                checked={includeDrafts}
                onValueChange={(value) =>
                  update('preferences.dashboard_charts.include_drafts', value)
                }
              />
            </Preferences>
          </div>
        </div>
      </div>

      {currentDashboardFields.length > 0 && (
        <div className="mt-6 w-full">
          <PreferenceCardsGrid
            key={currentDashboardFields.join(',')}
            currentDashboardFields={currentDashboardFields}
            dateRange={dateRange}
            startDate={dates.start_date}
            endDate={dates.end_date}
            currencyId={currency.toString()}
            layoutBreakpoint="lg"
          />
        </div>
      )}

      <div className="grid grid-cols-10 mt-4 gap-8">
        {company && (
          <Card
            title={t('recent_transactions')}
            className="col-span-10 xl:col-span-3 shadow-sm"
            headerClassName="px-3 sm:px-4 py-3 sm:py-4"
            withoutBodyPadding
            style={{ borderColor: colors.$24 }}
            headerStyle={{ borderColor: colors.$20 }}
            withoutHeaderPadding
          >
            <div className="flex flex-col px-4">
              <div
                className="flex justify-between items-center border-b border-dashed py-5"
                style={{ borderColor: colors.$21 }}
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
                style={{ borderColor: colors.$21 }}
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
                style={{ borderColor: colors.$21 }}
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
                style={{ borderColor: colors.$21 }}
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
                  style={{ borderColor: colors.$21 }}
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
            style={{ borderColor: colors.$24 }}
            headerStyle={{ borderColor: colors.$20 }}
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
