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
import { useEffect, useState, useRef } from 'react';
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
import GridLayout, { Responsive, WidthProvider } from 'react-grid-layout';
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
import dayjs from 'dayjs';
import { useDebounce } from 'react-use';
import { diff } from 'deep-object-diff';
import { User } from '$app/common/interfaces/user';
import { cloneDeep, isEqual, set } from 'lodash';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import {
  CompanyUser,
  DashboardField,
} from '$app/common/interfaces/company-user';
import { $refetch } from '$app/common/hooks/useRefetch';
import { updateUser } from '$app/common/stores/slices/user';
import { useDispatch } from 'react-redux';
import { toast } from '$app/common/helpers/toast/toast';
import { RestoreCardsModal } from './RestoreCardsModal';
import { RestoreLayoutAction } from './RestoreLayoutAction';
import { Chart } from './Chart';
import { PreferenceCardsGrid } from './PreferenceCardsGrid';
import { MdDragHandle } from 'react-icons/md';
import {
  DashboardRowLayout,
  convertFlatLayoutToRows,
  convertRowsToFlatLayout,
} from '../types/DashboardRowTypes';
import { DashboardRowContainer } from './DashboardRowContainer';
const ResponsiveGridLayout = WidthProvider(Responsive);

// Helper function to scale layouts when breakpoint changes
function scaleLayoutForBreakpoint(
  layout: GridLayout.Layout[],
  oldCols: number,
  newCols: number
): GridLayout.Layout[] {
  if (oldCols === newCols) return layout;
  
  const scaleFactor = newCols / oldCols;
  
  return layout.map(item => ({
    ...item,
    x: Math.round(item.x * scaleFactor),
    w: Math.max(1, Math.round(item.w * scaleFactor)),
    // Keep y and h unchanged for vertical stability
  }));
}

// Helper function to optimize row heights after drag/drop
function optimizeRowHeights(layout: GridLayout.Layout[]): GridLayout.Layout[] {
  // Group items by Y position to identify rows
  const rows = new Map<number, GridLayout.Layout[]>();
  
  layout.forEach(item => {
    const y = item.y || 0;
    if (!rows.has(y)) {
      rows.set(y, []);
    }
    rows.get(y)!.push(item);
  });
  
  // For each row, set all items to the max height needed
  rows.forEach(items => {
    const maxHeight = Math.max(...items.map(i => i.h || 20));
    items.forEach(item => {
      item.h = maxHeight;
    });
  });
  
  return layout;
}

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

type CardName =
  | 'account_login_text'
  | 'upcoming_invoices'
  | 'upcoming_recurring_invoices'
  | 'upcoming_quotes'
  | 'expired_quotes'
  | 'past_due_invoices'
  | 'activity'
  | 'recent_payments'
  | 'overview';

export type DashboardGridLayouts = GridLayout.Layouts;

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

export const initialLayouts = {
 xxl: [   {
     i: '2',
     x: 0,
     y: 0,
     w: 330,
     h: 25,
     minH: 20,
      minW: 250,
      maxH: 30,
      maxW: 400,
    },
    {
      i: '3',
      x: 400,
      y: 0,
      w: 660,
      h: 25,
     minH: 20,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '4',
      x: 0,
      y: 25,
      w: 495,
      h: 20,
      minH: 16,
      minW: 350,
      maxH: 30,
      maxW: 700,
    },
    {
      i: '5',
      x: 510,
      y: 25,
      w: 495,
      h: 20,
      minH: 16,
      minW: 350,
      maxH: 30,
      maxW: 700,
    },
    {
      i: '6',
      x: 0,
      y: 45,
      w: 495,
      h: 20,
      minH: 16,
      minW: 350,
      maxH: 30,
      maxW: 700,
    },
    {
      i: '7',
      x: 510,
      y: 45,
      w: 495,
      h: 20,
      minH: 16,
      minW: 350,
      maxH: 30,
      maxW: 700,
    },
    {
      i: '8',
      x: 0,
      y: 65,
      w: 495,
      h: 20,
      minH: 16,
      minW: 350,
      maxH: 30,
      maxW: 700,
    },
    {
      i: '9',
      x: 510,
      y: 65,
      w: 495,
      h: 20,
      minH: 16,
      minW: 350,
      maxH: 30,
      maxW: 700,
    },
    {
      i: '10',
      x: 0,
      y: 85,
      w: 495,
      h: 20,
      minH: 16,
      minW: 350,
      maxH: 30,
      maxW: 700,
    },
  ],
  xl: [
    {
      i: '1',
      x: 0,
      y:  0,
      w: 1000,
      h: 15,
      minH: 10,
      maxH: 25,
    },
    {
      i: '2',
      x: 0,
      y: 15,
      w: 330,
      h: 25,
      minH: 20,
      minW: 250,
      maxH: 30,
      maxW: 400,
    },
    {
      i: '3',
      x: 400,
      y: 15,
      w: 660,
      h: 25,
      minH: 20,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '4',
      x: 0,
      y: 25,
      w: 495,
      h: 20,
      minH: 16,
      minW: 350,
      maxH: 30,
      maxW: 700,
    },
    {
      i: '5',
      x: 510,
      y: 25,
      w: 495,
      h: 20,
      minH: 16,
      minW: 350,
      maxH: 30,
      maxW: 700,
    },
    {
      i: '6',
      x: 0,
      y: 45,
      w: 495,
      h: 20,
      minH: 16,
      minW: 350,
      maxH: 30,
      maxW: 700,
    },
    {
      i: '7',
      x: 510,
      y: 45,
      w: 495,
      h: 20,
      minH: 16,
      minW: 350,
      maxH: 30,
      maxW: 700,
    },
    {
      i: '8',
      x: 0,
      y: 65,
      w: 495,
      h: 20,
      minH: 16,
      minW: 350,
      maxH: 30,
      maxW: 700,
    },
    {
      i: '9',
      x: 510,
      y: 65,
      w: 495,
      h: 20,
      minH: 16,
      minW: 350,
      maxH: 30,
      maxW: 700,
    },
    {
      i: '10',
      x: 0,
      y: 85,
      w: 495,
      h: 20,
      minH: 16,
      minW: 350,
      maxH: 30,
      maxW: 700,
    },
  ],
  lg: [    {
      i: '2',
      x: 0,
      y: 0,
      w: 330,
      h: 25,
      minH: 20,
      minW: 250,
      maxH: 30,
      maxW: 400,
    },
    {
      i: '3',
      x: 400,
      y: 0,
      w: 660,
      h: 25,
      minH: 20,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '4',
      x: 0,
      y: 25,
      w: 495,
      h: 20,
      minH: 16,
      minW: 350,
      maxH: 30,
      maxW: 700,
    },
    {
      i: '5',
      x: 510,
      y: 25,
      w: 495,
      h: 20,
      minH: 16,
      minW: 350,
      maxH: 30,
      maxW: 700,
    },
    {
      i: '6',
      x: 0,
      y: 45,
      w: 495,
      h: 20,
      minH: 16,
      minW: 350,
      maxH: 30,
      maxW: 700,
    },
    {
      i: '7',
      x: 510,
      y: 45,
      w: 495,
      h: 20,
      minH: 16,
      minW: 350,
      maxH: 30,
      maxW: 700,
    },
    {
      i: '8',
      x: 0,
      y: 65,
      w: 495,
      h: 20,
      minH: 16,
      minW: 350,
      maxH: 30,
      maxW: 700,
    },
    {
      i: '9',
      x: 510,
      y: 65,
      w: 495,
      h: 20,
      minH: 16,
      minW: 350,
      maxH: 30,
      maxW: 700,
    },
    {
      i: '10',
      x: 0,
      y: 85,
      w: 495,
      h: 20,
      minH: 16,
      minW: 350,
      maxH: 30,
      maxW: 700,
    },
  ],
  md: [    {
      i: '2',
      x: 0,
      y: 0,
      w: 1000,
      h: 25,
      minH: 20,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '3',
      x: 0,
      y: 0,
      w: 1000,
      h: 25,
      minH: 20,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '4',
      x: 0,
      y: 25,
      w: 1000,
      h: 20,
      minH: 16,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '5',
      x: 0,
      y: 25,
      w: 1000,
      h: 20,
      minH: 16,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '6',
      x: 0,
      y: 45,
      w: 1000,
      h: 20,
      minH: 16,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '7',
      x: 0,
      y: 45,
      w: 1000,
      h: 20,
      minH: 16,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '8',
      x: 0,
      y: 65,
      w: 1000,
      h: 20,
      minH: 16,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '9',
      x: 0,
      y: 65,
      w: 1000,
      h: 20,
      minH: 16,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '10',
      x: 0,
      y: 85,
      w: 1000,
      h: 20,
      minH: 16,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
  ],
  sm: [    {
      i: '2',
      x: 0,
      y: 0,
      w: 1000,
      h: 25,
      minH: 20,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '3',
      x: 0,
      y: 0,
      w: 1000,
      h: 25,
      minH: 20,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '4',
      x: 0,
      y: 25,
      w: 1000,
      h: 20,
      minH: 16,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '5',
      x: 0,
      y: 25,
      w: 1000,
      h: 20,
      minH: 16,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '6',
      x: 0,
      y: 45,
      w: 1000,
      h: 20,
      minH: 16,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '7',
      x: 0,
      y: 45,
      w: 1000,
      h: 20,
      minH: 16,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '8',
      x: 0,
      y: 65,
      w: 1000,
      h: 20,
      minH: 16,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '9',
      x: 0,
      y: 65,
      w: 1000,
      h: 20,
      minH: 16,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '10',
      x: 0,
      y: 85,
      w: 1000,
      h: 20,
      minH: 16,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
  ],
  xs: [    {
      i: '2',
      x: 0,
      y: 0,
      w: 1000,
      h: 25,
      minH: 20,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '3',
      x: 0,
      y: 0,
      w: 1000,
      h: 25,
      minH: 20,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '4',
      x: 0,
      y: 25,
      w: 1000,
      h: 20,
      minH: 16,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '5',
      x: 0,
      y: 25,
      w: 1000,
      h: 20,
      minH: 16,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '6',
      x: 0,
      y: 45,
      w: 1000,
      h: 20,
      minH: 16,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '7',
      x: 0,
      y: 45,
      w: 1000,
      h: 20,
      minH: 16,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '8',
      x: 0,
      y: 65,
      w: 1000,
      h: 20,
      minH: 16,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '9',
      x: 0,
      y: 65,
      w: 1000,
      h: 20,
      minH: 16,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '10',
      x: 0,
      y: 85,
      w: 1000,
      h: 20,
      minH: 16,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
  ],
  xxs: [    {
      i: '2',
      x: 0,
      y: 0,
      w: 1000,
      h: 25,
      minH: 20,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '3',
      x: 0,
      y: 0,
      w: 1000,
      h: 25,
      minH: 20,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '4',
      x: 0,
      y: 25,
      w: 1000,
      h: 20,
      minH: 16,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '5',
      x: 0,
      y: 25,
      w: 1000,
      h: 20,
      minH: 16,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '6',
      x: 0,
      y: 45,
      w: 1000,
      h: 20,
      minH: 16,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '7',
      x: 0,
      y: 45,
      w: 1000,
      h: 20,
      minH: 16,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '8',
      x: 0,
      y: 65,
      w: 1000,
      h: 20,
      minH: 16,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '9',
      x: 0,
      y: 65,
      w: 1000,
      h: 20,
      minH: 16,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '10',
      x: 0,
      y: 85,
      w: 1000,
      h: 20,
      minH: 16,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
  ],
};

export function ResizableDashboardCards() {
  const [t] = useTranslation();

  const { Preferences, update } = usePreferences();

  const enabled = useEnabled();
  const dispatch = useDispatch();
  const formatMoney = useFormatMoney();

  const user = useCurrentUser();
  const colors = useColorScheme();
  const company = useCurrentCompany();
  const settings = useReactSettings();

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [totalsData, setTotalsData] = useState<TotalsRecord[]>([]);

 const [layoutBreakpoint, setLayoutBreakpoint] = useState<string>();
 const [layouts, setLayouts] = useState<DashboardGridLayouts>(initialLayouts);
  
  // Row-based layouts (Grafana-style)
  const [rowLayouts, setRowLayouts] = useState<{
    [breakpoint: string]: DashboardRowLayout;
  }>({});
  const [useRowBasedLayout, setUseRowBasedLayout] = useState<boolean>(false);

 // Drag state tracking to prevent click-triggered layout changes
 const isDraggingRef = useRef<boolean>(false);
 const isResizingRef = useRef<boolean>(false);

const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isLayoutsInitialized, setIsLayoutsInitialized] =
    useState<boolean>(false);
  const [isLayoutRestored, setIsLayoutRestored] = useState<boolean>(false);
  const [areCardsRestored, setAreCardsRestored] = useState<boolean>(false);
  const [arePreferenceCardsChanged, setArePreferenceCardsChanged] =
    useState<boolean>(false);
  const [currentDashboardFields, setCurrentDashboardFields] = useState<
    DashboardField[]
  >([]);

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

  const onResizeStop = (
  layout: GridLayout.Layout[],
) => {
  // Clear resize flag
  isResizingRef.current = false;
  
 if (layoutBreakpoint) {
      setLayouts((current) => {
        // Preserve heights from current layout to prevent auto-expansion
        return {
          ...current,
          [layoutBreakpoint]: layout,
        };
      });
    }
  };

  const onDragStop = (layout: GridLayout.Layout[]) => {
    // Clear drag flag
    isDraggingRef.current = false;
    
    if (!layoutBreakpoint) return;

    setLayouts((current) => {
      // Preserve heights after drag completes
      const preservedLayout = layout.map((item) => {
        const existingItem = current[layoutBreakpoint]?.find((i) => i.i === item.i);
        return {
          ...item,
          h: existingItem?.h ?? item.h, // Lock height
        };
      });
      
      // Optimize row heights to minimize wasted space
      const optimizedLayout = optimizeRowHeights(preservedLayout);
      
      return {
        ...current,
        [layoutBreakpoint]: optimizedLayout,
      };
    });
  };

  // Handler to completely lock heights - called by onLayoutChange to prevent auto-adjustments
  const handleLayoutChangeWithLock = (current: GridLayout.Layout[]) => {
    // Prevent click-triggered layout changes
    // Only allow layout changes during explicit drag/resize or card restoration
    if (!layoutBreakpoint) return;
    
    // Ignore layout changes unless we're dragging, resizing, or restoring cards
    if (!isDraggingRef.current && !isResizingRef.current && !areCardsRestored && !arePreferenceCardsChanged) {
      return;
    }
    
    if (areCardsRestored || arePreferenceCardsChanged) {
      handleOnLayoutChange(current);
    } else {
      // Lock heights even when layout changes internally
      setLayouts((prev) => {
        const lockedLayout = current.map((item) => {
          const existingItem = prev[layoutBreakpoint]?.find((i) => i.i === item.i);
          return {
            ...item,
            h: existingItem?.h ?? item.h, // Always preserve height
          };
        });
        
        // Only update if something actually changed (comparing by item.i)
        const hasChanges = lockedLayout.some((item) => {
          const existing = prev[layoutBreakpoint]?.find((e) => e.i === item.i);
          if (!existing) return true;
          return item.x !== existing.x || item.y !== existing.y || item.w !== existing.w || item.h !== existing.h;
        });
        
        if (hasChanges) {
          return {
            ...prev,
            [layoutBreakpoint]: lockedLayout,
          };
        }
        return prev;
      });
    }
  };

  const handleUpdateUserPreferences = () => {
    const updatedUser = cloneDeep(user) as User;

    set(
      updatedUser,
      'company_user.react_settings.dashboard_cards_configuration',
      cloneDeep(layouts)
    );

    // delete updatedUser.company_user?.settings?.dashboard_fields;

    // delete updatedUser.company_user?.react_settings
    //   ?.preference_cards_configuration;

    // delete updatedUser.company_user.react_settings
    //   .dashboard_cards_configuration;

    // delete updatedUser.company_user.react_settings.removed_dashboard_cards;

    request(
      'PUT',
      endpoint('/api/v1/company_users/:id', { id: updatedUser.id }),
      updatedUser
    ).then((response: GenericSingleResourceResponse<CompanyUser>) => {
      set(updatedUser, 'company_user', response.data.data);

      $refetch(['company_users']);

      dispatch(updateUser(updatedUser));
    });
  };

  const handleRemoveCard = (cardName: CardName) => {
    toast.processing();

    const updatedUser = cloneDeep(user) as User;

    const removedCards =
      settings?.removed_dashboard_cards?.[layoutBreakpoint || ''] || [];

    set(
      updatedUser,
      `company_user.react_settings.removed_dashboard_cards.${layoutBreakpoint}`,
      [...removedCards, cardName]
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

  const isCardRemoved = (cardName: CardName) => {
    if (!layoutBreakpoint) return false;

    return settings?.removed_dashboard_cards?.[
      layoutBreakpoint || ''
    ]?.includes(cardName);
  };

  const handleOnLayoutChange = (currentLayout: GridLayout.Layout[]) => {
    if (layoutBreakpoint) {
      let isAnyRestored = false;

      setLayouts((currentLayouts) => ({
        ...currentLayouts,
        [layoutBreakpoint]: currentLayout.map((layoutCard) => {
          if (layoutCard.h === 1 && layoutCard.w === 1) {
            const initialCardLayout = initialLayouts[
              layoutBreakpoint as keyof typeof initialLayouts
            ]?.find((initial) => initial.i === layoutCard.i);

            if (initialCardLayout) {
              isAnyRestored = true;
            }

            return initialCardLayout
              ? {
                  ...initialCardLayout,
                  y: initialCardLayout.i === '1' ? 1 : Infinity,
                }
              : layoutCard;
          }

          return layoutCard;
        }),
      }));

      arePreferenceCardsChanged && setArePreferenceCardsChanged(false);

      if (!arePreferenceCardsChanged) {
        setTimeout(() => {
          if (isAnyRestored) {
            setAreCardsRestored(false);

            window.scrollTo({
              top:
                document.querySelector('.responsive-grid-box')?.scrollHeight ||
                0,
              behavior: 'smooth',
            });
          }
        }, 450);
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleScroll = (isDraggingDown: boolean) => {
    const scrollAmount = 15;

    const containerRect = document
      .querySelector('.responsive-grid-box')
      ?.getBoundingClientRect();
    if (!containerRect) return;

    if (isDraggingDown) {
      window.scrollBy({
        behavior: 'smooth',
        top: scrollAmount,
      });
    } else {
      window.scrollBy({
        behavior: 'smooth',
        top: -scrollAmount,
      });
    }
  };

  const handleOnDrag = (
   layout: GridLayout.Layout[],
   oldItem: GridLayout.Layout,
   newItem: GridLayout.Layout,
   placeholder: GridLayout.Layout
 ) => {
    // Set drag flag to prevent click-triggered layout changes
    isDraggingRef.current = true;
    
    // Lock height to prevent vertical expansion
    placeholder.h = oldItem.h;
    newItem.h = oldItem.h;
  };

  useEffect(() => {
    setBody((current) => ({
      ...current,
      date_range: dateRange,
    }));
  }, [settings?.preferences?.dashboard_charts?.range]);

  useEffect(() => {
    setArePreferenceCardsChanged(true);
  }, [currentDashboardFields]);

  useEffect(() => {
    if (
      user?.company_user?.react_settings?.dashboard_fields &&
      !isEqual(
        user?.company_user?.react_settings?.dashboard_fields,
        currentDashboardFields
      )
    ) {
      setCurrentDashboardFields(
        cloneDeep(user?.company_user?.react_settings?.dashboard_fields)
      );
    }
  }, [user?.company_user?.react_settings?.dashboard_fields]);

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
   if (layoutBreakpoint) {
     if (settings?.dashboard_cards_configuration && !isLayoutsInitialized) {
       setLayouts(cloneDeep(settings?.dashboard_cards_configuration));

       setIsLayoutsInitialized(true);
     }
   }
 }, [layoutBreakpoint]);

  // Convert flat layouts to row layouts on initialization
useEffect(() => {
  if (!isLayoutsInitialized || Object.keys(rowLayouts).length > 0) {
    return;
  }

  const convertedLayouts: { [breakpoint: string]: DashboardRowLayout } = {};

  Object.keys(layouts).forEach((breakpoint) => {
    const flatLayout = layouts[breakpoint];
    convertedLayouts[breakpoint] = {
      rows: convertFlatLayoutToRows(flatLayout),
    };
  });

  setRowLayouts(convertedLayouts);
   // DISABLED: Current row-based implementation is fundamentally broken
   // Issues: Height calculations wrong, cards swap positions on click, window resize broken
   // setUseRowBasedLayout(true);
}, [isLayoutsInitialized, layouts]);

useDebounce(
    () => {
      if (
        settings &&
        !settings.dashboard_cards_configuration &&
        Object.keys(diff(initialLayouts, layouts)).length
      ) {
        handleUpdateUserPreferences();
      }

      if (
        settings &&
        settings.dashboard_cards_configuration &&
        Object.keys(diff(settings.dashboard_cards_configuration, layouts))
          .length
      ) {
        handleUpdateUserPreferences();
      }
    },
   1500,
   [layouts]
);

  // Render panel by ID - used in row-based layout
  const renderPanel = (panelId: string): JSX.Element | null => {
    switch (panelId) {
      case '0':
        // Date/currency selectors (static)
        return (
          <div className="flex justify-end">
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
                 {currencies.map((selectedCurrency) => (
                   <option
                     key={selectedCurrency.value}
                     value={selectedCurrency.value}
                   >
                     {selectedCurrency.label}
                   </option>
                 ))}
               </SelectField>
             )}
              <DropdownDateRangePicker
                value={body.date_range}
                startDate={body.start_date}
                endDate={body.end_date}
                handleDateChange={handleDateChange}
                handleDateRangeChange={(range) => {
                  setBody({
                    start_date: GLOBAL_DATE_RANGES[range]?.start || '',
                    end_date: GLOBAL_DATE_RANGES[range]?.end || '',
                    date_range: range,
                  });
                }}
              />
            </div>
          </div>
        );

      case '1':
        // PreferenceCardsGrid
        if (!currentDashboardFields?.length) return null;
        return (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {isEditMode && (
              <div
                className="drag-handle"
                style={{
                  height: '30px',
                  cursor: 'grab',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  border: '2px dashed rgba(59, 130, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon element={MdDragHandle} size={20} />
                <span style={{ marginLeft: '8px', fontSize: '12px', color: 'rgba(59, 130, 246, 0.7)' }}>Drag to move panel</span>
              </div>
            )}
            <div className="no-drag-zone" style={{ flex: 1, overflow: 'auto', minHeight: 0, cursor: 'default' }}>
            <PreferenceCardsGrid
              currentDashboardFields={currentDashboardFields}
              dateRange={dateRange}
              startDate={dates.start_date}
              endDate={dates.end_date}
              currencyId={currency.toString()}
              layoutBreakpoint={layoutBreakpoint}
              isEditMode={isEditMode}
            />
            </div>
          </div>
        );

      case '2':
        // Account login text card
        if (!company || isCardRemoved('account_login_text')) return null;
        return (
          <div
            className={classNames('drag-handle', {
              'cursor-grab': isEditMode,
            })}
          >
            <Card
              title={t('account_login_text')}
              height="full"
              withScrollableBody
              topRight={
                isEditMode && (
                  <Button
                    className="cancelDraggingCards"
                    behavior="button"
                    type="secondary"
                    onClick={() => handleRemoveCard('account_login_text')}
                  >
                    {t('remove')}
                  </Button>
                )
              }
            >
              <div className="pb-8">
                <div className="flex flex-col space-y-1 px-6">
                  <span className="text-lg">{`${user?.first_name} ${user?.last_name}`}</span>
                  <span className="text-sm text-gray-500">
                    {t('recent_transactions')}
                  </span>
                </div>
                <div className="flex flex-col mt-8">
                  <div
                    style={{ borderColor: colors.$4 }}
                    className="flex justify-between items-center border-b py-3 px-6"
                  >
                    <span style={{ fontSize: '0.95rem' }}>{t('invoices')}</span>
                    <Badge style={{ backgroundColor: TotalColors.Blue }}>
                      <div className="px-1.5 py-0.5" style={{ fontSize: '0.95rem' }}>
                        {formatMoney(
                          totalsData[currency]?.invoices?.invoiced_amount || 0,
                          company.settings.country_id,
                          currency.toString(),
                          2
                        )}
                      </div>
                    </Badge>
                  </div>
                  <div
                    style={{ borderColor: colors.$4 }}
                    className="flex justify-between items-center border-b py-3 px-6"
                  >
                    <span style={{ fontSize: '0.95rem' }}>{t('payments')}</span>
                    <Badge style={{ backgroundColor: TotalColors.Green }}>
                      <div className="px-1.5 py-0.5" style={{ fontSize: '0.95rem' }}>
                        {formatMoney(
                          totalsData[currency]?.revenue?.paid_to_date || 0,
                          company.settings.country_id,
                          currency.toString(),
                          2
                        )}
                      </div>
                    </Badge>
                  </div>
                  <div
                    style={{ borderColor: colors.$4 }}
                    className="flex justify-between items-center border-b py-3 px-6"
                  >
                    <span style={{ fontSize: '0.95rem' }}>{t('expenses')}</span>
                    <Badge style={{ backgroundColor: TotalColors.Gray }}>
                      <div className="px-1.5 py-0.5" style={{ fontSize: '0.95rem' }}>
                        {formatMoney(
                          totalsData[currency]?.expenses?.amount || 0,
                          company.settings.country_id,
                          currency.toString(),
                          2
                        )}
                      </div>
                    </Badge>
                  </div>
                  <div
                    style={{ borderColor: colors.$4 }}
                    className="flex justify-between items-center border-b py-3 px-6"
                  >
                    <span style={{ fontSize: '0.95rem' }}>{t('outstanding')}</span>
                    <Badge style={{ backgroundColor: TotalColors.Red }}>
                      <div className="px-1.5 py-0.5" style={{ fontSize: '0.95rem' }}>
                        {totalsData[currency]?.outstanding?.outstanding_count || 0}
                      </div>
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case '3':
        // Chart (Overview)
        if (!chartData || isCardRemoved('overview')) return null;
        return (
          <div
            className={classNames('drag-handle', {
              'cursor-grab': isEditMode,
            })}
          >
            <Card
              title={t('overview')}
              className="col-span-12 xl:col-span-8 pr-4"
              height="full"
              withScrollableBody
              topRight={
                isEditMode && (
                  <Button
                    className="cancelDraggingCards"
                    behavior="button"
                    type="secondary"
                    onClick={() => handleRemoveCard('overview')}
                  >
                    {t('remove')}
                  </Button>
                )
              }
              renderFromShadcn
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
        );

      case '4':
        // Activity
        if (isCardRemoved('activity')) return null;
        return (
          <div
            className={classNames('drag-handle', {
              'cursor-grab': isEditMode,
            })}
          >
            <Activity
              isEditMode={isEditMode}
              topRight={
                isEditMode && (
                  <Button
                    className="cancelDraggingCards"
                    behavior="button"
                    type="secondary"
                    onClick={() => handleRemoveCard('activity')}
                  >
                    {t('remove')}
                  </Button>
                )
              }
            />
          </div>
        );

      case '5':
        // Recent Payments
        if (isCardRemoved('recent_payments')) return null;
        return (
          <div
            className={classNames('drag-handle', {
              'cursor-grab': isEditMode,
            })}
          >
            <RecentPayments
              isEditMode={isEditMode}
              topRight={
                isEditMode && (
                  <Button
                    className="cancelDraggingCards"
                    behavior="button"
                    type="secondary"
                    onClick={() => handleRemoveCard('recent_payments')}
                  >
                    {t('remove')}
                  </Button>
                )
              }
            />
          </div>
        );

      case '6':
        // Upcoming Invoices
        if (!enabled(ModuleBitmask.Invoices) || isCardRemoved('upcoming_invoices'))
          return null;
        return (
          <div
            className={classNames('drag-handle', {
              'cursor-grab': isEditMode,
            })}
          >
            <UpcomingInvoices
              isEditMode={isEditMode}
              topRight={
                isEditMode && (
                  <Button
                    className="cancelDraggingCards"
                    behavior="button"
                    type="secondary"
                    onClick={() => handleRemoveCard('upcoming_invoices')}
                  >
                    {t('remove')}
                  </Button>
                )
              }
            />
          </div>
        );

      case '7':
        // Past Due Invoices
        if (!enabled(ModuleBitmask.Invoices) || isCardRemoved('past_due_invoices'))
          return null;
        return (
          <div
            className={classNames('drag-handle', {
              'cursor-grab': isEditMode,
            })}
          >
            <PastDueInvoices
              isEditMode={isEditMode}
              topRight={
                isEditMode && (
                  <Button
                    className="cancelDraggingCards"
                    behavior="button"
                    type="secondary"
                    onClick={() => handleRemoveCard('past_due_invoices')}
                  >
                    {t('remove')}
                  </Button>
                )
              }
            />
          </div>
        );

      case '8':
        // Expired Quotes
        if (!enabled(ModuleBitmask.Quotes) || isCardRemoved('expired_quotes'))
          return null;
        return (
          <div
            className={classNames('drag-handle', {
              'cursor-grab': isEditMode,
            })}
          >
            <ExpiredQuotes
              isEditMode={isEditMode}
              topRight={
                isEditMode && (
                  <Button
                    className="cancelDraggingCards"
                    behavior="button"
                    type="secondary"
                    onClick={() => handleRemoveCard('expired_quotes')}
                  >
                    {t('remove')}
                  </Button>
                )
              }
            />
          </div>
        );

      case '9':
        // Upcoming Quotes
        if (!enabled(ModuleBitmask.Quotes) || isCardRemoved('upcoming_quotes'))
          return null;
        return (
          <div
            className={classNames('drag-handle', {
              'cursor-grab': isEditMode,
            })}
          >
            <UpcomingQuotes
              isEditMode={isEditMode}
              topRight={
                isEditMode && (
                  <Button
                    className="cancelDraggingCards"
                    behavior="button"
                    type="secondary"
                    onClick={() => handleRemoveCard('upcoming_quotes')}
                  >
                    {t('remove')}
                  </Button>
                )
              }
            />
          </div>
        );

      case '10':
        // Upcoming Recurring Invoices
        if (
          !enabled(ModuleBitmask.RecurringInvoices) ||
          isCardRemoved('upcoming_recurring_invoices')
        )
          return null;
        return (
          <div
            className={classNames('drag-handle', {
              'cursor-grab': isEditMode,
            })}
          >
            <UpcomingRecurringInvoices
              isEditMode={isEditMode}
              topRight={
                isEditMode && (
                  <Button
                    className="cancelDraggingCards"
                    behavior="button"
                    type="secondary"
                    onClick={() =>
                      handleRemoveCard('upcoming_recurring_invoices')
                    }
                  >
                    {t('remove')}
                  </Button>
                )
              }
            />
          </div>
        );

      default:
        return null;
    }
  };

  // Handler for row layout changes
  const handleRowLayoutChange = (newLayout: DashboardRowLayout) => {
    if (!layoutBreakpoint) return;

    setRowLayouts((prev) => ({
      ...prev,
      [layoutBreakpoint]: newLayout,
    }));

    // Convert row layout back to flat layout for saving
    const flatLayout = convertRowsToFlatLayout(newLayout.rows);
    setLayouts((prev) => ({
      ...prev,
      [layoutBreakpoint]: flatLayout,
    }));
  };

return (
   <div className={classNames('w-full', { 'select-none': isEditMode, 'dashboard-edit-mode': isEditMode })}>
    {!totals.isLoading ? (
       <>
       {useRowBasedLayout &&
       layoutBreakpoint &&
       rowLayouts[layoutBreakpoint] ? (
         <DashboardRowContainer
           layout={rowLayouts[layoutBreakpoint]}
           breakpoint={layoutBreakpoint}
           isEditMode={isEditMode}
           onLayoutChange={handleRowLayoutChange}
           renderPanel={renderPanel}
           cols={{
             xxl: 1000,
             xl: 1000,
             lg: 1000,
             md: 1000,
             sm: 1000,
             xs: 1000,
             xxs: 1000,
           }}
         />
       ) : (
        <>
          {/* Static controls - outside grid to prevent dragging */}
          {!totals.isLoading && isLayoutsInitialized && (
          <div className="mb-4">
            <div className="flex justify-end">
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

              {isEditMode && (
                <>
                  <RestoreCardsModal
                    layoutBreakpoint={layoutBreakpoint}
                    setLayouts={setLayouts}
                    setAreCardsRestored={setAreCardsRestored}
                  />

                  <RestoreLayoutAction
                    layoutBreakpoint={layoutBreakpoint}
                    setLayouts={setLayouts}
                    setIsLayoutRestored={setIsLayoutRestored}
                  />
                </>
              )}
            </div>
            </div>
          </div>
          )}

    {/* PreferenceCardsGrid - OUTSIDE grid for full card interactivity */}
    {currentDashboardFields?.length ? (
      <div className="mb-4">
        <Card
          title={t('preference_cards')}
          withContainer
          style={{ 
            minHeight: '200px',
            maxHeight: '500px',
            overflow: 'auto',
            resize: 'vertical'
          }}
        >
          <PreferenceCardsGrid
            currentDashboardFields={currentDashboardFields}
            dateRange={dateRange}
            startDate={dates.start_date}
            endDate={dates.end_date}
            currencyId={currency.toString()}
            layoutBreakpoint={layoutBreakpoint}
            isEditMode={isEditMode}
          />
        </Card>
      </div>
    ) : null}


          <ResponsiveGridLayout
          className="layout responsive-grid-box"
           breakpoints={{
             xxl: 1400,
             xl: 1200,
             lg: 1000,
             md: 800,
             sm: 600,
             xs: 300,
             xxs: 0,
           }}
           layouts={layouts}
           cols={{
             xxl: 1000,
             xl: 1000,
             lg: 1000,
             md: 1000,
             sm: 1000,
             xs: 1000,
             xxs: 1000,
           }}
           draggableHandle=".drag-handle"
           draggableCancel=".no-drag-zone"
          margin={[0, 20]}
           rowHeight={20}
          isDraggable={isEditMode}
           isDroppable={isEditMode}
           isResizable={isEditMode}
           onBreakpointChange={(newBreakpoint, newCols) => {
             // Scale layout when breakpoint changes
             const oldBreakpoint = layoutBreakpoint || 'xxl';
             const colConfig = { xxl: 1000, xl: 1000, lg: 1000, md: 1000, sm: 1000, xs: 1000, xxs: 1000 };
             const oldCols = colConfig[oldBreakpoint as keyof typeof colConfig];
             const currentLayout = layouts[oldBreakpoint];
             
             if (currentLayout && oldCols !== newCols) {
               const scaledLayout = scaleLayoutForBreakpoint(currentLayout, oldCols, newCols);
               setLayouts(prev => ({
                 ...prev,
                 [newBreakpoint]: scaledLayout
               }));
             }
             
             setLayoutBreakpoint(newBreakpoint);
           }}
           onWidthChange={() => {
             // Trigger layout recalculation on window resize
             if (layoutBreakpoint && layouts[layoutBreakpoint]) {
               setLayouts((current) => ({ ...current }));
             }
           }}
           onResize={() => {
             // Set resize flag to allow layout changes during resize
             isResizingRef.current = true;
           }}
           onResizeStop={onResizeStop}
           onDragStop={onDragStop}
           onLayoutChange={handleLayoutChangeWithLock}
           resizeHandles={['s', 'w', 'e', 'se', 'sw']}
           compactType={null}
           preventCollision={true}
           allowOverlap={false}
           onDrag={handleOnDrag}
         >
          {(totals.isLoading || !isLayoutsInitialized) && (
            <div className="w-full flex justify-center">
              <Spinner />
            </div>
          )}


         {company && !isCardRemoved('account_login_text') ? (
           <div
             key="2"
              className={classNames('drag-handle', {
                'cursor-grab': isEditMode,
              })}
            >
              <Card
                title={t('account_login_text')}
                height="full"
                withScrollableBody
                topRight={
                  isEditMode && (
                    <Button
                      className="cancelDraggingCards"
                      behavior="button"
                      type="secondary"
                      onClick={() => handleRemoveCard('account_login_text')}
                    >
                      {t('remove')}
                    </Button>
                  )
                }
              >
                <div className="pb-8">
                  <div className="flex flex-col space-y-1 px-6">
                    <span className="text-lg">{`${user?.first_name} ${user?.last_name}`}</span>

                    <span className="text-sm text-gray-500">
                      {t('recent_transactions')}
                    </span>
                  </div>

                  <div className="flex flex-col mt-8">
                    <div
                      style={{ borderColor: colors.$4 }}
                      className="flex justify-between items-center border-b py-3 px-6"
                    >
                      <span style={{ fontSize: '0.95rem' }}>
                        {t('invoices')}
                      </span>

                      <Badge style={{ backgroundColor: TotalColors.Blue }}>
                        <div
                          className="px-1.5 py-0.5"
                          style={{ fontSize: '0.95rem' }}
                        >
                          {formatMoney(
                            totalsData[currency]?.invoices?.invoiced_amount ||
                              0,
                            company.settings.country_id,
                            currency.toString(),
                            2
                          )}
                        </div>
                      </Badge>
                    </div>

                    <div
                      style={{ borderColor: colors.$4 }}
                      className="flex justify-between items-center border-b py-3 px-6"
                    >
                      <span style={{ fontSize: '0.95rem' }}>
                        {t('payments')}
                      </span>
                      <Badge style={{ backgroundColor: TotalColors.Green }}>
                        <div
                          className="px-1.5 py-0.5"
                          style={{ fontSize: '0.95rem' }}
                        >
                          {formatMoney(
                            totalsData[currency]?.revenue?.paid_to_date || 0,
                            company.settings.country_id,
                            currency.toString(),
                            2
                          )}
                        </div>
                      </Badge>
                    </div>

                    <div
                      style={{ borderColor: colors.$4 }}
                      className="flex justify-between items-center border-b py-3 px-6"
                    >
                      <span style={{ fontSize: '0.95rem' }}>
                        {t('expenses')}
                      </span>
                      <Badge style={{ backgroundColor: TotalColors.Gray }}>
                        <div
                          className="px-1.5 py-0.5"
                          style={{ fontSize: '0.95rem' }}
                        >
                          {formatMoney(
                            totalsData[currency]?.expenses?.amount || 0,
                            company.settings.country_id,
                            currency.toString(),
                            2
                          )}
                        </div>
                      </Badge>
                    </div>

                    <div
                      style={{ borderColor: colors.$4 }}
                      className="flex justify-between items-center border-b py-3 px-6"
                    >
                      <span style={{ fontSize: '0.95rem' }}>
                        {t('outstanding')}
                      </span>
                      <Badge style={{ backgroundColor: TotalColors.Red }}>
                        <div
                          className="px-1.5 py-0.5"
                          style={{ fontSize: '0.95rem' }}
                        >
                          {formatMoney(
                            totalsData[currency]?.outstanding?.amount || 0,
                            company.settings.country_id,
                            currency.toString(),
                            2
                          )}
                        </div>
                      </Badge>
                    </div>

                    <div
                      style={{ borderColor: colors.$4 }}
                      className="flex justify-between items-center border-b py-3 px-6"
                    >
                      <span style={{ fontSize: '0.95rem' }}>
                        {t('total_invoices_outstanding')}
                      </span>

                      <Badge variant="white">
                        <div
                          className="px-1.5 py-0.5"
                          style={{ fontSize: '0.95rem' }}
                        >
                          {totalsData[currency]?.outstanding
                            ?.outstanding_count || 0}
                        </div>
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : null}

          {chartData && !isCardRemoved('overview') ? (
            <div
              key="3"
              className={classNames('drag-handle', {
                'cursor-grab': isEditMode,
              })}
            >
              <Card
                title={t('overview')}
                className="col-span-12 xl:col-span-8 pr-4"
                height="full"
                withScrollableBody
                topRight={
                  isEditMode && (
                    <Button
                      className="cancelDraggingCards"
                      behavior="button"
                      type="secondary"
                      onClick={() => handleRemoveCard('overview')}
                    >
                      {t('remove')}
                    </Button>
                  )
                }
                renderFromShadcn
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
          ) : null}

          {!isCardRemoved('activity') ? (
            <div
              key="4"
              className={classNames('drag-handle', {
                'cursor-grab': isEditMode,
              })}
            >
              <Activity
                isEditMode={isEditMode}
                topRight={
                  isEditMode && (
                    <Button
                      className="cancelDraggingCards"
                      behavior="button"
                      type="secondary"
                      onClick={() => handleRemoveCard('activity')}
                    >
                      {t('remove')}
                    </Button>
                  )
                }
              />
            </div>
          ) : null}

          {!isCardRemoved('recent_payments') ? (
            <div
              key="5"
              className={classNames('drag-handle', {
                'cursor-grab': isEditMode,
              })}
            >
              <RecentPayments
                isEditMode={isEditMode}
                topRight={
                  isEditMode && (
                    <Button
                      className="cancelDraggingCards"
                      behavior="button"
                      type="secondary"
                      onClick={() => handleRemoveCard('recent_payments')}
                    >
                      {t('remove')}
                    </Button>
                  )
                }
              />
            </div>
          ) : null}

          {enabled(ModuleBitmask.Invoices) &&
          !isCardRemoved('upcoming_invoices') ? (
            <div
              key="6"
              className={classNames('drag-handle', {
                'cursor-grab': isEditMode,
              })}
            >
              <UpcomingInvoices
                isEditMode={isEditMode}
                topRight={
                  isEditMode && (
                    <Button
                      className="cancelDraggingCards"
                      behavior="button"
                      type="secondary"
                      onClick={() => handleRemoveCard('upcoming_invoices')}
                    >
                      {t('remove')}
                    </Button>
                  )
                }
              />
            </div>
          ) : null}

          {enabled(ModuleBitmask.Invoices) &&
          !isCardRemoved('past_due_invoices') ? (
            <div
              key="7"
              className={classNames('drag-handle', {
                'cursor-grab': isEditMode,
              })}
            >
              <PastDueInvoices
                isEditMode={isEditMode}
                topRight={
                  isEditMode && (
                    <Button
                      className="cancelDraggingCards"
                      behavior="button"
                      type="secondary"
                      onClick={() => handleRemoveCard('past_due_invoices')}
                    >
                      {t('remove')}
                    </Button>
                  )
                }
              />
            </div>
          ) : null}

          {enabled(ModuleBitmask.Quotes) && !isCardRemoved('expired_quotes') ? (
            <div
              key="8"
              className={classNames('drag-handle', {
                'cursor-grab': isEditMode,
              })}
            >
              <ExpiredQuotes
                isEditMode={isEditMode}
                topRight={
                  isEditMode && (
                    <Button
                      className="cancelDraggingCards"
                      behavior="button"
                      type="secondary"
                      onClick={() => handleRemoveCard('expired_quotes')}
                    >
                      {t('remove')}
                    </Button>
                  )
                }
              />
            </div>
          ) : null}

          {enabled(ModuleBitmask.Quotes) &&
          !isCardRemoved('upcoming_quotes') ? (
            <div
              key="9"
              className={classNames('drag-handle', {
                'cursor-grab': isEditMode,
              })}
            >
              <UpcomingQuotes
                isEditMode={isEditMode}
                topRight={
                  isEditMode && (
                    <Button
                      className="cancelDraggingCards"
                      behavior="button"
                      type="secondary"
                      onClick={() => handleRemoveCard('upcoming_quotes')}
                    >
                      {t('remove')}
                    </Button>
                  )
                }
              />
            </div>
          ) : null}

          {enabled(ModuleBitmask.RecurringInvoices) &&
          !isCardRemoved('upcoming_recurring_invoices') ? (
            <div
              key="10"
              className={classNames('drag-handle', {
                'cursor-grab': isEditMode,
              })}
            >
              <UpcomingRecurringInvoices
                isEditMode={isEditMode}
                topRight={
                  isEditMode && (
                    <Button
                      className="cancelDraggingCards"
                      behavior="button"
                      type="secondary"
                      onClick={() =>
                        handleRemoveCard('upcoming_recurring_invoices')
                      }
                    >
                      {t('remove')}
                    </Button>
                  )
                }
              />
            </div>
          ) : null}
        </ResponsiveGridLayout>
        </>
      )}
      </>
      ) : (
        <div className="w-full flex justify-center">
          <Spinner />
        </div>
      )}
    </div>
  );
}
