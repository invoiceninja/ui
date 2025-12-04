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
import { Card } from '$app/components/cards';
import { useTranslation } from 'react-i18next';
import { request } from '$app/common/helpers/request';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { usePreferences } from '$app/common/hooks/usePreferences';
import collect from 'collect.js';
import { useQuery } from 'react-query';
import GridLayout from 'react-grid-layout';
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
import { Chart } from './Chart';
import { PreferenceCardsGrid } from './PreferenceCardsGrid';
import {
  DashboardRowLayout,
  convertFlatLayoutToRows,
  convertRowsToFlatLayout,
} from '../types/DashboardRowTypes';
import { DashboardRowContainer } from './DashboardRowContainer';

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

  const { update } = usePreferences();

  const enabled = useEnabled();
  const dispatch = useDispatch();

  const user = useCurrentUser();
  const company = useCurrentCompany();
  const settings = useReactSettings();

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  const [layoutBreakpoint] = useState<string>();
  const [layouts, setLayouts] = useState<DashboardGridLayouts>(initialLayouts);
  const [rowLayouts, setRowLayouts] = useState<{
    [bp: string]: DashboardRowLayout;
  }>({});

  const [isEditMode] = useState<boolean>(false);
  const [isLayoutsInitialized, setIsLayoutsInitialized] =
    useState<boolean>(false);
  const [isLayoutRestored] = useState<boolean>(false);
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

  useEffect(() => {
    setBody((current) => ({
      ...current,
      date_range: dateRange,
    }));
  }, [settings?.preferences?.dashboard_charts?.range]);


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

        // Convert flat layouts to row-based on initialization
        const convertedRowLayouts: { [bp: string]: DashboardRowLayout } = {};
        Object.entries(settings.dashboard_cards_configuration).forEach(
          ([bp, flatLayout]) => {
            convertedRowLayouts[bp] = {
              rows: convertFlatLayoutToRows(flatLayout as GridLayout.Layout[]),
            };
          }
        );
        setRowLayouts(convertedRowLayouts);

        setIsLayoutsInitialized(true);
      }
    }
  }, [layoutBreakpoint]);

  // Initialize row layouts from flat layouts if not already set
  useEffect(() => {
    if (layoutBreakpoint && layouts[layoutBreakpoint] && !rowLayouts[layoutBreakpoint]) {
      setRowLayouts((current) => ({
        ...current,
        [layoutBreakpoint]: {
          rows: convertFlatLayoutToRows(layouts[layoutBreakpoint]),
        },
      }));
    }
  }, [layoutBreakpoint, layouts]);

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

  // Panel rendering function for row-based layout
  const renderPanel = (panelId: string): React.ReactNode => {
    if (panelId === '0') {
      return (
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
                {currencies.map((curr, index) => (
                  <option key={index} value={curr.value}>
                    {curr.label}
                  </option>
                ))}
              </SelectField>
            )}
          </div>
        </div>
      );
    }

    if (panelId === '1' && currentDashboardFields?.length) {
      return (
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
      );
    }

    if (panelId === '2' && company && !isCardRemoved('account_login_text')) {
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
            {/* Account login card content - same as before */}
            <div className="pb-8">
              <div className="flex flex-col space-y-1 px-6">
                <span className="text-lg">{`${user?.first_name} ${user?.last_name}`}</span>
                <span className="text-sm text-gray-500">
                  {t('recent_transactions')}
                </span>
              </div>
              {/* Add rest of account login content here */}
            </div>
          </Card>
        </div>
      );
    }

    if (panelId === '3' && chartData && !isCardRemoved('overview')) {
      return (
        <div
          className={classNames('drag-handle', {
            'cursor-grab': isEditMode,
          })}
        >
          <Card
            title={t('overview')}
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
    }

    if (panelId === '4' && !isCardRemoved('activity')) {
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
    }

    if (panelId === '5' && !isCardRemoved('recent_payments')) {
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
    }

    if (panelId === '6' && enabled(ModuleBitmask.Invoices) && !isCardRemoved('upcoming_invoices')) {
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
    }

    if (panelId === '7' && enabled(ModuleBitmask.Invoices) && !isCardRemoved('past_due_invoices')) {
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
    }

    if (panelId === '8' && enabled(ModuleBitmask.Quotes) && !isCardRemoved('expired_quotes')) {
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
    }

    if (panelId === '9' && enabled(ModuleBitmask.Quotes) && !isCardRemoved('upcoming_quotes')) {
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
    }

    if (panelId === '10' && enabled(ModuleBitmask.RecurringInvoices) && !isCardRemoved('upcoming_recurring_invoices')) {
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
    }

    return null;
  };

  // Handler for row-based layout changes
  const handleRowLayoutChange = (newRowLayout: DashboardRowLayout) => {
    if (!layoutBreakpoint) return;

    // Update row layouts
    setRowLayouts((current) => ({
      ...current,
      [layoutBreakpoint]: newRowLayout,
    }));

    // Also update flat layouts for compatibility
    const flatLayout = convertRowsToFlatLayout(newRowLayout.rows);
    setLayouts((current) => ({
      ...current,
      [layoutBreakpoint]: flatLayout,
    }));
  };

  return (
    <div className={classNames('w-full', { 'select-none': isEditMode, 'dashboard-edit-mode': isEditMode })}>
     {!totals.isLoading ? (
       <>
         {layoutBreakpoint && rowLayouts[layoutBreakpoint] && (
           <DashboardRowContainer
             layout={rowLayouts[layoutBreakpoint]}
             breakpoint={layoutBreakpoint}
             isEditMode={isEditMode}
             onLayoutChange={handleRowLayoutChange}
             renderPanel={renderPanel}
             cols={{
               xxl: 12,
               xl: 12,
               lg: 12,
               md: 12,
               sm: 12,
               xs: 12,
               xxs: 12,
             }}
           />
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
