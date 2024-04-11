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

export default function Dashboard() {
  const [t] = useTranslation();
  useTitle('dashboard');

  const enabled = useEnabled();

  return (
    <Default title={t('dashboard')} withoutBackButton>
      <Totals />

      <div className="grid grid-cols-12 gap-4 my-6">
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
