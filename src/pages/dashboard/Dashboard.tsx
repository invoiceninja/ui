/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import { BiMove } from 'react-icons/bi';
import collect from 'collect.js';

import { Button, SelectField } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { DropdownDateRangePicker } from '$app/components/DropdownDateRangePicker';
import { Spinner } from '$app/components/Spinner';
import { CurrencySelector } from '$app/components/CurrencySelector';

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useEnabled } from '$app/common/guards/guards/enabled';
import {
  ChartsDefaultView,
  useReactSettings,
} from '$app/common/hooks/useReactSettings';
import { usePreferences } from '$app/common/hooks/usePreferences';
import { DashboardField } from '$app/common/interfaces/company-user';
import { ModuleBitmask } from '$app/pages/settings';

import { DashboardCardSelector } from './components/DashboardCardSelector';
import { PreferenceCardsGrid } from './components/PreferenceCardsGrid';
import { Chart } from './components/Chart';
import { Activity } from './components/Activity';
import { RecentPayments } from './components/RecentPayments';
import { UpcomingInvoices } from './components/UpcomingInvoices';
import { PastDueInvoices } from './components/PastDueInvoices';
import { ExpiredQuotes } from './components/ExpiredQuotes';
import { UpcomingQuotes } from './components/UpcomingQuotes';
import { UpcomingRecurringInvoices } from './components/UpcomingRecurringInvoices';

export const DEFAULT_LAYOUTS = {};

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

interface Currency {
  value: string;
  label: string;
}

interface TotalsRecord {
  revenue: { paid_to_date: string; code: string };
  expenses: { amount: string; code: string };
  invoices: { invoiced_amount: string; code: string; date: string };
  outstanding: { outstanding_count: number; amount: string; code: string };
}

export function ResizableDashboardCards() {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const { Preferences, update } = usePreferences();

  const enabled = useEnabled();
  const user = useCurrentUser();
  const company = useCurrentCompany();
  const settings = useReactSettings();

  // ── Edit mode — only affects preference cards reordering ─────────────────
  const [isEditMode, setIsEditMode] = useState(false);

  // ── Dashboard fields (the small configurable metric cards) ────────────────
  const currentDashboardFields: DashboardField[] =
    user?.company_user?.react_settings?.dashboard_fields ?? [];

  // ── Chart & date preferences ──────────────────────────────────────────────
  const chartScale: ChartsDefaultView =
    settings?.preferences?.dashboard_charts?.default_view ?? 'month';
  const currency: number =
    settings?.preferences?.dashboard_charts?.currency ?? 1;
  const dateRange: string =
    settings?.preferences?.dashboard_charts?.range ?? 'this_month';

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [dates, setDates] = useState({
    start_date: dayjs().startOf('month').format('YYYY-MM-DD'),
    end_date: dayjs().format('YYYY-MM-DD'),
  });
  const [body, setBody] = useState({
    start_date: '',
    end_date: '',
    date_range: dateRange,
  });

  useEffect(() => {
    setBody((prev) => ({ ...prev, date_range: dateRange }));
  }, [settings?.preferences?.dashboard_charts?.range]);

  const handleDateChange = (DateSet: string) => {
    const [startDate, endDate] = DateSet.split(',');
    const normalized =
      new Date(startDate) > new Date(endDate)
        ? { start_date: endDate, end_date: startDate }
        : { start_date: startDate, end_date: endDate };
    setBody({ ...normalized, date_range: 'custom' });
  };

  const totals = useQuery({
    queryKey: ['/api/v1/charts/totals_v2', body],
    queryFn: () =>
      request('POST', endpoint('/api/v1/charts/totals_v2'), body).then(
        (r) => r.data
      ),
    staleTime: Infinity,
  });

  const chart = useQuery({
    queryKey: ['/api/v1/charts/chart_summary_v2', body],
    queryFn: () =>
      request('POST', endpoint('/api/v1/charts/chart_summary_v2'), body).then(
        (r) => r.data
      ),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!totals.data) return;

    const parsed: Currency[] = [];
    Object.entries(totals.data.currencies ?? {}).forEach(([id, name]) => {
      parsed.push({ value: id, label: name as string });
    });

    const ids = collect(parsed)
      .pluck('value')
      .map((v) => parseInt(v as string))
      .toArray() as number[];

    if (!ids.includes(currency)) {
      update('preferences.dashboard_charts.currency', ids[0]);
    }

    setCurrencies(parsed);
  }, [totals.data]);

  useEffect(() => {
    if (!chart.data) return;
    setDates({
      start_date: chart.data.start_date,
      end_date: chart.data.end_date,
    });
    setChartData(chart.data);
  }, [chart.data]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [layoutBreakpoint, setLayoutBreakpoint] = useState('lg');

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w >= 1536) setLayoutBreakpoint('xxl');
      else if (w >= 1280) setLayoutBreakpoint('xl');
      else if (w >= 1024) setLayoutBreakpoint('lg');
      else if (w >= 768) setLayoutBreakpoint('md');
      else if (w >= 640) setLayoutBreakpoint('sm');
      else setLayoutBreakpoint('xs');
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {currencies.length > 0 && (
          <SelectField
            value={currency.toString()}
            onValueChange={(value) =>
              update('preferences.dashboard_charts.currency', parseInt(value))
            }
          >
            <option value="999">{t('all')}</option>
            {currencies.map((c, i) => (
              <option key={i} value={c.value}>
                {c.label}
              </option>
            ))}
          </SelectField>
        )}

        <div className="flex gap-1">
          {(['day', 'week', 'month'] as const).map((scale) => (
            <Button
              key={scale}
              type={chartScale === scale ? 'primary' : 'secondary'}
              onClick={() =>
                update('preferences.dashboard_charts.default_view', scale)
              }
            >
              {t(scale)}
            </Button>
          ))}
        </div>

        <DropdownDateRangePicker
          handleDateChange={handleDateChange}
          startDate={dates.start_date}
          endDate={dates.end_date}
          handleDateRangeChange={(value) =>
            update('preferences.dashboard_charts.range', value)
          }
          value={body.date_range}
        />

        <DashboardCardSelector />

        <Preferences>
          <CurrencySelector
            label={t('currency')}
            value={currency.toString()}
            onChange={(v) =>
              update('preferences.dashboard_charts.currency', parseInt(v))
            }
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
            {(['day', 'week', 'month'] as const).map((s) => (
              <option key={s} value={s}>
                {t(s)}
              </option>
            ))}
          </SelectField>
          <SelectField
            label={t('date_range')}
            value={dateRange}
            onValueChange={(value) =>
              update('preferences.dashboard_charts.range', value)
            }
          >
            {[
              ['last7_days', 'last_7_days'],
              ['last30_days', 'last_30_days'],
              ['this_month', 'this_month'],
              ['last_month', 'last_month'],
              ['this_quarter', 'current_quarter'],
              ['last_quarter', 'last_quarter'],
              ['this_year', 'this_year'],
              ['last_year', 'last_year'],
              ['last365_days', 'last365_days'],
            ].map(([value, label]) => (
              <option key={value} value={value}>
                {t(label)}
              </option>
            ))}
          </SelectField>
        </Preferences>

        <div
          className="flex cursor-pointer items-center"
          onClick={() => setIsEditMode((prev) => !prev)}
          title={isEditMode ? t('done') : t('reorder_cards')}
        >
          <Icon element={BiMove} size={23} />
        </div>
      </div>

      {totals.isLoading && (
        <div className="flex w-full justify-center py-8">
          <Spinner />
        </div>
      )}

      {!totals.isLoading && (
        <>
          {currentDashboardFields.length > 0 && (
            <PreferenceCardsGrid
              currentDashboardFields={currentDashboardFields}
              dateRange={dateRange}
              startDate={dates.start_date}
              endDate={dates.end_date}
              currencyId={currency.toString()}
              layoutBreakpoint={layoutBreakpoint}
              isEditMode={isEditMode}
            />
          )}

          <div className="grid grid-cols-12 gap-6">
            {chartData && (
              <div className="col-span-12">
                <div className="rounded-lg border bg-card p-4">
                  <Chart
                    chartSensitivity={chartScale}
                    dates={{
                      start_date: dates.start_date,
                      end_date: dates.end_date,
                    }}
                    data={chartData[currency]}
                    currency={currency.toString()}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 xl:col-span-6">
              <Activity isEditMode={false} />
            </div>

            <div className="col-span-12 xl:col-span-6">
              <RecentPayments isEditMode={false} />
            </div>

            {enabled(ModuleBitmask.Invoices) && (
              <div className="col-span-12 xl:col-span-6">
                <UpcomingInvoices isEditMode={false} />
              </div>
            )}

            {enabled(ModuleBitmask.Invoices) && (
              <div className="col-span-12 xl:col-span-6">
                <PastDueInvoices isEditMode={false} />
              </div>
            )}

            {enabled(ModuleBitmask.Quotes) && (
              <div className="col-span-12 xl:col-span-6">
                <ExpiredQuotes isEditMode={false} />
              </div>
            )}

            {enabled(ModuleBitmask.Quotes) && (
              <div className="col-span-12 xl:col-span-6">
                <UpcomingQuotes isEditMode={false} />
              </div>
            )}

            {enabled(ModuleBitmask.RecurringInvoices) && (
              <div className="col-span-12 xl:col-span-6">
                <UpcomingRecurringInvoices isEditMode={false} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
