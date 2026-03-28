/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from '$app/common/hooks/useTitle';
import { Activity } from '$app/pages/dashboard/components/Activity';
import { PastDueInvoices } from '$app/pages/dashboard/components/PastDueInvoices';
import { RecentPayments } from '$app/pages/dashboard/components/RecentPayments';
import { Totals } from '$app/pages/dashboard/components/Totals';
import { UpcomingInvoices } from '$app/pages/dashboard/components/UpcomingInvoices';
import { useTranslation } from 'react-i18next';
import { Default } from '../../components/layouts/Default';
import { ExpiredQuotes } from './components/ExpiredQuotes';
import { UpcomingQuotes } from './components/UpcomingQuotes';
import { useEnabled } from '$app/common/guards/guards/enabled';
import { ModuleBitmask } from '../settings';
import { UpcomingRecurringInvoices } from './components/UpcomingRecurringInvoices';
import { useSocketEvent } from '$app/common/queries/sockets';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useOpenFeedbackSlider } from '$app/common/hooks/useOpenFeedbackSlider';
import { useEffect } from 'react';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { DashboardCardSelector } from './components/DashboardCardSelector';
import { PreferenceCardsGrid } from './components/PreferenceCardsGrid';
import dayjs from 'dayjs';

export default function Dashboard() {
  useTitle('dashboard');

  const [t] = useTranslation();

  const enabled = useEnabled();
  const openFeedbackSlider = useOpenFeedbackSlider();

  const reactSettings = useReactSettings();

  useSocketEvent({
    on: 'App\\Events\\Invoice\\InvoiceWasPaid',
    callback: () => $refetch(['invoices']),
  });

  useEffect(() => {
    openFeedbackSlider();
  }, []);

  const dateRange =
    reactSettings.preferences.dashboard_charts.range ?? 'this_month';

  const { start: startDate, end: endDate } = (() => {
    const now = dayjs();
    const ranges: Record<string, { start: string; end: string }> = {
      last7_days: {
        start: now.subtract(7, 'day').format('YYYY-MM-DD'),
        end: now.format('YYYY-MM-DD'),
      },
      last30_days: {
        start: now.subtract(30, 'day').format('YYYY-MM-DD'),
        end: now.format('YYYY-MM-DD'),
      },
      this_month: {
        start: now.startOf('month').format('YYYY-MM-DD'),
        end: now.endOf('month').format('YYYY-MM-DD'),
      },
      last_month: {
        start: now.subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
        end: now.subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
      },
      this_quarter: {
        start: now.startOf('quarter').format('YYYY-MM-DD'),
        end: now.endOf('quarter').format('YYYY-MM-DD'),
      },
      last_quarter: {
        start: now
          .subtract(1, 'quarter')
          .startOf('quarter')
          .format('YYYY-MM-DD'),
        end: now.subtract(1, 'quarter').endOf('quarter').format('YYYY-MM-DD'),
      },
      this_year: {
        start: now.startOf('year').format('YYYY-MM-DD'),
        end: now.format('YYYY-MM-DD'),
      },
      last_year: {
        start: now.subtract(1, 'year').startOf('year').format('YYYY-MM-DD'),
        end: now.subtract(1, 'year').endOf('year').format('YYYY-MM-DD'),
      },
      last365_days: {
        start: now.subtract(365, 'day').format('YYYY-MM-DD'),
        end: now.format('YYYY-MM-DD'),
      },
    };
    return (
      ranges[dateRange] ?? {
        start: now.startOf('month').format('YYYY-MM-DD'),
        end: now.endOf('month').format('YYYY-MM-DD'),
      }
    );
  })();

  const currencyId =
    reactSettings.preferences.dashboard_charts.currency?.toString() ?? '1';

  const dashboardFields = reactSettings.dashboard_fields ?? [];

  return (
    <Default title={t('dashboard')} breadcrumbs={[]}>
      <Totals />

      {dashboardFields.length > 0 && (
        <div className="my-6">
          <PreferenceCardsGrid
            fields={dashboardFields}
            dateRange={dateRange}
            startDate={startDate}
            endDate={endDate}
            currencyId={currencyId}
          />
        </div>
      )}

      <div className="flex justify-end mb-2">
        <DashboardCardSelector />
      </div>

      <div className="grid grid-cols-12 gap-8 my-8">
        <div className="col-span-12 xl:col-span-6">
          <Activity />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <RecentPayments />
        </div>

        {enabled(ModuleBitmask.Invoices) && (
          <div className="col-span-12 xl:col-span-6">
            <UpcomingInvoices />
          </div>
        )}

        {enabled(ModuleBitmask.Invoices) && (
          <div className="col-span-12 xl:col-span-6">
            <PastDueInvoices />
          </div>
        )}

        {enabled(ModuleBitmask.Quotes) && (
          <div className="col-span-12 xl:col-span-6">
            <ExpiredQuotes />
          </div>
        )}

        {enabled(ModuleBitmask.Quotes) && (
          <div className="col-span-12 xl:col-span-6">
            <UpcomingQuotes />
          </div>
        )}

        {enabled(ModuleBitmask.RecurringInvoices) && (
          <div className="col-span-12 xl:col-span-6">
            <UpcomingRecurringInvoices />
          </div>
        )}
      </div>
    </Default>
  );
}
