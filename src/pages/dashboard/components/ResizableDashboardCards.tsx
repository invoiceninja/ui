/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import '$app/resources/css/gridLayout.css';
import '$app/resources/css/gridStack.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useDebounce } from 'react-use';
import dayjs from 'dayjs';
import { cloneDeep, set } from 'lodash';
import { useDispatch } from 'react-redux';
import { BiMove } from 'react-icons/bi';
import { MdDragHandle } from 'react-icons/md';

import { Button, SelectField } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { DropdownDateRangePicker } from '$app/pages/dashboard/components/DropdownDateRangePicker';
import { Card } from '$app/components/cards';
import { Badge } from '$app/components/Badge';
import { Spinner } from '$app/components/Spinner';

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { diff } from 'deep-object-diff';

import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useColorScheme } from '$app/common/colors';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useEnabled } from '$app/common/guards/guards/enabled';
import { usePreferences } from '$app/common/hooks/usePreferences';
import {
  ChartsDefaultView,
  useReactSettings,
} from '$app/common/hooks/useReactSettings';
import { $refetch } from '$app/common/hooks/useRefetch';

import { CompanyUser, DashboardField } from '$app/common/interfaces/company-user';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { User } from '$app/common/interfaces/user';

import { ModuleBitmask } from '$app/pages/settings';

import { updateUser } from '$app/common/stores/slices/user';

import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useGenerateWeekDateRange } from '../hooks/useGenerateWeekDateRange';
import { ensureUniqueDates, generateMonthDateRange } from '../helpers/helpers';

import { CurrencySelector } from '$app/components/CurrencySelector';

import { DashboardCardSelector } from './DashboardCardSelector';
import { PreferenceCardsGridDnd } from './PreferenceCardsGridDnd';
import { RestoreCardsModal } from './RestoreCardsModal';
import { RestoreLayoutAction } from './RestoreLayoutAction';
import { Chart } from './Chart';
import { Activity } from './Activity';
import { UpcomingInvoices } from './UpcomingInvoices';
import { PastDueInvoices } from './PastDueInvoices';
import { UpcomingQuotes } from './UpcomingQuotes';
import { ExpiredQuotes } from './ExpiredQuotes';
import { RecentPayments } from './RecentPayments';
import { UpcomingRecurringInvoices } from './UpcomingRecurringInvoices';

interface Currency {
  value: string | number;
  label: string;
}
import {
  DashboardBreakpoint,
  DashboardGridItem,
  DashboardGridLayouts,
  DashboardGridMetrics,
} from './DashboardGrid.types';
import { DashboardGrid } from './DashboardGrid';
import { ChartData } from './DashboardGrid.types';

interface TotalsRecord {
  revenue: { paid_to_date: string; code: string };
  expenses: { amount: string; code: string };
  invoices: { invoiced_amount: string; code: string; date: string };
  outstanding: { outstanding_count: number; amount: string; code: string };
}

const BREAKPOINT_COLUMNS: Record<DashboardBreakpoint, number> = {
  xxl: 48,
  xl: 36,
  lg: 30,
  md: 24,
  sm: 18,
  xs: 12,
};

const BREAKPOINT_METRICS: Record<DashboardBreakpoint, DashboardGridMetrics> = {
  xxl: { cols: BREAKPOINT_COLUMNS.xxl, rowHeight: 18 },
  xl: { cols: BREAKPOINT_COLUMNS.xl, rowHeight: 18 },
  lg: { cols: BREAKPOINT_COLUMNS.lg, rowHeight: 18 },
  md: { cols: BREAKPOINT_COLUMNS.md, rowHeight: 18 },
  sm: { cols: BREAKPOINT_COLUMNS.sm, rowHeight: 20 },
  xs: { cols: BREAKPOINT_COLUMNS.xs, rowHeight: 22 },
};

const BREAKPOINT_WIDTHS: Record<DashboardBreakpoint, number> = {
  xxl: 1600,
  xl: 1400,
  lg: 1200,
  md: 1024,
  sm: 768,
  xs: 0,
};

const DEFAULT_LAYOUTS: DashboardGridLayouts = {
  xxl: [
    { i: 'toolbar', x: 0, y: 0, w: 48, h: 6, minH: 4, static: true },
    { i: 'preferences', x: 0, y: 6, w: 48, h: 12, minH: 10 },
    { i: 'totals', x: 0, y: 18, w: 16, h: 20, minH: 12 },
    { i: 'overview', x: 16, y: 18, w: 32, h: 20, minH: 12 },
    { i: 'upcoming_invoices', x: 0, y: 38, w: 24, h: 16, minH: 12 },
    { i: 'past_due_invoices', x: 24, y: 38, w: 24, h: 16, minH: 12 },
    { i: 'expired_quotes', x: 0, y: 54, w: 24, h: 16, minH: 12 },
    { i: 'upcoming_quotes', x: 24, y: 54, w: 24, h: 16, minH: 12 },
    { i: 'recent_payments', x: 0, y: 70, w: 24, h: 16, minH: 12 },
    { i: 'upcoming_recurring_invoices', x: 24, y: 70, w: 24, h: 16, minH: 12 },
    { i: 'activity', x: 0, y: 86, w: 48, h: 18, minH: 12 },
  ],
  xl: [],
  lg: [],
  md: [],
  sm: [],
  xs: [],
};

const GLOBAL_DATE_RANGES: Record<string, { start: string; end: string }> = {
  last7_days: {
    start: dayjs().subtract(7, 'days').format('YYYY-MM-DD'),
    end: dayjs().format('YYYY-MM-DD'),
  },
  last30_days: {
    start: dayjs().subtract(30, 'days').format('YYYY-MM-DD'),
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
    start: dayjs().subtract(1, 'quarter').startOf('quarter').format('YYYY-MM-DD'),
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

const cardOrder = [
  'preferences',
  'totals',
  'overview',
  'upcoming_invoices',
  'past_due_invoices',
  'expired_quotes',
  'upcoming_quotes',
  'recent_payments',
  'upcoming_recurring_invoices',
  'activity',
] as const;
export type DashboardCardKey = (typeof cardOrder)[number];

const preferenceOnlyCards: DashboardCardKey[] = ['preferences'];

function scaleLayout(
  layout: DashboardGridItem[],
  fromCols: number,
  toCols: number
): DashboardGridItem[] {
  if (fromCols === toCols) return layout.map((item) => ({ ...item }));
  const scale = toCols / fromCols;
  return layout.map((item) => ({
    ...item,
    x: Math.round(item.x * scale),
    w: Math.max(1, Math.round(item.w * scale)),
  }));
}

function determineBreakpoint(width: number): DashboardBreakpoint {
  if (width >= BREAKPOINT_WIDTHS.xxl) return 'xxl';
  if (width >= BREAKPOINT_WIDTHS.xl) return 'xl';
  if (width >= BREAKPOINT_WIDTHS.lg) return 'lg';
  if (width >= BREAKPOINT_WIDTHS.md) return 'md';
  if (width >= BREAKPOINT_WIDTHS.sm) return 'sm';
  return 'xs';
}

function ensureLayouts(initial: DashboardGridLayouts): DashboardGridLayouts {
  const result: DashboardGridLayouts = { ...initial };
  (['xl', 'lg', 'md', 'sm', 'xs'] as DashboardBreakpoint[]).forEach(
    (breakpoint) => {
      if (!result[breakpoint] || result[breakpoint].length === 0) {
        const cols = BREAKPOINT_COLUMNS[breakpoint];
        result[breakpoint] = scaleLayout(
          result.xxl,
          BREAKPOINT_COLUMNS.xxl,
          cols
        );
      }
    }
  );
  return result;
}

export function ResizableDashboardCards() {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const enabled = useEnabled();
  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();
  const colors = useColorScheme();
  const user = useCurrentUser();
  const settings = useReactSettings();
  const { Preferences, update } = usePreferences();

  const [isEditMode, setIsEditMode] = useState(false);
  const [layouts, setLayouts] = useState<DashboardGridLayouts>(() =>
    ensureLayouts(settings?.dashboard_cards_configuration || DEFAULT_LAYOUTS)
  );
  const [activeBreakpoint, setActiveBreakpoint] = useState<DashboardBreakpoint>('xxl');
  const [metrics, setMetrics] = useState<DashboardGridMetrics>(
    BREAKPOINT_METRICS.xxl
  );

  const containerRef = useRef<HTMLDivElement | null>(null);

  // current dashboard fields for preferences panel
  const [currentDashboardFields, setCurrentDashboardFields] =
    useState<DashboardField[]>(
      settings?.dashboard_fields || user?.company_user?.react_settings
        ?.dashboard_fields ||
        []
    );

  const chartSensitivity =
    settings?.preferences?.dashboard_charts?.default_view || 'month';
  const currency = settings?.preferences?.dashboard_charts?.currency || 1;
  const dateRange = settings?.preferences?.dashboard_charts?.range || 'this_month';

  const [dates, setDates] = useState<{ start_date: string; end_date: string }>(
    {
      start_date: GLOBAL_DATE_RANGES[dateRange]?.start || '',
      end_date: GLOBAL_DATE_RANGES[dateRange]?.end || '',
    }
  );

  const [body, setBody] = useState({
    start_date: GLOBAL_DATE_RANGES[dateRange]?.start || '',
    end_date: GLOBAL_DATE_RANGES[dateRange]?.end || '',
    date_range: dateRange,
  });

  const totalsQuery = useQuery({
    queryKey: ['/api/v1/charts/totals_v2', body],
    queryFn: () =>
      request('POST', endpoint('/api/v1/charts/totals_v2'), body).then(
        (response) => response.data
      ),
    staleTime: Infinity,
  });

  const chartQuery = useQuery<{ data: ChartData }>(
    ['/api/v1/charts/chart_summary_v2', body],
    () => request('POST', endpoint('/api/v1/charts/chart_summary_v2'), body),
    {
      staleTime: Infinity,
    }
  );

  useEffect(() => {
    if (settings?.preferences?.dashboard_charts?.range) {
      const range = settings.preferences.dashboard_charts.range;
      setBody((prev) => ({
        ...prev,
        date_range: range,
        start_date: GLOBAL_DATE_RANGES[range]?.start || prev.start_date,
        end_date: GLOBAL_DATE_RANGES[range]?.end || prev.end_date,
      }));
    }
  }, [settings?.preferences?.dashboard_charts?.range]);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width || 0;
      const breakpoint = determineBreakpoint(width);
      setActiveBreakpoint(breakpoint);
      setMetrics(BREAKPOINT_METRICS[breakpoint]);

      setLayouts((current) => {
        if (current[breakpoint]) return current;
        const scaled = scaleLayout(
          current.xxl,
          BREAKPOINT_COLUMNS.xxl,
          BREAKPOINT_COLUMNS[breakpoint]
        );
        return { ...current, [breakpoint]: scaled };
      });
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const availableCurrencies: Currency[] = useMemo(() => {
    const companyCurrencies =
      company?.company_gateway_tokens || user?.company_user?.company
        ?.company_gateway_tokens;

    const unique: Record<string, Currency> = {};
    companyCurrencies?.forEach((token) => {
      if (token?.gateway?.currency_id) {
        unique[token.gateway.currency_id] = {
          value: token.gateway.currency_id,
          label: token.gateway.currency?.name || token.gateway.currency_id,
        };
      }
    });

    return Object.values(unique);
  }, [company, user]);

  const handleDateChange = (range: string) => {
    const [start, end] = range.split(',');
    const startDate = dayjs(start);
    const endDate = dayjs(end);
    if (!startDate.isValid() || !endDate.isValid()) {
      return;
    }

    const normalized = startDate.isAfter(endDate)
      ? { start_date: end, end_date: start }
      : { start_date: start, end_date: end };

    setBody({ ...normalized, date_range: 'custom' });
    setDates(normalized);
  };

  const handleLayoutSave = useCallback(
    (layout: DashboardGridItem[]) => {
      setLayouts((current) => ({
        ...current,
        [activeBreakpoint]: layout,
      }));
    },
    [activeBreakpoint]
  );

  useDebounce(
    () => {
      if (!user) return;
      const updated = cloneDeep(user) as User;
      set(
        updated,
        'company_user.react_settings.dashboard_cards_configuration',
        layouts
      );

      if (!diff(user?.company_user?.react_settings?.dashboard_cards_configuration || {}, layouts)) {
        return;
      }

      request(
        'PUT',
        endpoint('/api/v1/company_users/:id', { id: updated.id }),
        updated
      ).then((response: GenericSingleResourceResponse<CompanyUser>) => {
        set(updated, 'company_user', response.data.data);
        dispatch(updateUser(updated));
        $refetch(['company_users']);
      });
    },
    1500,
    [layouts]
  );

  const handleRemoveCard = (card: DashboardCardKey) => {
    toast.processing();

    const updatedUser = cloneDeep(user) as User;
    const removedCards =
      settings?.removed_dashboard_cards?.[activeBreakpoint] || [];

    set(
      updatedUser,
      `company_user.react_settings.removed_dashboard_cards.${activeBreakpoint}`,
      [...removedCards, card]
    );

    request(
      'PUT',
      endpoint('/api/v1/company_users/:id', { id: updatedUser.id }),
      updatedUser
    ).then((response: GenericSingleResourceResponse<CompanyUser>) => {
      set(updatedUser, 'company_user', response.data.data);
      toast.success('removed');
      $refetch(['company_users']);
      dispatch(updateUser(updatedUser));
    });
  };

  const isCardRemoved = useCallback(
    (cardName: DashboardCardKey) => {
      return settings?.removed_dashboard_cards?.[activeBreakpoint]?.includes(
        cardName
      );
    },
    [settings?.removed_dashboard_cards, activeBreakpoint]
  );

  const renderCard = useCallback(
    (card: DashboardCardKey) => {
      switch (card) {
        case 'preferences':
          if (!currentDashboardFields?.length) return null;
          return (
            <div className="flex h-full flex-col">
              {isEditMode && (
                <div className="dashboard-card__drag-handle flex items-center justify-center gap-2 border border-dashed border-primary-500 bg-primary-500/10 py-1 text-xs text-primary-500">
                  <Icon element={MdDragHandle} size={16} />
                  <span>{t('drag_to_move')}</span>
                </div>
              )}
              <div className="flex-1 overflow-auto">
                <PreferenceCardsGridDnd
                  currentDashboardFields={currentDashboardFields}
                  dateRange={dateRange}
                  startDate={dates.start_date}
                  endDate={dates.end_date}
                  currencyId={currency.toString()}
                  layoutBreakpoint={activeBreakpoint}
                  isEditMode={isEditMode}
                />
              </div>
            </div>
          );

        case 'totals':
          if (!enabled(ModuleBitmask.Invoices)) return null;
          return (
            <Card
              title={t('totals')}
              className={classNames('h-full flex flex-col', {
                'dashboard-card__drag-handle cursor-grab': isEditMode,
              })}
              withoutBodyPadding
              shouldWrapBody
              topRight={
                <div className="flex items-center gap-2">
                  <DashboardCardSelector />
                  {totalsQuery.isFetching && <Spinner />}
                </div>
              }
            >
              <div className="grid grid-cols-2 gap-4 p-4">
                {(totalsQuery.data?.data || []).map((total: TotalsRecord, index: number) => (
                  <div key={index} className="flex flex-col gap-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {t(Object.keys(total)[0])}
                    </span>
                    <span className="text-lg font-semibold">
                      {formatMoney(
                        Number(Object.values(total)[0]?.amount || 0),
                        company?.settings.country_id,
                        Object.values(total)[0]?.code || undefined
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          );

        case 'overview':
          return (
            <Card
              title={t('overview')}
              className={classNames('h-full flex flex-col', {
                'dashboard-card__drag-handle cursor-grab': isEditMode,
              })}
              shouldWrapBody
              withoutBodyPadding
            >
              <div className="flex flex-col gap-3 p-4">
                <div className="grid grid-cols-3 gap-3">
                  <SelectField
                    label={t('chart_style')}
                    value={chartSensitivity}
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
                    value={body.date_range}
                    onValueChange={(value) =>
                      update('preferences.dashboard_charts.range', value)
                    }
                  >
                    {Object.keys(GLOBAL_DATE_RANGES).map((key) => (
                      <option key={key} value={key}>
                        {t(key)}
                      </option>
                    ))}
                  </SelectField>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {t('custom_range')}
                    </span>
                    <DropdownDateRangePicker
                      value={body.date_range}
                      startDate={body.start_date}
                      endDate={body.end_date}
                      handleDateRangeChange={(value) =>
                        setBody((prev) => ({
                          ...prev,
                          date_range: value,
                          start_date: GLOBAL_DATE_RANGES[value]?.start || prev.start_date,
                          end_date: GLOBAL_DATE_RANGES[value]?.end || prev.end_date,
                        }))
                      }
                      handleDateChange={handleDateChange}
                    />
                  </div>
                </div>
                <div className="flex-1 min-h-[280px]">
                  {chartQuery.isFetching && (
                    <div className="flex h-full items-center justify-center">
                      <Spinner />
                    </div>
                  )}
                  {!chartQuery.isFetching && chartQuery.data?.data && (
                    <Chart
                      data={chartQuery.data.data}
                      dates={dates}
                      chartSensitivity={chartSensitivity}
                      currency={currency.toString()}
                    />
                  )}
                </div>
              </div>
            </Card>
          );

        case 'upcoming_invoices':
          if (
            !enabled(ModuleBitmask.Invoices) ||
            isCardRemoved('upcoming_invoices')
          )
            return null;
          return (
            <UpcomingInvoices
              isEditMode={isEditMode}
              topRight={
                isEditMode && (
                  <Button
                    className="cancelDraggingCards"
                    type="secondary"
                    behavior="button"
                    onClick={() => handleRemoveCard('upcoming_invoices')}
                  >
                    {t('remove')}
                  </Button>
                )
              }
            />
          );

        case 'past_due_invoices':
          if (
            !enabled(ModuleBitmask.Invoices) ||
            isCardRemoved('past_due_invoices')
          )
            return null;
          return (
            <PastDueInvoices
              isEditMode={isEditMode}
              topRight={
                isEditMode && (
                  <Button
                    className="cancelDraggingCards"
                    type="secondary"
                    behavior="button"
                    onClick={() => handleRemoveCard('past_due_invoices')}
                  >
                    {t('remove')}
                  </Button>
                )
              }
            />
          );

        case 'expired_quotes':
          if (
            !enabled(ModuleBitmask.Quotes) ||
            isCardRemoved('expired_quotes')
          )
            return null;
          return (
            <ExpiredQuotes
              isEditMode={isEditMode}
              topRight={
                isEditMode && (
                  <Button
                    className="cancelDraggingCards"
                    type="secondary"
                    behavior="button"
                    onClick={() => handleRemoveCard('expired_quotes')}
                  >
                    {t('remove')}
                  </Button>
                )
              }
            />
          );

        case 'upcoming_quotes':
          if (
            !enabled(ModuleBitmask.Quotes) ||
            isCardRemoved('upcoming_quotes')
          )
            return null;
          return (
            <UpcomingQuotes
              isEditMode={isEditMode}
              topRight={
                isEditMode && (
                  <Button
                    className="cancelDraggingCards"
                    type="secondary"
                    behavior="button"
                    onClick={() => handleRemoveCard('upcoming_quotes')}
                  >
                    {t('remove')}
                  </Button>
                )
              }
            />
          );

        case 'recent_payments':
          if (
            !enabled(ModuleBitmask.Payments) ||
            isCardRemoved('recent_payments')
          )
            return null;
          return (
            <RecentPayments
              isEditMode={isEditMode}
              topRight={
                isEditMode && (
                  <Button
                    className="cancelDraggingCards"
                    type="secondary"
                    behavior="button"
                    onClick={() => handleRemoveCard('recent_payments')}
                  >
                    {t('remove')}
                  </Button>
                )
              }
            />
          );

        case 'upcoming_recurring_invoices':
          if (
            !enabled(ModuleBitmask.RecurringInvoices) ||
            isCardRemoved('upcoming_recurring_invoices')
          )
            return null;
          return (
            <UpcomingRecurringInvoices
              isEditMode={isEditMode}
              topRight={
                isEditMode && (
                  <Button
                    className="cancelDraggingCards"
                    type="secondary"
                    behavior="button"
                    onClick={() => handleRemoveCard('upcoming_recurring_invoices')}
                  >
                    {t('remove')}
                  </Button>
                )
              }
            />
          );

        case 'activity':
          if (
            !enabled(ModuleBitmask.Activities) ||
            isCardRemoved('activity')
          )
            return null;
          return (
            <Activity
              isEditMode={isEditMode}
              topRight={
                isEditMode && (
                  <Button
                    className="cancelDraggingCards"
                    type="secondary"
                    behavior="button"
                    onClick={() => handleRemoveCard('activity')}
                  >
                    {t('remove')}
                  </Button>
                )
              }
            />
          );

        default:
          return null;
      }
    },
    [
      isEditMode,
      currentDashboardFields,
      dateRange,
      dates,
      currency,
      activeBreakpoint,
      enabled,
      settings?.removed_dashboard_cards,
      totalsQuery.data?.data,
      totalsQuery.isFetching,
      chartQuery.data?.data,
      chartQuery.isFetching,
      formatMoney,
      company,
      t,
    ]
  );

  const toolbar = (
    <Card
      withoutBodyPadding
      className="flex h-full items-center justify-end gap-4"
      title=""
    >
      <div className="flex items-center gap-3 px-4 py-2">
        <Badge variant="light" className="uppercase tracking-wider">
          {t('dashboard')}
        </Badge>
        <SelectField
          className="w-36"
          value={currency.toString()}
          onValueChange={(value) =>
            update('preferences.dashboard_charts.currency', parseInt(value))
          }
        >
          <option value="999">{t('all')}</option>
          {availableCurrencies.map((currencyOption) => (
            <option key={currencyOption.value} value={currencyOption.value}>
              {currencyOption.label}
            </option>
          ))}
        </SelectField>
        <div className="flex items-center gap-2">
          <DashboardCardSelector />
          <div
            className="flex cursor-pointer items-center"
            onClick={() => setIsEditMode((prev) => !prev)}
          >
            <Icon element={BiMove} size={20} />
          </div>
          {isEditMode && (
            <div className="flex items-center gap-2">
              <RestoreCardsModal
                layoutBreakpoint={activeBreakpoint}
                setLayouts={setLayouts}
                setAreCardsRestored={() => undefined}
              />
              <RestoreLayoutAction
                layoutBreakpoint={activeBreakpoint}
                setLayouts={setLayouts}
                setIsLayoutRestored={() => undefined}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  const gridLayout = layouts[activeBreakpoint] || layouts.xxl;

  return (
    <div ref={containerRef} className="space-y-4">
      <div>{toolbar}</div>
      <DashboardGrid
        layout={gridLayout}
        editable={isEditMode}
        metrics={metrics}
        onLayoutChange={handleLayoutSave}
        renderItem={(id) => renderCard(id as DashboardCardKey)}
      />
    </div>
  );
}
