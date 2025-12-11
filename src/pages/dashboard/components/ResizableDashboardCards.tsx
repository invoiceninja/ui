/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import '$app/resources/css/gridLayout.css';
import { Button, SelectField } from '$app/components/forms';
import { endpoint } from '$app/common/helpers';
import { Chart } from '$app/pages/dashboard/components/Chart';
import { useEffect, useRef, useState } from 'react';
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
import collect from 'collect.js';
import { useColorScheme } from '$app/common/colors';
import { CurrencySelector } from '$app/components/CurrencySelector';
import { useQuery } from 'react-query';
import { DashboardCardSelector } from './DashboardCardSelector';
import GridLayout from 'react-grid-layout';
import { PreferenceCardsGrid } from './PreferenceCardsGrid';
import { Icon } from '$app/components/icons/Icon';
import { BiMove } from 'react-icons/bi';
import classNames from 'classnames';
import { ModuleBitmask } from '$app/pages/settings';
import { UpcomingQuotes } from './UpcomingQuotes';
import { UpcomingRecurringInvoices } from './UpcomingRecurringInvoices';
import { ExpiredQuotes } from './ExpiredQuotes';
import { PastDueInvoices } from './PastDueInvoices';
import { UpcomingInvoices } from './UpcomingInvoices';
import { Activity } from './Activity';
import { RecentPayments } from './RecentPayments';
import { useEnabled } from '$app/common/guards/guards/enabled';

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

interface GridItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  content: string;
}

// Export default layouts for RestoreLayoutAction
export const DEFAULT_LAYOUTS = {};

export enum TotalColors {
  Green = '#54B434',
  Blue = '#2596BE',
  Red = '#BE4D25',
  Gray = '#242930',
}

export function ResizableDashboardCards() {
  const [t] = useTranslation();

  const { Preferences, update } = usePreferences();

  const enabled = useEnabled();
  const formatMoney = useFormatMoney();

  const containerRef = useRef<HTMLDivElement>(null);

  const user = useCurrentUser();
  const colors = useColorScheme();
  const company = useCurrentCompany();
  const settings = useReactSettings();

  const currentDashboardFields = user?.company_user?.react_settings?.dashboard_fields || [];
  const [width, setWidth] = useState<number>(1000);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [totalsData, setTotalsData] = useState<TotalsRecord[]>([]);

  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const chartScale =
    settings?.preferences?.dashboard_charts?.default_view || 'month';
  const currency = settings?.preferences?.dashboard_charts?.currency || 1;
  const dateRange =
    settings?.preferences?.dashboard_charts?.range || 'this_month';

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
    start_date: '',
    end_date: '',
    date_range: dateRange,
  });

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
    setBody((current) => ({
      ...current,
      date_range: dateRange,
    }));
  }, [settings?.preferences?.dashboard_charts?.range]);

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

      if (!$currencies.includes(currency)) {
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
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        setWidth(entries[0].contentRect.width);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <div
      className={classNames({ 'select-none': isEditMode })}
      ref={containerRef}
      style={{ width: '100%' }}
    >
      {!totals.isLoading ? (
        <GridLayout
          cols={24}
          width={width}
          draggableHandle=".drag-handle"
          margin={[0, 20]}
          isDraggable={isEditMode}
          isDroppable={isEditMode}
          compactType="vertical"
          preventCollision={false}
          useCSSTransforms={true}
        >
          {totals.isLoading && (
            <div className="w-full flex justify-center">
              <Spinner />
            </div>
          )}

          {/* Quick date, currency & date picker. */}
          <div
            key="1"
            className="flex justify-end"
            data-grid={{
              x: 16,
              y: 0,
              w: 24,
              h: 0.25,
              isResizable: false,
              static: true,
            }}
          >
            <div className="flex space-x-2">
              {currencies && (
                <SelectField
                  value={currency.toString()}
                  onValueChange={(value) =>
                    update(
                      'preferences.dashboard_charts.currency',
                      parseInt(value)
                    )
                  }
                >
                  <option value="999">{t('all')}</option>

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
                  onClick={() =>
                    update('preferences.dashboard_charts.default_view', 'day')
                  }
                >
                  {t('day')}
                </Button>

                <Button
                  key="week-btn"
                  type={chartScale === 'week' ? 'primary' : 'secondary'}
                  onClick={() =>
                    update('preferences.dashboard_charts.default_view', 'week')
                  }
                >
                  {t('week')}
                </Button>

                <Button
                  key="month-btn"
                  type={chartScale === 'month' ? 'primary' : 'secondary'}
                  onClick={() =>
                    update('preferences.dashboard_charts.default_view', 'month')
                  }
                >
                  {t('month')}
                </Button>
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
                  <option value={'last365_days'}>{`${t(
                    'last365_days'
                  )}`}</option>
                </SelectField>
              </Preferences>

              <div
                className="flex items-center cursor-pointer"
                onClick={() => setIsEditMode((current) => !current)}
              >
                <Icon element={BiMove} size={23} />
              </div>
            </div>
          </div>

          {/* <DashboardCards
        dateRange={dateRange}
        startDate={dates.start_date}
        endDate={dates.end_date}
        currencyId={currency.toString()}
      /> */}

          {company && (
            <div
              key="2"
              className={classNames('drag-handle mt-4', {
                'cursor-grab': isEditMode,
              })}
              data-grid={{
                x: 0,
                y: 2,
                w: 9.5,
                h: 3.2,
                isResizable: isEditMode,
                resizeHandles: ['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne'],
                isDraggable: isEditMode,
              }}
            >
              <Card
                title={t('account_login_text')}
                className="col-span-12 xl:col-span-4"
                height="full"
              >
                <div className="pb-8">
                  <div className="flex flex-col space-y-2 px-6">
                    <span className="text-2xl">{`${user?.first_name} ${user?.last_name}`}</span>

                    <span className="text-sm">{t('recent_transactions')}</span>
                  </div>

                  <div className="flex flex-col mt-8">
                    <div
                      style={{ borderColor: colors.$4 }}
                      className="flex justify-between items-center border-b py-3 px-6"
                    >
                      <span>{t('invoices')}</span>

                      <Badge style={{ backgroundColor: TotalColors.Blue }}>
                        <span className="mx-2 text-base">
                          {formatMoney(
                            totalsData[currency]?.invoices?.invoiced_amount ||
                              0,
                            company.settings.country_id,
                            currency.toString(),
                            2
                          )}
                        </span>
                      </Badge>
                    </div>

                    <div
                      style={{ borderColor: colors.$4 }}
                      className="flex justify-between items-center border-b py-3 px-6"
                    >
                      <span>{t('payments')}</span>
                      <Badge style={{ backgroundColor: TotalColors.Green }}>
                        <span className="mx-2 text-base">
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
                      style={{ borderColor: colors.$4 }}
                      className="flex justify-between items-center border-b py-3 px-6"
                    >
                      <span>{t('expenses')}</span>
                      <Badge style={{ backgroundColor: TotalColors.Gray }}>
                        <span className="mx-2 text-base">
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
                      style={{ borderColor: colors.$4 }}
                      className="flex justify-between items-center border-b py-3 px-6"
                    >
                      <span>{t('outstanding')}</span>
                      <Badge style={{ backgroundColor: TotalColors.Red }}>
                        <span className="mx-2 text-base">
                          {formatMoney(
                            totalsData[currency]?.outstanding?.amount || 0,
                            company.settings.country_id,
                            currency.toString(),
                            2
                          )}
                        </span>
                      </Badge>
                    </div>

                    <div
                      style={{ borderColor: colors.$4 }}
                      className="flex justify-between items-center border-b py-3 px-6"
                    >
                      <span>{t('total_invoices_outstanding')}</span>

                      <Badge variant="white">
                        <span className="mx-2 text-base">
                          {totalsData[currency]?.outstanding
                            ?.outstanding_count || 0}
                        </span>
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {chartData && (
            <div
              key="3"
              className={classNames('drag-handle mt-4', {
                'cursor-grab': isEditMode,
              })}
              data-grid={{
                x: 11,
                y: 2,
                w: 14.2,
                h: 3.2,
                resizeHandles: ['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne'],
                isResizable: isEditMode,
                isDraggable: isEditMode,
              }}
            >
              <Card
                title={t('overview')}
                className="col-span-12 xl:col-span-8 pr-4"
                height="full"
              >
                <Chart
                  chartSensitivity={chartScale}
                  dates={{
                    start_date: dates.start_date,
                    end_date: dates.end_date,
                  }}
                  data={chartData[currency]}
                  currency={currency.toString()}
                />
              </Card>
            </div>
          )}

          <div
            key="4"
            className={classNames('drag-handle mt-4', {
              'cursor-grab': isEditMode,
            })}
            data-grid={{
              x: 0,
              y: 3,
              w: 11.85,
              h: 2.2,
              resizeHandles: ['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne'],
              isResizable: isEditMode,
              isDraggable: isEditMode,
            }}
          >
            <Activity isEditMode={isEditMode} />
          </div>

          <div
            key="5"
            className={classNames('drag-handle mt-4', {
              'cursor-grab': isEditMode,
            })}
            data-grid={{
              x: 13,
              y: 3,
              w: 11.85,
              h: 2.2,
              resizeHandles: ['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne'],
              isResizable: isEditMode,
              isDraggable: isEditMode,
            }}
          >
            <RecentPayments isEditMode={isEditMode} />
          </div>

          {enabled(ModuleBitmask.Invoices) && (
            <div
              key="6"
              className={classNames('drag-handle mt-4', {
                'cursor-grab': isEditMode,
              })}
              data-grid={{
                x: 0,
                y: 4,
                w: 11.85,
                h: 2.2,
                resizeHandles: ['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne'],
                isResizable: isEditMode,
                isDraggable: isEditMode,
              }}
            >
              <UpcomingInvoices isEditMode={isEditMode} />
            </div>
          )}

          {enabled(ModuleBitmask.Invoices) && (
            <div
              key="7"
              className={classNames('drag-handle mt-4', {
                'cursor-grab': isEditMode,
              })}
              data-grid={{
                x: 13,
                y: 4,
                w: 11.85,
                h: 2.2,
                resizeHandles: ['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne'],
                isResizable: isEditMode,
                isDraggable: isEditMode,
              }}
            >
              <PastDueInvoices isEditMode={isEditMode} />
            </div>
          )}

          {enabled(ModuleBitmask.Quotes) && (
            <div
              key="8"
              className={classNames('drag-handle mt-4', {
                'cursor-grab': isEditMode,
              })}
              data-grid={{
                x: 0,
                y: 5,
                w: 11.85,
                h: 2.2,
                resizeHandles: ['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne'],
                isResizable: isEditMode,
                isDraggable: isEditMode,
              }}
            >
              <ExpiredQuotes isEditMode={isEditMode} />
            </div>
          )}

          {enabled(ModuleBitmask.Quotes) && (
            <div
              key="9"
              className={classNames('drag-handle mt-4', {
                'cursor-grab': isEditMode,
              })}
              data-grid={{
                x: 13,
                y: 5,
                w: 11.85,
                h: 2.2,
                resizeHandles: ['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne'],
                isResizable: isEditMode,
                isDraggable: isEditMode,
              }}
            >
              <UpcomingQuotes isEditMode={isEditMode} />
            </div>
          )}

          {enabled(ModuleBitmask.RecurringInvoices) && (
            <div
              key="10"
              className={classNames('drag-handle mt-4', {
                'cursor-grab': isEditMode,
              })}
              data-grid={{
                x: 0,
                y: 6,
                w: 11.85,
                h: 2.2,
                resizeHandles: ['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne'],
                isResizable: isEditMode,
                isDraggable: isEditMode,
              }}
            >
              <UpcomingRecurringInvoices isEditMode={isEditMode} />
            </div>
          )}

          {/* Preference Cards Row */}
          {currentDashboardFields && currentDashboardFields.length > 0 && (
            <div
              key="preference_cards"
              className="w-full"
              data-grid={{
                x: 0,
                y: 1,
                w: 24,
                h: 2,  // Increased height to accommodate rectangular cards
                isResizable: isEditMode,
                resizeHandles: isEditMode ? ['s'] : [],
                isDraggable: false,
                static: !isEditMode,
              }}
            >
              <PreferenceCardsGrid
                currentDashboardFields={currentDashboardFields}
                dateRange={dateRange}
                startDate={dates.start_date}
                endDate={dates.end_date}
                currencyId={currency.toString()}
                layoutBreakpoint="lg"
                isEditMode={isEditMode}
              />
            </div>
          )}
        </GridLayout>
      ) : (
        <div className="w-full flex justify-center">
          <Spinner />
        </div>
      )}
    </div>
  );
}
