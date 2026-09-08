/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAtomValue } from 'jotai';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useEnabled } from '$app/common/guards/guards/enabled';
import { useOpenFeedbackSlider } from '$app/common/hooks/useOpenFeedbackSlider';
import { reactSettingsAtom } from '$app/common/hooks/useReactSettings';
import { useTitle } from '$app/common/hooks/useTitle';
import { Activity } from '$app/pages/dashboard/components/Activity';
import { PastDueInvoices } from '$app/pages/dashboard/components/PastDueInvoices';
import { RecentPayments } from '$app/pages/dashboard/components/RecentPayments';
import { Totals } from '$app/pages/dashboard/components/Totals';
import { UpcomingInvoices } from '$app/pages/dashboard/components/UpcomingInvoices';
import { Default } from '../../components/layouts/Default';
import { ModuleBitmask } from '../settings';
import { ExpiredQuotes } from './components/ExpiredQuotes';
import { UpcomingQuotes } from './components/UpcomingQuotes';
import { UpcomingRecurringInvoices } from './components/UpcomingRecurringInvoices';

export default function Dashboard() {
  useTitle('dashboard');

  const [t] = useTranslation();
  const enabled = useEnabled();
  const openFeedbackSlider = useOpenFeedbackSlider();
  // Try opening feedback once after settings hydrate.
  const isReactSettingsHydrated = useAtomValue(reactSettingsAtom) !== null;
  const feedbackTriedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isReactSettingsHydrated || feedbackTriedRef.current) return;
    feedbackTriedRef.current = true;
    openFeedbackSlider();
  }, [isReactSettingsHydrated, openFeedbackSlider]);

  return (
    <Default title={t('dashboard')} breadcrumbs={[]}>
      <Totals />

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
