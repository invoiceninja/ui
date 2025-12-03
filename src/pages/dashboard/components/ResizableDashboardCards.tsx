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
  compactLayout,
  normalizeRowHeights,
  enforceConstraints,
  enforceRowConstraints,
} from '../utils/layoutHelpers';

const ResponsiveGridLayout = WidthProvider(Responsive);

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
  xxl: [
    {
      i: '0',
      x: 300,
      y: 0,
      w: 1000,
      h: 2.8,
      isResizable: false,
      static: true,
    },
    {
      i: '1',
      x: 0,
      y: 1,
      w: 1000,
      h: 6.3,
      isResizable: false,
    },
    {
      i: '2',
      x: 0,
      y: 2,
      w: 330,
      h: 25.4,
      minH: 20,
      minW: 250,
      maxH: 30,
      maxW: 400,
    },
    {
      i: '3',
      x: 400,
      y: 2,
      w: 660,
      h: 25.4,
      minH: 20,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '4',
      x: 0,
      y: 3,
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
      y: 3,
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
      y: 4,
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
      y: 4,
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
      y: 5,
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
      y: 5,
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
      y: 6,
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
      i: '0',
      x: 300,
      y: 0,
      w: 1000,
      h: 2.8,
      isResizable: false,
      static: true,
    },
    {
      i: '1',
      x: 0,
      y: 1,
      w: 1000,
      h: 6.3,
      isResizable: false,
    },
    {
      i: '2',
      x: 0,
      y: 2,
      w: 330,
      h: 25.4,
      minH: 20,
      minW: 250,
      maxH: 30,
      maxW: 400,
    },
    {
      i: '3',
      x: 400,
      y: 2,
      w: 660,
      h: 25.4,
      minH: 20,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '4',
      x: 0,
      y: 3,
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
      y: 3,
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
      y: 4,
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
      y: 4,
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
      y: 5,
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
      y: 5,
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
      y: 6,
      w: 495,
      h: 20,
      minH: 16,
      minW: 350,
      maxH: 30,
      maxW: 700,
    },
  ],
  lg: [
    {
      i: '0',
      x: 300,
      y: 0,
      w: 1000,
      h: 2.8,
      isResizable: false,
      static: true,
    },
    {
      i: '1',
      x: 0,
      y: 1,
      w: 1000,
      h: 7.3,
      isResizable: false,
    },
    {
      i: '2',
      x: 0,
      y: 2,
      w: 330,
      h: 25.4,
      minH: 20,
      minW: 250,
      maxH: 30,
      maxW: 400,
    },
    {
      i: '3',
      x: 400,
      y: 2,
      w: 660,
      h: 25.4,
      minH: 20,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '4',
      x: 0,
      y: 3,
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
      y: 3,
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
      y: 4,
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
      y: 4,
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
      y: 5,
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
      y: 5,
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
      y: 6,
      w: 495,
      h: 20,
      minH: 16,
      minW: 350,
      maxH: 30,
      maxW: 700,
    },
  ],
  md: [
    {
      i: '0',
      x: 300,
      y: 0,
      w: 1000,
      h: 2.8,
      isResizable: false,
      static: true,
    },
    {
      i: '1',
      x: 0,
      y: 1,
      w: 1000,
      h: 6.3,
      isResizable: false,
    },
    {
      i: '2',
      x: 0,
      y: 1,
      w: 1000,
      h: 25.4,
      minH: 20,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '3',
      x: 0,
      y: 2,
      w: 1000,
      h: 25.4,
      minH: 20,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '4',
      x: 0,
      y: 3,
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
      y: 4,
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
      y: 5,
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
      y: 6,
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
      y: 7,
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
      y: 8,
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
      y: 9,
      w: 1000,
      h: 20,
      minH: 16,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
  ],
  sm: [
    {
      i: '0',
      x: 300,
      y: 0,
      w: 1000,
      h: 2.8,
      isResizable: false,
      static: true,
    },
    {
      i: '1',
      x: 0,
      y: 1,
      w: 1000,
      h: 6.3,
      isResizable: false,
    },
    {
      i: '2',
      x: 0,
      y: 1,
      w: 1000,
      h: 25.4,
      minH: 20,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '3',
      x: 0,
      y: 2,
      w: 1000,
      h: 25.4,
      minH: 20,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '4',
      x: 0,
      y: 3,
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
      y: 4,
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
      y: 5,
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
      y: 6,
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
      y: 7,
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
      y: 8,
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
      y: 9,
      w: 1000,
      h: 20,
      minH: 16,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
  ],
  xs: [
    {
      i: '0',
      x: 300,
      y: 0,
      w: 1000,
      h: 2.8,
      isResizable: false,
      static: true,
    },
    {
      i: '1',
      x: 0,
      y: 1,
      w: 1000,
      h: 6.3,
      isResizable: false,
    },
    {
      i: '2',
      x: 0,
      y: 1,
      w: 1000,
      h: 25.4,
      minH: 20,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '3',
      x: 0,
      y: 2,
      w: 1000,
      h: 25.4,
      minH: 20,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '4',
      x: 0,
      y: 3,
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
      y: 4,
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
      y: 5,
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
      y: 6,
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
      y: 7,
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
      y: 8,
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
      y: 9,
      w: 1000,
      h: 20,
      minH: 16,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
  ],
  xxs: [
    {
      i: '0',
      x: 300,
      y: 0,
      w: 1000,
      h: 2.8,
      isResizable: false,
      static: true,
    },
    {
      i: '1',
      x: 0,
      y: 1,
      w: 1000,
      h: 6.3,
      isResizable: false,
    },
    {
      i: '2',
      x: 0,
      y: 1,
      w: 1000,
      h: 25.4,
      minH: 20,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '3',
      x: 0,
      y: 2,
      w: 1000,
      h: 25.4,
      minH: 20,
      minW: 400,
      maxH: 30,
      maxW: 1000,
    },
    {
      i: '4',
      x: 0,
      y: 3,
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
      y: 4,
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
      y: 5,
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
      y: 6,
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
      y: 7,
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
      y: 8,
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
      y: 9,
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
    oldItem: GridLayout.Layout,
    newItem: GridLayout.Layout
  ) => {
    if (layoutBreakpoint) {
      // Enforce constraints and normalize row heights
      let updatedLayout = layout.map((item) => {
        if (item.i === newItem.i) {
          return newItem;
        }
        return item;
      });

      updatedLayout = enforceConstraints(updatedLayout);
      updatedLayout = normalizeRowHeights(updatedLayout);

      setLayouts((current) => ({
        ...current,
        [layoutBreakpoint]: updatedLayout,
      }));
    }
  };

  const onDragStop = (layout: GridLayout.Layout[]) => {
    if (!layoutBreakpoint) return;

    // Apply row constraints first to snap items to rows
    let updatedLayout = cloneDeep(layout);
    
    // Enforce row constraints - snap to rows and preserve row heights
    updatedLayout = enforceRowConstraints(updatedLayout);
    
    // Compact vertically while preserving row heights
    updatedLayout = compactLayout(updatedLayout, true);

    setLayouts((current) => ({
      ...current,
      [layoutBreakpoint]: cloneDeep(updatedLayout),
    }));
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
    const isDraggingDown = newItem.y > placeholder.y;

    //handleScroll(isDraggingDown);

    if (newItem.i.length > 5) return;

    if (!isDraggingDown) return;

    const itemsBelow = layout.filter(
      (item) => item.y > oldItem.y && item.i !== oldItem.i
    );

    if (itemsBelow.length) {
      const closestItem = itemsBelow.reduce((closest, current) => {
        const isInSameColumn = Math.abs(current.x - oldItem.x) < 10;
        const isCloserVertically = current.y < closest.y;

        return isInSameColumn && isCloserVertically ? current : closest;
      }, itemsBelow[0]);

      const isDraggingTallerItem = oldItem.h > closestItem.h * 0.9;

      if (newItem.y > oldItem.h / 1.2 + oldItem.y && isDraggingTallerItem) {
        const oldX = oldItem.x;
        const oldY = oldItem.y;
        closestItem.x = oldX;
        closestItem.y = oldY;
      }
    }
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

 return (
    <div className={classNames('w-full', { 'select-none': isEditMode, 'dashboard-edit-mode': isEditMode })}>
     {!totals.isLoading ? (
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
          margin={[0, 20]}
          rowHeight={1}
          isDraggable={isEditMode}
          isDroppable={isEditMode}
          isResizable={isEditMode}
          onBreakpointChange={(currentBreakPoint) =>
            setLayoutBreakpoint(currentBreakPoint)
          }
         onResizeStop={onResizeStop}
         onDragStop={onDragStop}
         onLayoutChange={(current) =>
           (areCardsRestored || arePreferenceCardsChanged) &&
           handleOnLayoutChange(current)
         }
          resizeHandles={['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne']}
          compactType="vertical"
          preventCollision={false}
         draggableCancel=".cancelDraggingCards"
         onDrag={handleOnDrag}
        >
          {(totals.isLoading || !isLayoutsInitialized) && (
            <div className="w-full flex justify-center">
              <Spinner />
            </div>
          )}

          {/* Quick date, currency & date picker. */}

          <div key="0" className="flex justify-end">
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

          {currentDashboardFields?.length ? (
            <div key="1">
              <div
                className={classNames(
                  'absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 drag-handle',
                  {
                    'cursor-grab': isEditMode,
                    hidden: !isEditMode,
                  }
                )}
              >
                <Icon element={MdDragHandle} size={30} />
              </div>

              <PreferenceCardsGrid
                currentDashboardFields={currentDashboardFields}
                dateRange={dateRange}
                startDate={dates.start_date}
                endDate={dates.end_date}
                currencyId={currency.toString()}
                layoutBreakpoint={layoutBreakpoint}
                isEditMode={isEditMode}
                setMainLayouts={setLayouts}
                mainLayouts={layouts}
                isLayoutRestored={isLayoutRestored}
              />

              <div
                className={classNames(
                  'absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 drag-handle',
                  {
                    'cursor-grab': isEditMode,
                    hidden: !isEditMode,
                  }
                )}
              >
                <Icon element={MdDragHandle} size={30} />
              </div>
            </div>
          ) : null}

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
      ) : (
        <div className="w-full flex justify-center">
          <Spinner />
        </div>
      )}
    </div>
  );
}
